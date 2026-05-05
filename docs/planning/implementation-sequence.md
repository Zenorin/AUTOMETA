# Implementation Sequence

## WBS-00 — Confirm scope, secret boundary, and clean-room constraints
- phase: `intake`
- workstream: `$project-development-bootstrap`
- module_path: `.`
- validation: `python -S tools/codex/codex_skillset_generator.py validate-generated --root .`

## WBS-01 — Review and approve stack decision
- phase: `stack-decision`
- workstream: `$project-development-bootstrap`
- module_path: `.`
- validation: `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`

## WBS-02 — Generate and validate repository scaffold
- phase: `bootstrap`
- workstream: `$project-development-bootstrap`
- module_path: `.`
- validation: `python -S tools/codex/codex_skillset_generator.py validate-scaffold --root .`

## WBS-03 — Write clean-room reference role report before implementation
- phase: `reference-analysis`
- workstream: `$project-reference-mapper`
- module_path: `tools/reference-analysis`
- validation: `pnpm cleanroom:audit`

## WBS-04 — Define shared DTO/schema contracts
- phase: `contracts`
- workstream: `$project-contracts`
- module_path: `packages/contracts`
- validation: `pnpm --filter @project/contracts typecheck`

## WBS-05 — Implement API shell, health route, and error envelope
- phase: `backend-api`
- workstream: `$project-backend-api`
- module_path: `apps/api`
- validation: `cd apps/api && pytest`

## WBS-06 — Implement web route shell and complete UI states
- phase: `frontend-shell`
- workstream: `$project-frontend-design`
- module_path: `apps/web`
- validation: `pnpm --filter web build`

## WBS-07 — Implement extension manifest and message boundary
- phase: `extension-bridge`
- workstream: `$project-extension-bridge`
- module_path: `apps/extension`
- validation: `pnpm --filter extension build`

## WBS-08 — Define collector contract and raw/normalized split
- phase: `collectors`
- workstream: `$project-market-collectors`
- module_path: `packages/collectors`
- validation: `pnpm --filter @project/collectors typecheck`

## WBS-09 — Implement deterministic core pipeline skeleton
- phase: `core-pipeline`
- workstream: `$project-core-pipeline`
- module_path: `packages/core`
- validation: `pnpm --filter @project/core typecheck`

## WBS-10 — Connect contracts, API, web, extension, collectors, and core with smoke evidence
- phase: `integration`
- workstream: `$project-development-bootstrap`
- module_path: `.`
- validation: `pnpm validate:all`

## WBS-11 — Prepare evidence pack and next-session handoff
- phase: `handoff`
- workstream: `$evidence-pack`
- module_path: `.`
- validation: `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
