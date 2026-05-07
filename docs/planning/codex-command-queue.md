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
Use $planning-and-task-breakdown $evidence-pack $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.
- Do not implement new product features.
- Do not modify web, API, extension, collectors, or core source unless validation exposes a blocking integration issue.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.
- Do not add hidden session, cookie, token, or credential handling.
- Do not add real marketplace crawling, browser automation, login automation, or external API calls.
- Do not add mock-success fallback to hide unsupported messages, collector failures, or pipeline failures.

Validation commands:
- `pnpm validate:all`
- `python -S tools/codex/validate_scaffold.py --root .`
- `python -S tools/codex/validate_planning.py --root .`
- `python -S tools/codex/validate_dev_flow.py --root .`
- `node tools/checks/workspace-check.mjs`
- `node tools/checks/cleanroom-audit.mjs`

Smoke evidence commands and PASS criteria:
- WBS-04 shared contracts: `pnpm --filter @project/contracts typecheck` passes; shared DTO/schema types remain canonical for API envelopes, error envelopes, collector results, pipeline events, retry/cancel, and extension messages.
- WBS-05 API shell: `cd apps/api && pytest` passes; health and error envelope smoke remains covered. Full ASGI TestClient smoke was deferred because TestClient hung in this environment and must stay visible for integration validation.
- WBS-06 frontend shell: `pnpm --filter web build` passes; frontend scaffold states and API envelope vocabulary build without adding product behavior.
- WBS-07 extension bridge: `pnpm --filter extension build` passes; MV3 manifest and typed background message boundary compile with requestId/correlationId handling and typed unsupported-message errors.
- WBS-08 collectors: `pnpm --filter @project/collectors typecheck` passes; market collector contract scaffold preserves raw/normalized split, blocked-session/rate-limit evidence, and no live crawling/session extraction.
- WBS-09 core pipeline: `pnpm --filter @project/core typecheck` passes; core orchestration has explicit stages/states, typed progress/log/failure events, preserved partial failures, and cancel/retry readiness.
- Workspace gates: scaffold, planning, dev-flow, workspace-check, and cleanroom-audit pass.

Failure handling:
- If `pnpm validate:all` fails, do not mark WBS-10 done.
- Classify the failure by source module: contracts, API, web, extension, collectors, core, reference-analysis, scaffold/planning/dev-flow, workspace, or clean-room audit.
- Fix the root cause only when it is directly required for integration validation.
- Do not bypass, weaken, delete, hide, or mark failing checks as expected.

Expected evidence:
- Changed files
- Phase gate updates for WBS-04 through WBS-09
- Command queue updates that make WBS-10 and the next handoff step explicit
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-11 — Prepare evidence pack and next-session handoff

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $evidence-pack $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `PLANS.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/wbs-manifest.json`

Allowed changes:
- Implement only this slice and directly required support files.
- Update tests, docs, contracts, and evidence for this slice.
- Carry forward WBS-10 validation results, any classified blockers, and the WBS-05 ASGI TestClient deferred-smoke risk.
- Do not reopen WBS-04 through WBS-10 implementation unless a blocker is documented and explicitly targeted.
- Do not implement new product features.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not delete existing behavior without role trace and approval.
- Do not copy restricted reference source text/assets verbatim.
- Do not hide failed checks, clean-room risks, or deferred integration smoke.
- Do not weaken validators, tests, clean-room audit, scaffold checks, or phase gates.

Validation commands:
- `pnpm validate:all`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `python -S tools/codex/validate_scaffold.py --root .`
- `python -S tools/codex/validate_planning.py --root .`
- `python -S tools/codex/validate_dev_flow.py --root .`
- `node tools/checks/workspace-check.mjs`
- `node tools/checks/cleanroom-audit.mjs`

Expected evidence:
- Changed files
- Completed WBS-00 through WBS-10 evidence summary
- WBS-10 command outcomes and unresolved risk summary
- Explicit next safe development slice or blocker status
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-12 — Expand sourcing job API and shared contract vocabulary

```text
Read AGENTS.md first.
Use $project-contracts $api-contract-change $consistency-guard.

Target workstream: project-contracts
Target module path: packages/contracts

Target files:
- `packages/contracts/src/index.ts`
- `docs/contracts/api-contracts.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Expand shared contracts for fixture-only sourcing jobs before API, web, extension, collector, or core behavior is added.

Required behavior:
- Define shared sourcing job request/status/progress/cancel DTOs.
- Preserve requestId/correlationId and typed error envelope vocabulary.
- Keep unsupported states as typed failures, not mock success.
- Keep all live crawling, browser automation, login, marketplace automation, session extraction, cookie handling, credential handling, and external API calls out of scope.

Allowed changes:
- Implement only this slice and directly required contract docs/tests if configured.
- Use existing shared contract patterns without weakening types.

Forbidden changes:
- Do not commit secrets or real credentials.
- Do not copy restricted reference source text/assets verbatim.
- Do not implement product code outside shared contracts.
- Do not add real marketplace crawling, login/session/cookie/token/credential handling, browser automation, or external API calls.
- Do not create fake passing tests or mock-success fallback.

Validation commands:
- `pnpm --filter @project/contracts typecheck`
- `pnpm --filter @project/contracts test`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`

Expected evidence:
- Changed files
- Sourcing job contract summary
- API contract documentation updates
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-13 — Add deterministic collector fixtures and fixture result contract checks

```text
Read AGENTS.md first.
Use $project-market-collectors $crawler-contract-review $privacy-boundary-review.

Target workstream: project-market-collectors
Target module path: packages/collectors

Target files:
- `packages/collectors/src/index.ts`
- `packages/collectors/fixtures/deterministic-results.json`
- `packages/collectors/test/fixture-contract.test.mjs`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Add deterministic collector fixture data and contract checks that exercise collector result shapes without live crawling.

