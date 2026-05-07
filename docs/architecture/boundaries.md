# Architecture Boundaries

- AUTOMETA is the target repository root for generated Codex commands unless the user changes it.
- Uploaded app.zip, background.js, preload.js, source maps, recovered sources, static chunks, screenshots, logos, and templates are reference-only and must not be copied into product code.
- Extract behavior roles, route inventory, IPC/message/API contracts, DTO fields, failure modes, and fixture shape from references; do not copy implementation source text, generated chunk code, branded assets, or copywriting.
- Electron-specific IPC is not the target runtime default. Re-express necessary behavior as web/API/extension contracts with explicit privacy and session boundaries.
- No mock-success fallback. Failures must surface typed errors, retry/cancel/progress state, and evidence logs.
- No hidden credential/session handling. Real IDs, passwords, API keys, cookies, tokens, service-account files, and private keys are local-only inputs.
- Browser/session handoff is design-only in WBS-18. See
  `docs/architecture/browser-session-handoff.md`; it adds no runtime code,
  browser automation, marketplace access, live crawling, or session extraction.
- Secrets, credentials, cookies, tokens, sessions, browser profiles, account
  data, service-account files, API keys, passwords, and private keys must never
  be committed, logged, serialized into DTOs, stored in fixtures, or copied into
  docs as real values.
- Do not delete, hide, or exclude requested feature categories without a written defer-with-contract decision and replacement validation path.
- Use reference-analysis before contracts/schema, backend API, frontend shell, extension/collectors, and core pipeline work.
