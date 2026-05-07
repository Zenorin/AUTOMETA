import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  collectorFailureReasons,
  contractSchemaVersion,
  marketIds,
} from '../../contracts/dist/index.js';

const fixturePath = 'fixtures/deterministic-results.json';
const fixtureSet = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const allowedStatuses = new Set(['success', 'partial', 'failed']);
const allowedFailureReasons = new Set(collectorFailureReasons);
const allowedMarkets = new Set(marketIds);

function assertFixtureProvenance(provenance) {
  assert.equal(provenance.kind, 'fixture-provenance');
  assert.equal(provenance.fixtureId, fixtureSet.fixtureId);
  assert.equal(provenance.revision, fixtureSet.revision);
  assert.ok(['synthetic', 'sanitized'].includes(provenance.source));
  assert.equal(provenance.containsSecrets, false);
  assert.equal(provenance.containsSessionMaterial, false);
}

function assertStats(result) {
  assert.equal(typeof result.stats.requestedCount, 'number');
  assert.equal(typeof result.stats.collectedCount, 'number');
  assert.equal(typeof result.stats.skippedCount, 'number');
  assert.equal(typeof result.stats.failedCount, 'number');

  const accounted = result.stats.collectedCount + result.stats.skippedCount;
  assert.equal(accounted, result.stats.requestedCount);

  if (result.status === 'success') {
    assert.equal(result.stats.failedCount, 0);
  }

  if (result.status === 'partial' || result.status === 'failed') {
    assert.equal(result.stats.failedCount, result.failures.length);
  }
}

function assertFailureContract(failure) {
  assert.equal(failure.kind, 'partial-failure');
  assert.ok(allowedFailureReasons.has(failure.reason));
  assert.ok(['warning', 'recoverable', 'fatal'].includes(failure.severity));
  assert.equal(typeof failure.message, 'string');
  assert.equal(typeof failure.occurredAt, 'string');
  assert.equal(failure.location.kind, 'market');
  assert.ok(allowedMarkets.has(failure.location.market));
  assert.equal(failure.retry.kind, 'retry-state');
}

function assertNormalizedProduct(product, expectedMarket) {
  assert.equal(product.kind, 'normalized-product');
  assert.equal(product.schemaVersion, contractSchemaVersion);
  assert.equal(product.source.market, expectedMarket);
  assert.equal(typeof product.productId, 'string');
  assert.equal(typeof product.title, 'string');
  assert.ok(Array.isArray(product.categoryPath));
  assert.equal(typeof product.offer.price.amountMinor, 'number');
  assert.equal(typeof product.offer.price.currency, 'string');
  assert.ok(Array.isArray(product.images));
  assert.ok(Array.isArray(product.attributes));
}

function assertRawSnapshot(raw, expectedJobId) {
  assert.equal(raw.kind, 'collector-raw-snapshot');
  assert.equal(raw.schemaVersion, contractSchemaVersion);
  assert.equal(raw.jobId, expectedJobId);
  assert.ok(allowedMarkets.has(raw.market));
  assert.equal(raw.entry.url.startsWith('https://fixture.invalid/'), true);
  assert.equal(raw.body.serialization, 'not-persisted');
  assert.equal(raw.body.redaction, 'html-and-script-content-excluded');
  assert.equal(raw.credentialBoundary.cookies, 'not-collected');
  assert.equal(raw.credentialBoundary.credentials, 'not-collected');
  assert.equal(raw.credentialBoundary.sessionMaterial, 'metadata-only');
  assert.ok(Array.isArray(raw.headers));
  assert.ok(Array.isArray(raw.fields));
}

