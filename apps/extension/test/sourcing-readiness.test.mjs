import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  SOURCING_JOB_FIXTURE_REQUEST,
  SOURCING_JOB_READY_CHECK,
  SOURCING_JOB_STATUS_QUERY,
  fixtureTrustedSenderId,
  handleExtensionBoundaryMessage,
} from '../dist/background.js';
import { contentScriptBoundary } from '../dist/content.js';

const sender = { id: fixtureTrustedSenderId };

test('fixture-only readiness message returns allowed boundary', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_READY_CHECK,
      payload: { sourceType: 'fixture' },
    }),
    sender,
  );

  assert.equal(response.ok, true);
  assert.equal(response.data.kind, 'extension-sourcing-job-readiness');
  assert.equal(response.data.allowed, true);
  assert.equal(response.data.ready, true);
  assert.equal(response.data.sourceType, 'fixture');
  assert.equal(response.data.status, 'completed');
  assert.equal(response.data.apiBoundary.createRoute, 'POST /api/v1/sourcing/jobs');
  assert.equal(response.data.resultSummary.itemCount, 2);
  assert.equal(response.data.resultSummary.failureCount, 2);
});

test('fixture request and status query return deterministic sourcing job readiness', () => {
  const fixtureResponse = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_FIXTURE_REQUEST,
      payload: { sourceType: 'fixture', jobId: 'job-fixture-core-validation' },
    }),
    sender,
  );
  const statusResponse = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_STATUS_QUERY,
      payload: { jobId: 'job-fixture-core-validation' },
    }),
    sender,
  );

  assert.equal(fixtureResponse.ok, true);
  assert.equal(statusResponse.ok, true);
  assert.equal(fixtureResponse.data.jobId, 'job-fixture-core-validation');
  assert.equal(statusResponse.data.kind, 'extension-sourcing-job-status');
  assert.equal(statusResponse.data.status, 'completed');
  assert.deepEqual(statusResponse.data.progress, {
    completedUnits: 8,
    totalUnits: 8,
    updatedAt: '2026-05-07T00:00:05.000Z',
  });
});

test('unsupported live or external source is rejected', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_READY_CHECK,
      payload: { sourceType: 'manual-product-url' },
    }),
    sender,
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.kind, 'error-envelope');
  assert.equal(response.error.code, 'validation-failed');
  assert.equal(response.error.retryable, false);
  assert.match(response.error.message, /Only fixture-only sourcing job readiness/);
});

test('unknown message still returns typed unsupported error', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: 'autometa.unknown',
      payload: {},
    }),
    sender,
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.kind, 'error-envelope');
  assert.equal(response.error.code, 'validation-failed');
  assert.equal(response.error.message, 'Unsupported or invalid scaffold command.');
});

test('untrusted sender remains rejected', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_READY_CHECK,
      payload: { sourceType: 'fixture' },
    }),
    { id: 'external-extension' },
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.code, 'forbidden');
});

test('readiness responses expose no private browser field names', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_READY_CHECK,
      payload: { sourceType: 'fixture' },
    }),
    sender,
  );
  const serialized = JSON.stringify(response);

  for (const forbidden of ['cookie', 'session', 'token', 'credential', 'localStorage']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('no marketplace URL access or browser automation is introduced', () => {
  const files = [
    fs.readFileSync('src/background.ts', 'utf8'),
    fs.readFileSync('src/content.ts', 'utf8'),
    fs.readFileSync('manifest.json', 'utf8'),
  ].join('\n');

  for (const forbidden of ['https://www.', 'https://m.', 'chrome.cookies', 'chrome.tabs', 'localStorage', 'document.cookie']) {
    assert.equal(files.includes(forbidden), false);
  }

  assert.equal(contentScriptBoundary.pageAccess, 'not-used');
  assert.equal(contentScriptBoundary.storageAccess, 'not-used');
  assert.equal(contentScriptBoundary.networkAccess, 'not-used');
});

function envelope(message) {
  return {
    kind: 'autometa.extension.request',
    requestId: 'req-extension-fixture',
    correlationId: 'corr-extension-fixture',
    source: 'web',
    sentAt: '2026-05-07T00:00:00.000Z',
    message,
  };
}
