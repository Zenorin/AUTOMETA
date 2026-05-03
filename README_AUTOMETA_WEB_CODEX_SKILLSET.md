# AUTOMETA Web Codex Skillset

This file set is generated for web-based clean-room development of AUTOMETA using `app (1).zip` and the extension reference document as behavior/contract references.

## Use

1. Copy or extract this file set into the AUTOMETA repository root.
2. Review `codex-profile.autometa-web-cleanroom-workstreams.json`.
3. Run:

```bash
python -S codex_skillset_generator.py validate --config codex-profile.autometa-web-cleanroom-workstreams.json
python -S codex_skillset_generator.py recommend --config codex-profile.autometa-web-cleanroom-workstreams.json
python -S codex_skillset_generator.py validate-generated --root .
```

## Primary development tools

- Web frontend: React + TypeScript + Vite-style frontend, Tailwind/shadcn-style component discipline, TanStack Query-style server state, Playwright smoke where available.
- Backend: FastAPI + Pydantic + pytest, route/service/repository separation.
- Extension: Chrome MV3 + TypeScript + typed message contracts.
- Collectors: fixture-backed TypeScript packages; Coupang extension-first, Naver backend candidate, Gmarket/Auction parser fixtures.
- Verification: contract tests, fixture tests, source-copy audit, competitor API dependency scan, secret scan.

## Clean-room rule

Reference files are read-only. Extract roles, contracts, fixtures, and tests. Do not copy implementation source, competitor API runtime dependencies, credentials, cookies, tokens, or branded assets/copy.
