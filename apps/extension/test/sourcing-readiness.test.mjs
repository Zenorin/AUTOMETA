import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  SOURCING_JOB_CANCEL_REQUEST,
  SOURCING_JOB_FIXTURE_REQUEST,
  SOURCING_JOB_READY_CHECK,
  SOURCING_JOB_RETRY_REQUEST,
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
  assert.equal(response.data.apiBoundary.cancelRoute, 'POST /api/v1/sourcing/jobs/{job_id}/cancel');
  assert.equal(response.data.apiBoundary.retryRoute, 'POST /api/v1/sourcing/jobs/{job_id}/retry');
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
  assert.equal(statusResponse.data.cancellable, false);
  assert.equal(statusResponse.data.retryable, false);
  assert.deepEqual(statusResponse.data.progress, {
    completedUnits: 8,
    totalUnits: 8,
    updatedAt: '2026-05-07T00:00:05.000Z',
  });
});

test('local API status readiness exposes cancellable and retryable lifecycle states', () => {
  const expected = [
    ['queued', true, false, 0],
    ['running', true, false, 1],
    ['completed', false, false, 8],
    ['failed', false, true, 8],
    ['cancelled', false, true, 8],
  ];

  for (const [status, cancellable, retryable, completedUnits] of expected) {
    const response = handleExtensionBoundaryMessage(
      envelope({
        type: SOURCING_JOB_STATUS_QUERY,
        payload: { jobId: 'job-fixture-core-validation', status },
      }),
      sender,
    );

    assert.equal(response.ok, true);
    assert.equal(response.data.kind, 'extension-sourcing-job-status');
    assert.equal(response.data.status, status);
    assert.equal(response.data.cancellable, cancellable);
    assert.equal(response.data.retryable, retryable);
    assert.equal(response.data.progress.completedUnits, completedUnits);
    assert.equal(response.data.apiBoundary.statusRoute, 'GET /api/v1/sourcing/jobs/{job_id}');
  }
});

test('cancel and retry lifecycle messages map to local API boundary transitions', () => {
  const cancelResponse = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_CANCEL_REQUEST,
      payload: { jobId: 'job-fixture-core-validation', status: 'queued' },
    }),
    sender,
  );
  const retryResponse = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_RETRY_REQUEST,
      payload: { jobId: 'job-fixture-core-validation', status: 'failed' },
    }),
    sender,
  );

  assert.equal(cancelResponse.ok, true);
  assert.equal(cancelResponse.data.kind, 'extension-local-api-lifecycle-readiness');
  assert.equal(cancelResponse.data.action, 'cancel');
  assert.equal(cancelResponse.data.status, 'cancelled');
  assert.equal(cancelResponse.data.transition, 'queued-to-cancelled');
  assert.equal(cancelResponse.data.apiBoundary.cancelRoute, 'POST /api/v1/sourcing/jobs/{job_id}/cancel');

  assert.equal(retryResponse.ok, true);
  assert.equal(retryResponse.data.kind, 'extension-local-api-lifecycle-readiness');
  assert.equal(retryResponse.data.action, 'retry');
  assert.equal(retryResponse.data.status, 'queued');
  assert.equal(retryResponse.data.transition, 'failed-to-queued');
  assert.equal(retryResponse.data.apiBoundary.retryRoute, 'POST /api/v1/sourcing/jobs/{job_id}/retry');
});

test('completed job cancel and retry lifecycle messages are rejected', () => {
  for (const type of [SOURCING_JOB_CANCEL_REQUEST, SOURCING_JOB_RETRY_REQUEST]) {
    const response = handleExtensionBoundaryMessage(
      envelope({
        type,
        payload: { jobId: 'job-fixture-core-validation', status: 'completed' },
      }),
      sender,
    );

    assert.equal(response.ok, false);
    assert.equal(response.error.kind, 'error-envelope');
    assert.equal(response.error.code, 'conflict');
    assert.match(response.error.message, /transition is not allowed/);
  }
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

test('private browser material fields are rejected without echoing unsafe keys', () => {
  const response = handleExtensionBoundaryMessage(
    envelope({
      type: SOURCING_JOB_STATUS_QUERY,
      payload: { jobId: 'job-fixture-core-validation', accessToken: 'not-accepted' },
    }),
    sender,
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.kind, 'error-envelope');
  assert.equal(response.error.code, 'validation-failed');
  assert.doesNotMatch(JSON.stringify(response), /accessToken|cookie|session|token|credential|localStorage/);
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

  for (const forbidden of ['https://www.', 'https://m.', 'chrome.cookies', 'chrome.tabs', 'localStorage', 'document.cookie', 'fetch(']) {
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
