# PRD — AUTOMETA Bulsaja Clean Room Rebuild

## Product goal
Build a `web-clean-room-workstreams` repository that Codex can develop through explicit planning, workstream routing, scaffold validation, and evidence gates.

## Non-goals
- Do not store secrets in generated files.
- Do not copy restricted reference source text/assets verbatim.
- Do not treat scaffold placeholders as production implementation.

## Core flows
1. Select stack decision.
2. Generate dev kit.
3. Follow WBS and command queue.
4. Validate guidance, scaffold, planning, and dev-flow.

## Module responsibilities
- `apps/web`: `frontend-product-ui`; workstreams: $project-frontend-design
- `apps/api`: `backend-api`; workstreams: $project-backend-api
- `apps/extension`: `browser-extension`; workstreams: $project-extension-bridge
- `packages/contracts`: `shared-contracts`; workstreams: $project-contracts
- `packages/core`: `data-pipeline`; workstreams: $project-core-pipeline
- `packages/collectors`: `crawler-session`; workstreams: $project-market-collectors
- `tools/reference-analysis`: `clean-room-rebuild`; workstreams: $project-reference-mapper

## Acceptance criteria
- WBS-00 Confirm scope, secret boundary, and clean-room constraints: `python -S tools/codex/codex_skillset_generator.py validate-generated --root .`
- WBS-01 Review and approve stack decision: `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- WBS-02 Generate and validate repository scaffold: `python -S tools/codex/codex_skillset_generator.py validate-scaffold --root .`
- WBS-03 Write clean-room reference role report before implementation: `pnpm cleanroom:audit`
- WBS-04 Define shared DTO/schema contracts: `pnpm --filter @project/contracts typecheck`
- WBS-05 Implement API shell, health route, and error envelope: `cd apps/api && pytest`
- WBS-06 Implement web route shell and complete UI states: `pnpm --filter web build`
- WBS-07 Implement extension manifest and message boundary: `pnpm --filter extension build`
- WBS-08 Define collector contract and raw/normalized split: `pnpm --filter @project/collectors typecheck`
- WBS-09 Implement deterministic core pipeline skeleton: `pnpm --filter @project/core typecheck`
- WBS-10 Connect contracts, API, web, extension, collectors, and core with smoke evidence: `pnpm validate:all`
- WBS-11 Prepare evidence pack and next-session handoff: `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
