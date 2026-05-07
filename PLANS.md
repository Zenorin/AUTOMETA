# PLANS.md — AUTOMETA Bulsaja Clean Room Rebuild

Use this file for ambiguous or multi-step work. Current slice: WBS-11 handoff/stabilization.

## Goal
- Preserve handoff-ready evidence for the completed clean-room scaffold through WBS-10.
- Keep the next development step explicit, validation-first, and scoped.
- Do not add product behavior in this slice.

## Non-goals
- No web, API, extension, collector, core, or contract feature work.
- No validator, test, scaffold, planning, or clean-room audit weakening.
- No reference source/assets, hidden credential/session/cookie/token handling, real marketplace crawling, mock-success fallback, or real secrets.

## Current evidence
- Files/docs read: `AGENTS.md`, `docs/planning/wbs-manifest.json`, `docs/planning/phase-gates.md`, `docs/planning/codex-command-queue.md`, `.codex/scaffold-manifest.json`, `.codex/skillset-manifest.json`, `.codex/policy.lock.json`, `git status --short`, `git log --oneline -12`.
- Next WBS from manifest: WBS-11, `Prepare evidence pack and next-session handoff`.
- Current dirty workspace before WBS-11 edits: `packages/collectors/package.json`, `packages/core/package.json`, `pnpm-lock.yaml`.
- Relevant contracts: shared DTO/schema contracts in `packages/contracts/src/index.ts`; market collector contract scaffold in `packages/collectors/src/index.ts`; core pipeline scaffold in `packages/core/src/index.ts`.
- Unknowns: ASGI TestClient/full client smoke remains deferred because TestClient hung in the WBS-05 environment.

## Completed WBS Evidence
| WBS | Status | Evidence |
|---|---|---|
| WBS-00 | Done | Scope, secret boundary, and clean-room constraints confirmed; generated guidance validation passed. |
| WBS-01 | Done | Stack decision approved: React/Vite TypeScript web, FastAPI API, Chrome MV3 extension, pnpm workspace. |
| WBS-02 | Done | Repository scaffold generated and scaffold validation passed. |
| WBS-03 | Done | Clean-room reference role report completed before implementation; clean-room audit passed. |
| WBS-04 | Done | Shared DTO/schema contracts validated with `pnpm --filter @project/contracts typecheck`. |
| WBS-05 | Done | API shell, health route, and error envelope validated with `cd apps/api && pytest`; 3 tests passed. |
| WBS-06 | Done | Frontend shell and API envelope terminology validated through recursive typecheck/build/test in `pnpm validate:all`. |
| WBS-07 | Done | MV3 manifest and typed extension message boundary validated through recursive typecheck/build/test and clean-room audit. |
| WBS-08 | Done | Market collector contract scaffold validated through recursive typecheck/build/test and clean-room audit. |
| WBS-09 | Done | Core sourcing pipeline scaffold validated through recursive typecheck/build/test and clean-room audit. |
| WBS-10 | Done | Integration smoke evidence connected; `pnpm validate:all` passed end to end. |

## Validation Commands
These commands are the current PASS baseline for handoff:
- `pnpm validate:all`
- `python -S tools/codex/validate_scaffold.py --root .`
- `python -S tools/codex/validate_planning.py --root .`
- `python -S tools/codex/validate_dev_flow.py --root .`
- `node tools/checks/workspace-check.mjs`
- `node tools/checks/cleanroom-audit.mjs`

## Next Safe Slice
| Slice | Scope | Files | Verification | Rollback |
|---|---|---|---|---|
| Post-WBS ASGI integration smoke | Add bounded FastAPI ASGI/client smoke coverage without weakening current handler tests or changing product behavior. | `apps/api/tests/*` and directly required API test support only | `cd apps/api && pytest`; then `pnpm validate:all` | Revert the new API integration smoke test/support files. |

## Risks
- Full ASGI TestClient/client smoke is still deferred from WBS-05 because TestClient hung in the environment. Treat this as the next validation/stabilization candidate, not as completed coverage.
- Package-level type exports are still not formalized for internal workspace packages; current slices import `@project/contracts/src/index` and `@project/collectors/src/index`.
- Existing dirty files from earlier dependency-linking work remain visible in `git status`: `packages/collectors/package.json`, `packages/core/package.json`, `pnpm-lock.yaml`.

## Completion Evidence
- Commands run: `pnpm validate:all` PASS; `python -S tools/codex/validate_scaffold.py --root .` PASS; `python -S tools/codex/validate_planning.py --root .` PASS; `python -S tools/codex/validate_dev_flow.py --root .` PASS; `node tools/checks/workspace-check.mjs` PASS; `node tools/checks/cleanroom-audit.mjs` PASS.
- Tests added/updated: none for this handoff slice.
- Docs updated: `PLANS.md`, `docs/planning/codex-command-queue.md`, `docs/planning/wbs-manifest.json`.
- Remaining issues: ASGI/client smoke deferred risk remains open; no clean-room blockers known.
