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
    /WBS-15 API boundary preview/i,
    /Create fixture job/i,
    /Ready/i,
    /Creating/i,
    /Queued/i,
    /Completed/i,
    /Failed/i
  ]) {
    assert.match(html, signal);
  }
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

  for (const forbidden of [/secret/i, /session/i, /cookie/i, /token/i]) {
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
    return renderToStaticMarkup(React.createElement(mod.App));
  } finally {
    await server.close();
  }
}
