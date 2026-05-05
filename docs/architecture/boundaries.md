# Architecture Boundaries

- AUTOMETA is the target repository root for generated Codex commands unless the user changes it.
- Uploaded app.zip, background.js, preload.js, source maps, recovered sources, static chunks, screenshots, logos, and templates are reference-only and must not be copied into product code.
- Extract behavior roles, route inventory, IPC/message/API contracts, DTO fields, failure modes, and fixture shape from references; do not copy implementation source text, generated chunk code, branded assets, or copywriting.
- Electron-specific IPC is not the target runtime default. Re-express necessary behavior as web/API/extension contracts with explicit privacy and session boundaries.
- No mock-success fallback. Failures must surface typed errors, retry/cancel/progress state, and evidence logs.
- No hidden credential/session handling. Real IDs, passwords, API keys, cookies, tokens, service-account files, and private keys are local-only inputs.
- Do not delete, hide, or exclude requested feature categories without a written defer-with-contract decision and replacement validation path.
- Use reference-analysis before contracts/schema, backend API, frontend shell, extension/collectors, and core pipeline work.