function assertFixtureCollectorResult(result, expectedInput) {
  assert.equal(result.kind, 'fixture-collector-result');
  assert.equal(result.schemaVersion, contractSchemaVersion);
  assert.equal(result.jobId, expectedInput.jobId);
  assert.equal(result.requestId, expectedInput.requestId);
  assert.equal(result.correlationId, expectedInput.correlationId);
  assert.equal(result.sourceType, 'fixture');
  assertFixtureProvenance(result.fixture);

  assert.equal(result.result.kind, 'collector-result');
  assert.equal(result.result.schemaVersion, contractSchemaVersion);
  assert.equal(result.result.jobId, expectedInput.jobId);
  assert.ok(allowedStatuses.has(result.result.status));
  assert.ok(allowedMarkets.has(result.result.market));
  assertStats(result.result);

  if (result.result.status === 'success') {
    assert.ok(Array.isArray(result.result.products));
    assert.equal('failures' in result.result, false);
  }

  if (result.result.status === 'partial') {
    assert.ok(Array.isArray(result.result.products));
    assert.ok(Array.isArray(result.result.failures));
    result.result.failures.forEach(assertFailureContract);
  }

  if (result.result.status === 'failed') {
    assert.equal('products' in result.result, false);
    assert.ok(Array.isArray(result.result.failures));
    result.result.failures.forEach(assertFailureContract);
  }

  if ('products' in result.result) {
    result.result.products.forEach((product) => assertNormalizedProduct(product, result.result.market));
  }
}

test('deterministic collector fixtures declare synthetic provenance', () => {
  assert.equal(fixtureSet.kind, 'deterministic-fixture-collector-fixture-set');
  assert.equal(fixtureSet.schemaVersion, contractSchemaVersion);
  assert.equal(fixtureSet.fixtureId, 'deterministic-collector-fixtures');
  assert.equal(fixtureSet.revision, 'wbs-13.2026-05-07');
  assert.match(fixtureSet.provenanceNote, /Synthetic WBS-13 fixture set/);
  assert.ok(Array.isArray(fixtureSet.examples));
  assert.equal(fixtureSet.examples.length, 3);
});

test('fixture inputs and outputs match shared collector contract vocabulary', () => {
  const statuses = new Set();
  const failureReasons = new Set();

  for (const example of fixtureSet.examples) {
    assert.equal(example.kind, 'deterministic-fixture-collector-example');
    assert.equal(example.input.kind, 'fixture-collector-input');
    assert.equal(example.input.schemaVersion, contractSchemaVersion);
    assert.equal(example.input.sourceType, 'fixture');
    assert.equal('sessionBoundary' in example.input, false);
    assertFixtureProvenance(example.input.fixture);

    example.raw.forEach((raw) => assertRawSnapshot(raw, example.input.jobId));
    assertFixtureCollectorResult(example.normalized, example.input);

    statuses.add(example.normalized.result.status);
    if ('failures' in example.normalized.result) {
      example.normalized.result.failures.forEach((failure) => failureReasons.add(failure.reason));
    }
  }

  assert.deepEqual([...statuses].sort(), ['failed', 'partial', 'success']);
  assert.deepEqual([...failureReasons].sort(), ['rate-limited', 'unsupported-market']);
});

test('fixtures keep raw metadata separate from normalized results', () => {
  for (const example of fixtureSet.examples) {
    assert.ok(Array.isArray(example.raw));
    assert.equal('raw' in example.normalized, false);
    assert.equal('fields' in example.normalized.result, false);
    assert.equal('headers' in example.normalized.result, false);
    assert.equal('body' in example.normalized.result, false);
  }
});

test('fixtures do not include live marketplace or credential material', () => {
  const serialized = JSON.stringify(fixtureSet);
  assert.equal(serialized.includes('http://'), false);
  assert.equal(serialized.includes('https://www.'), false);
  assert.equal(serialized.includes('https://m.'), false);
  assert.equal(serialized.includes('COUPANG-FIXTURE-002'), true);
  assert.equal(serialized.includes('NAVER-FIXTURE-001'), true);
  assert.equal(serialized.includes('fixture.invalid'), true);

  for (const forbiddenValue of ['accessToken', 'refreshToken', 'bearer ', 'password=', 'sessionRef']) {
    assert.equal(serialized.includes(forbiddenValue), false);
  }
});
