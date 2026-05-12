import { existsSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = process.cwd();

test("AUTOMETA shell renders required WBS-06 boundaries", async () => {
  const server = await createServer({
    root,
    appType: "custom",
    logLevel: "error",
    server: {
      middlewareMode: true
    }
  });

  try {
    const mod = await server.ssrLoadModule("/src/App.tsx");
    assert.equal(typeof mod.App, "function", "src/App.tsx must export App");

    const html = renderToStaticMarkup(React.createElement(mod.App));

    const requiredSignals = [
      /AUTOMETA/i,
      /clean-room|clean room/i,
      /API/i,
      /sourcing workflow|workflow stages|pipeline/i,
      /reference-analysis|reference analysis/i,
      /contracts|schema/i,
      /extension|access boundary/i,
      /local-only|local only|credential/i,
      /No crawling|no live collection|no marketplace automation/i
    ];

    for (const signal of requiredSignals) {
      assert.match(html, signal);
    }
  } finally {
    await server.close();
  }
});

test("fixture job creation and status labels render", async () => {
  const html = await renderShell();

  for (const signal of [
    /Fixture-only sourcing job/i,
    /Local API lifecycle control/i,
    /Create local job/i,
    /Ready/i,
    /Creating/i,
    /Queued/i,
    /Running/i,
    /Completed/i,
    /Cancelled/i,
    /Failed/i,
    /Retrying/i,
    /API error/i
  ]) {
    assert.match(html, signal);
  }
});

test("create job action uses local API paths and renders state transition vocabulary", async () => {
  const mod = await loadAppModule();
  const calls = [];
  const fetcher = async (input, init = {}) => {
    calls.push({ input, init });
    if (input === "/api/v1/sourcing/jobs") {
      return jsonResponse(mod.fixtureJobCreatedEnvelope);
    }
    if (input === `/api/v1/sourcing/jobs/${mod.fixtureJobCreatedEnvelope.data.jobId}`) {
      return jsonResponse(mod.fixtureJobStatusEnvelope);
    }
    throw new Error(`Unexpected local API path ${input}`);
  };

  const created = await mod.createLocalSourcingJob(fetcher);
  const status = await mod.readLocalSourcingJob(fetcher, created.data.jobId);

  assert.equal(created.ok, true);
  assert.equal(status.ok, true);
  assert.deepEqual(
    calls.map((call) => [call.input, call.init.method ?? "GET"]),
    [
      ["/api/v1/sourcing/jobs", "POST"],
      ["/api/v1/sourcing/jobs/job-fixture-core-validation", "GET"]
    ]
  );
  assert.equal(mod.jobStatusToUiState(created.data.status), "queued");
  assert.equal(mod.jobStatusToUiState(status.data.status), "completed");
  assert.throws(() => mod.assertLocalApiBasePath("https://example.test/api/v1"), /same-origin/);
});

test("unsupported live source is visibly blocked", async () => {
  const html = await renderShell();

  assert.match(html, /Live source blocked/i);
  assert.match(html, /Invalid source rejected/i);
  assert.match(html, /Only fixture-backed sourcing jobs are available/i);
  assert.match(html, /Live marketplace access is visibly blocked/i);
});

test("rendered UI avoids sensitive field copy", async () => {
  const html = await renderShell();

  for (const forbidden of [/secret/i, /session/i, /cookie/i, /token/i, /credential/i]) {
    assert.doesNotMatch(html, forbidden);
  }
});

test("fixture result summary and status copy renders", async () => {
  const html = await renderShell();

  assert.match(html, /Fixture result summary/i);
  assert.match(html, /Job status/i);
  assert.match(html, /api-response/i);
  assert.match(html, /success, partial, failed/i);
  assert.match(html, /Items/i);
  assert.match(html, /Failures/i);
});

test("cancel button appears only for cancellable states", async () => {
  const mod = await loadAppModule();
  const queuedHtml = renderToStaticMarkup(
    React.createElement(mod.App, { initialJobStatus: statusFor(mod, "queued") })
  );
  const completedHtml = renderToStaticMarkup(
    React.createElement(mod.App, { initialJobStatus: statusFor(mod, "completed") })
  );

  assert.match(queuedHtml, />Cancel job</);
  assert.doesNotMatch(completedHtml, />Cancel job</);
  assert.match(completedHtml, /Unavailable/i);
});

test("retry button appears only for retryable states", async () => {
  const mod = await loadAppModule();
  const failedHtml = renderToStaticMarkup(
    React.createElement(mod.App, { initialJobStatus: statusFor(mod, "failed") })
  );
  const cancelledHtml = renderToStaticMarkup(
    React.createElement(mod.App, { initialJobStatus: statusFor(mod, "cancelled") })
  );
  const completedHtml = renderToStaticMarkup(
    React.createElement(mod.App, { initialJobStatus: statusFor(mod, "completed") })
  );

  assert.match(failedHtml, />Retry job</);
  assert.match(cancelledHtml, />Retry job</);
  assert.doesNotMatch(completedHtml, />Retry job</);
});

test("completed job cannot be cancelled or retried", async () => {
  const mod = await loadAppModule();

  assert.equal(mod.isCancellableJobStatus("completed"), false);
  assert.equal(mod.isRetryableJobStatus("completed"), false);
  assert.equal(mod.isCancellableJobStatus("queued"), true);
  assert.equal(mod.isRetryableJobStatus("failed"), true);
});

test("API error envelope renders safely without leaking internals", async () => {
  const mod = await loadAppModule();
  const html = renderToStaticMarkup(
    React.createElement(mod.App, {
      initialError: {
        kind: "error-envelope",
        schemaVersion: mod.fixtureJobStatusEnvelope.data.schemaVersion,
        code: "validation-failed",
        message: "Do not show cookie or token details.",
        correlationId: "web-error-correlation",
        retryable: false,
        details: [{ kind: "field", field: "body", issue: "unsupported" }]
      },
      initialUiState: "api-error"
    })
  );

  assert.match(html, /The local API returned a typed error envelope/i);
  assert.doesNotMatch(html, /cookie|session|token|credential/i);
});

test("apps/web has package.json", () => {
  assert.equal(existsSync(join(root, "package.json")), true);
});

test("apps/web has index.html", () => {
  assert.equal(existsSync(join(root, "index.html")), true);
});

test("apps/web has src/App.tsx", () => {
  assert.equal(existsSync(join(root, "src", "App.tsx")), true);
});

test("apps/web has src/main.tsx", () => {
  assert.equal(existsSync(join(root, "src", "main.tsx")), true);
});

async function renderShell() {
  const mod = await loadAppModule();
  return renderToStaticMarkup(React.createElement(mod.App));
}

async function loadAppModule() {
  const server = await createServer({
    root,
    appType: "custom",
    logLevel: "error",
    server: {
      middlewareMode: true
    }
  });

  try {
    return await server.ssrLoadModule("/src/App.tsx");
  } finally {
    await server.close();
  }
}

function statusFor(mod, status) {
  const base = mod.fixtureJobStatusEnvelope.data;
  return {
    ...base,
    status,
    progress: {
      ...base.progress,
      stage: status
    },
    resultSummary: {
      ...base.resultSummary,
      status
    }
  };
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
