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
      /extension|browser-session|browser session/i,
      /local-only|local only|secret/i,
      /No crawling|no live collection|no marketplace automation/i
    ];

    for (const signal of requiredSignals) {
      assert.match(html, signal);
    }
  } finally {
    await server.close();
  }
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
