# Codex Command Queue

### WBS-00 — Confirm scope, secret boundary, and clean-room constraints

```text
Read AGENTS.md first.
Use $project-development-bootstrap.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `AGENTS.md`
- `docs/architecture/boundaries.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-generated --root .`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-01 — Review and approve stack decision

```text
Read AGENTS.md first.
Use $project-development-bootstrap.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/decisions/stack-decision.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-02 — Generate and validate repository scaffold

```text
Read AGENTS.md first.
Use $project-development-bootstrap.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `package.json`
- `pnpm-workspace.yaml`
- `.codex/scaffold-manifest.json`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-scaffold --root .`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-03 — Write clean-room reference role report before implementation

```text
Read AGENTS.md first.
Use $project-reference-mapper $clean-room-reference-analysis $reference-role-report $source-copy-audit.

Target workstream: project-reference-mapper
Target module path: tools/reference-analysis

Target files:
- `tools/reference-analysis/src/index.ts`
- `docs/reference/reference-role-report.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm cleanroom:audit`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-04 — Define shared DTO/schema contracts

```text
Read AGENTS.md first.
Use $project-contracts.

Target workstream: project-contracts
Target module path: packages/contracts

Target files:
- `packages/contracts/src/index.ts`
- `docs/contracts/api-contracts.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm --filter @project/contracts typecheck`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-05 — Implement API shell, health route, and error envelope

```text
Read AGENTS.md first.
Use $project-backend-api $api-contract-change.

Target workstream: project-backend-api
Target module path: apps/api

Target files:
- `apps/api/app/main.py`
- `apps/api/tests/test_health.py`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `cd apps/api && pytest`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-06 — Implement web route shell and complete UI states

```text
Read AGENTS.md first.
Use $project-frontend-design $frontend-product-ui.

Target workstream: project-frontend-design
Target module path: apps/web

Target files:
- `apps/web/src/App.tsx`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm --filter web build`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-07 — Implement extension manifest and message boundary

```text
Read AGENTS.md first.
Use $project-extension-bridge $privacy-boundary-review.

Target workstream: project-extension-bridge
Target module path: apps/extension

Target files:
- `apps/extension/manifest.json`
- `apps/extension/src/background.ts`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm --filter extension build`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-08 — Define collector contract and raw/normalized split

```text
Read AGENTS.md first.
Use $project-market-collectors $crawler-contract-review.

Target workstream: project-market-collectors
Target module path: packages/collectors

Target files:
- `packages/collectors/src/index.ts`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm --filter @project/collectors typecheck`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-09 — Implement deterministic core pipeline skeleton

```text
Read AGENTS.md first.
Use $project-core-pipeline.

Target workstream: project-core-pipeline
Target module path: packages/core

Target files:
- `packages/core/src/index.ts`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm --filter @project/core typecheck`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-10 — Connect contracts, API, web, extension, collectors, and core with smoke evidence

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $evidence-pack.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `pnpm validate:all`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-11 — Prepare evidence pack and next-session handoff

```text
Read AGENTS.md first.
Use $evidence-pack.

Target workstream: evidence-pack
Target module path: .

Target files:
- `PLANS.md`
- `docs/planning/codex-command-queue.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`

Expected evidence:
- Changed files
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```
