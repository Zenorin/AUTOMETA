import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { register } from 'node:module';

import { contractSchemaVersion } from '../../contracts/dist/index.js';

const contractsDistUrl = new URL('../../contracts/dist/index.js', import.meta.url).href;
register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, nextResolve) {
      if (specifier === '@project/contracts/src/index') {
        return { url: ${JSON.stringify(contractsDistUrl)}, shortCircuit: true };
      }

      return nextResolve(specifier, context);
    }
  `)}`,
  import.meta.url,
);

const {
  corePipelineStages,
  normalizeFixtureCollectorResult,
  runDeterministicSourcingPipeline,
  validateCorePipelineInput,
  validateCorePipelineResult,
} = await import('../dist/index.js');

const fixtureSet = JSON.parse(fs.readFileSync('../collectors/fixtures/deterministic-results.json', 'utf8'));

function createCoreFixtureInput(overrides = {}) {
  return {
    kind: 'core-pipeline-input',
    schemaVersion: contractSchemaVersion,
    jobId: 'job-fixture-core-validation',
    requestId: 'req-fixture-core-validation',
    correlationId: 'corr-fixture-core-validation',
    requestedAt: '2026-05-07T00:00:00.000Z',
    completedAt: '2026-05-07T00:00:05.000Z',
    sourceType: 'fixture',
    fixture: fixtureSet.examples[0].input.fixture,
    collectorInputs: fixtureSet.examples.map((example) => example.input),
    rawSnapshots: fixtureSet.examples.flatMap((example) => example.raw),
    collectorResults: fixtureSet.examples.map((example) => example.normalized),
    ...overrides,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('fixture collector results are accepted as core pipeline input', () => {
  for (const example of fixtureSet.examples) {
    const normalized = normalizeFixtureCollectorResult(example.normalized, example.input.correlationId);
    assert.equal(normalized.ok, true);
    assert.equal(normalized.value.kind, 'fixture-collector-result');
    assert.equal(normalized.value.result.kind, 'collector-result');
  }

  const validated = validateCorePipelineInput(createCoreFixtureInput());
  assert.equal(validated.ok, true);
  assert.equal(validated.value.sourceType, 'fixture');
  assert.equal(validated.value.collectorResults.length, 3);
  assert.equal(validated.value.rawSnapshots.length, 2);
});

test('invalid fixture shape is rejected before pipeline execution', () => {
  const invalidResults = clone(fixtureSet.examples.map((example) => example.normalized));
  delete invalidResults[0].result.stats;

  const validated = validateCorePipelineInput(createCoreFixtureInput({ collectorResults: invalidResults }));

  assert.equal(validated.ok, false);
  assert.equal(validated.error.kind, 'error-envelope');
  assert.equal(validated.error.code, 'validation-failed');
});

test('deterministic fixture core output is stable', () => {
  const input = createCoreFixtureInput();
  const first = runDeterministicSourcingPipeline(input);
  const second = runDeterministicSourcingPipeline(input);

  assert.deepEqual(second, first);
  assert.equal(first.kind, 'core-pipeline-result');
  assert.equal(first.status, 'partial_failure');

  const validation = validateCorePipelineResult(first);
  assert.equal(validation.ok, true);
});

test('core output contains expected summary and status fields', () => {
  const result = runDeterministicSourcingPipeline(createCoreFixtureInput());

  assert.equal(result.kind, 'core-pipeline-result');
  assert.equal(result.ok, false);
  assert.equal(result.status, 'partial_failure');
  assert.equal(result.state, 'partial_failure');
  assert.equal(result.summary.kind, 'sourcing-job-result-summary');
  assert.equal(result.summary.jobId, 'job-fixture-core-validation');
  assert.equal(result.summary.status, 'partial_failure');
  assert.deepEqual(result.summary.collectorStatuses, ['success', 'partial', 'failed']);
  assert.deepEqual(result.summary.markets, ['naver', 'coupang', 'unknown']);
  assert.equal(result.summary.itemCount, 2);
  assert.equal(result.summary.failureCount, 2);
  assert.equal(result.snapshot.stage, 'summarize');
  assert.equal(result.snapshot.retry.status, 'scheduled');
  assert.equal(result.partialFailures.length, 2);
  assert.equal('raw' in result, false);

  const progressStages = result.events
    .filter((event) => event.kind === 'core-pipeline-progress')
    .map((event) => event.stage);
  assert.deepEqual(progressStages, [...corePipelineStages]);
  assert.ok(result.events.some((event) => event.kind === 'core-pipeline-log'));
  assert.ok(result.events.some((event) => event.kind === 'core-pipeline-failure'));
});
