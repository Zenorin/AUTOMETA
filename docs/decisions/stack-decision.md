# Stack Decision

This file is generated from `codex-profile.json`. It must be reviewed before scaffolded code is treated as the active development baseline.

## Decision mode
- stack_selection_mode: `decision-first`
- stack_decision_required: `True`
- scaffold_generation_policy: `blocked_until_stack_selected`

## Selected stack
- frontend: `react-vite-typescript`
- api: `fastapi-python`
- extension: `chrome-mv3-typescript`
- package_manager: `pnpm`

## Decision reason
Selected React/Vite TypeScript web app, FastAPI Python API, Chrome MV3 extension, shared TypeScript contracts/core/collectors, and pnpm workspace for a clean-room web-first rebuild of the uploaded Electron/Next reference package. Electron is reference-only and not selected for the target runtime unless a later explicit stack decision changes it.

## WBS-01 review
Approved for AUTOMETA clean-room development.

- Web frontend: React/Vite TypeScript supports the route shell, product UI states, and workspace-oriented frontend development in `apps/web`.
- Backend API: FastAPI Python supports typed HTTP endpoints, health checks, error envelopes, and local API iteration in `apps/api`.
- Chrome extension / browser-session collector boundary: Chrome MV3 TypeScript supports explicit extension permissions, message boundaries, and browser-session collection without making Electron the target runtime.
- Shared contracts: TypeScript workspace packages support shared DTOs, message contracts, progress events, and API shapes in `packages/contracts`.
- Core sourcing pipeline: TypeScript workspace packages support deterministic pipeline stages, idempotent processing, and reusable domain logic in `packages/core`.
- Market collectors: TypeScript workspace packages support collector contracts, raw/normalized result separation, and session-boundary-aware implementations in `packages/collectors`.
- Clean-room reference analysis: the selected stack keeps `tools/reference-analysis` separate from product runtime code so reference roles, contracts, and fixtures can be extracted without copying source or assets.
- Local-only secret handling: the stack decision does not require committed credentials; real IDs, passwords, API keys, cookies, tokens, service-account files, and private keys remain local-only inputs.

## Candidate stacks
- `react-vite-fastapi`: frontend=`react-vite-typescript`, api=`fastapi-python`, extension=`chrome-mv3-typescript`, package_manager=`pnpm` — Default for clean-room web plus local Python API prototyping.
- `react-vite-fastify`: frontend=`react-vite-typescript`, api=`fastify-typescript`, extension=`chrome-mv3-typescript`, package_manager=`pnpm` — Use when a single TypeScript runtime is preferred.

## Gate
Scaffold is approved only when `selected_stack` is present, matches `runtime_stack` and `package_manager`, and this decision file is present in `docs/decisions/stack-decision.md`.
