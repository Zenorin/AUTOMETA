# WBS

| ID | Phase | Workstream | Module path | Task | Validation | Depends on |
|---|---|---|---|---|---|---|
| WBS-00 | intake | `$project-development-bootstrap` | `.` | Confirm scope, secret boundary, and clean-room constraints | `python -S tools/codex/codex_skillset_generator.py validate-generated --root .` | - |
| WBS-01 | stack-decision | `$project-development-bootstrap` | `.` | Review and approve stack decision | `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` | WBS-00 |
| WBS-02 | bootstrap | `$project-development-bootstrap` | `.` | Generate and validate repository scaffold | `python -S tools/codex/codex_skillset_generator.py validate-scaffold --root .` | WBS-01 |
| WBS-03 | reference-analysis | `$project-reference-mapper` | `tools/reference-analysis` | Write clean-room reference role report before implementation | `pnpm cleanroom:audit` | WBS-02 |
| WBS-04 | contracts | `$project-contracts` | `packages/contracts` | Define shared DTO/schema contracts | `pnpm --filter @project/contracts typecheck` | WBS-03 |
| WBS-05 | backend-api | `$project-backend-api` | `apps/api` | Implement API shell, health route, and error envelope | `cd apps/api && pytest` | WBS-04 |
| WBS-06 | frontend-shell | `$project-frontend-design` | `apps/web` | Implement web route shell and complete UI states | `pnpm --filter web build` | WBS-05 |
| WBS-07 | extension-bridge | `$project-extension-bridge` | `apps/extension` | Implement extension manifest and message boundary | `pnpm --filter extension build` | WBS-06 |
| WBS-08 | collectors | `$project-market-collectors` | `packages/collectors` | Define collector contract and raw/normalized split | `pnpm --filter @project/collectors typecheck` | WBS-07 |
| WBS-09 | core-pipeline | `$project-core-pipeline` | `packages/core` | Implement deterministic core pipeline skeleton | `pnpm --filter @project/core typecheck` | WBS-08 |
| WBS-10 | integration | `$project-development-bootstrap` | `.` | Connect contracts, API, web, extension, collectors, and core with smoke evidence | `pnpm validate:all` | WBS-09 |
| WBS-11 | handoff | `$evidence-pack` | `.` | Prepare evidence pack and next-session handoff | `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` | WBS-10 |
