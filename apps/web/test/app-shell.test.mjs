import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

test("AUTOMETA shell renders required WBS-06 boundaries", async () => {
  const server = await createServer({
    appType: "custom",
    server: { middlewareMode: true },
    logLevel: "error",
  });

  try {
    const module = await server.ssrLoadModule("/test/App.test.tsx");
    module.runAppShellAssertions(assert);
  } finally {
    await server.close();
  }
});