Required behavior:
- Use synthetic or sanitized fixture data only.
- Add deterministic fixture collector input/output examples.
- Validate fixture collector results against shared contracts from `packages/contracts`.
- Keep raw capture metadata separate from normalized collector results.
- Represent rate-limit and unsupported outcomes as typed fixture failures.
- Do not add marketplace selectors, real crawling, browser automation, login, session extraction, cookies, tokens, credentials, or external API calls.

Validation commands:
- `pnpm --filter @project/collectors typecheck`
- `pnpm --filter @project/collectors test`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`

Expected evidence:
- Changed files
- Fixture source/provenance note
- Contract checks added
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-14 — Validate core pipeline inputs and outputs against fixture collector results

```text
Read AGENTS.md first.
Use $project-core-pipeline $consistency-guard.

Target workstream: project-core-pipeline
Target module path: packages/core

Target files:
- `packages/core/src/index.ts`
- `packages/core/test/pipeline-fixture.test.mjs`

Goal:
Validate the core pipeline scaffold against deterministic collector fixture results.

Required behavior:
- Validate input/output envelopes for collect, normalize, filter, dedupe, enrich, image_search_ready, save_ready, and summarize.
- Preserve partial failures and typed progress/log events.
- Keep cancel/retry readiness markers explicit.
- Do not add external IO, browser automation, marketplace scraping, login/session/cookie/token/credential handling, or mock-success fallback.

Validation commands:
- `pnpm --filter @project/core typecheck`

Expected evidence:
- Changed files
- Core validation summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-15 — Implement fixture-only sourcing job API boundary

```text
Read AGENTS.md first.
Use $project-backend-api $api-contract-change $api-error-handling-review $backend-test-matrix.

Target workstream: project-backend-api
Target module path: apps/api

Target files:
- `apps/api/app/main.py`
- `apps/api/tests/test_sourcing_jobs.py`

Goal:
Expose fixture-only sourcing job create/status/progress/cancel readiness through the API shell using shared contracts and typed errors.

Required behavior:
- Use shared sourcing job DTOs and existing API/error envelope semantics.
- Keep bounded tests for success, unsupported, validation error, and cancellation readiness paths.
- Keep ASGI/TestClient hangs visible if they still reproduce; do not hide or skip them.
- Do not call live marketplaces, automate browsers, log in, read sessions/cookies/tokens/credentials, or call external APIs.

Validation commands:
- `cd apps/api && pytest`

Expected evidence:
- Changed files
- API boundary summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers, including ASGI/TestClient status
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-16 — Add web sourcing job creation and status UI states

```text
Read AGENTS.md first.
Use $project-frontend-design $frontend-product-ui $consistency-guard.

Target workstream: project-frontend-design
Target module path: apps/web

Target files:
- `apps/web/src/App.tsx`
- `apps/web/test/app-shell.test.mjs`

Goal:
Add job creation/status UI states backed by shared API envelope vocabulary and fixture-only behavior.

Required behavior:
- Cover ready, creating, running, progress, partial_failure, failed, cancelled, and unsupported states.
- Keep copy clear that live crawling/session handoff is not enabled.
- Do not add real marketplace requests, hidden credentials, tokens, cookies, browser automation, or copied reference UI/assets.

Validation commands:
- `pnpm --filter @project/web typecheck`
- `pnpm --filter @project/web test`

Expected evidence:
- Changed files
- UI state summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-17 — Connect extension request messages to sourcing job readiness boundary

```text
Read AGENTS.md first.
Use $project-extension-bridge $content-script-boundary $privacy-boundary-review $consistency-guard.

Target workstream: project-extension-bridge
Target module path: apps/extension

Target files:
- `apps/extension/src/background.ts`
- `packages/contracts/src/index.ts`

Goal:
Align extension messages with sourcing job readiness contracts without opening external trust or session handling.

Required behavior:
- Support only explicitly allowed fixture/job readiness messages with requestId correlation.
- Return typed errors for unsupported messages.
- Do not use wildcard trust for external messages.
- Do not implement live crawling, login, marketplace automation, session extraction, cookie handling, credential handling, or external API calls.

Validation commands:
- `pnpm --filter extension build`
- `pnpm --filter @project/contracts typecheck`

Expected evidence:
- Changed files
- Message boundary summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-18 — Document local-only browser session handoff boundaries

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $privacy-boundary-review $session-boundary-security $anti-bot-compliance-check.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/architecture/local-session-handoff.md`
- `docs/planning/phase-gates.md`

Goal:
Write a design-only local session handoff boundary document before any session-related implementation is considered.

Required behavior:
- Document allowed, forbidden, and approval-required boundaries.
- Keep handoff local-only and user-controlled at the design level.
- Explicitly keep cookies, tokens, credentials, browser profiles, login automation, and marketplace automation out of implementation scope.
- Preserve clean-room restrictions and anti-bot boundaries.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`

Expected evidence:
- Changed files
- Boundary decision summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-19 — Add fixture-only integration smoke evidence across API, web, extension, collectors, and core

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $evidence-pack $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`

Goal:
Connect WBS-12 through WBS-18 with fixture-only integration smoke evidence and a clean handoff.

Required behavior:
- Run full validation and direct clean-room audit.
- Classify failures by module and fix only directly related integration blockers.
- Preserve the WBS-05 ASGI/TestClient risk if it still reproduces.
- Do not add real crawling, login/session/cookie/token/credential handling, browser automation, external API calls, mock-success fallback, or copied reference source/assets.

Validation commands:
- `pnpm validate:all`
- `node tools/checks/cleanroom-audit.mjs`

Expected evidence:
- Changed files
- Fixture-only integration summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```
