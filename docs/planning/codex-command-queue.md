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
Use $planning-and-task-breakdown $consistency-guard $project-core-pipeline.

Target workstream: project-core-pipeline
Target module path: packages/core

Target files:
- `packages/core/src/index.ts`
- `packages/core/test/pipeline-fixture.test.mjs`
- `packages/collectors/fixtures/deterministic-results.json`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Validate the core pipeline scaffold against deterministic collector fixture results.

Required behavior:
- Consume WBS-13 deterministic collector fixture results.
- Preserve raw/normalized split.
- Add deterministic core pipeline input/output validation.
- Use shared contract vocabulary from `packages/contracts`.
- Validate input/output envelopes for collect, normalize, filter, dedupe, enrich, image_search_ready, save_ready, and summarize.
- Preserve partial failures and typed progress/log events.
- Keep cancel/retry readiness markers explicit.
- Keep all logic fixture-only.
- Do not add external IO, browser automation, marketplace scraping, login/session/cookie/token/credential handling, secrets, or mock-success fallback.

Validation commands:
- `pnpm --filter @project/core typecheck`
- `pnpm --filter @project/core test`
- `pnpm --filter @project/collectors test`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`

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
Use $planning-and-task-breakdown $consistency-guard $project-backend-api $api-contract-change $api-error-handling-review $backend-test-matrix.

Target workstream: project-backend-api
Target module path: apps/api

Target files:
- `apps/api/app/main.py`
- `apps/api/tests/*.py`
- `packages/contracts/src/index.ts`
- `packages/core/src/index.ts`
- `packages/collectors/fixtures/deterministic-results.json`
- `docs/contracts/api-contracts.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Implement a fixture-only sourcing job API boundary that uses the WBS-12 contracts, WBS-13 collector fixtures, and WBS-14 deterministic core pipeline output.

Required behavior:
- Add fixture-only sourcing job API routes: `POST /api/v1/sourcing/jobs`, `GET /api/v1/sourcing/jobs/{job_id}`, and `GET /api/v1/sourcing/jobs/{job_id}/result`.
- Keep API behavior deterministic.
- Use synthetic fixture data only.
- Return typed API envelopes.
- Expose job creation and job status/result boundary.
- Preserve clean-room restrictions.
- Use shared sourcing job DTOs and existing API/error envelope semantics.
- Keep bounded tests for success, unsupported, validation error, and cancellation readiness paths.
- Keep ASGI/TestClient hangs visible if they still reproduce; do not hide or skip them.
- Do not call live marketplaces, automate browsers, log in, read sessions/cookies/tokens/credentials, or call external APIs.

Validation commands:
- `cd apps/api && pytest`
- `pnpm --filter @project/contracts typecheck`
- `pnpm --filter @project/core typecheck`
- `pnpm --filter @project/collectors test`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`

Expected evidence:
- Changed files
- API boundary summary
- Fixture-only data boundary summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers, including ASGI/TestClient status
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-16 — Add web sourcing job creation and status UI states

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $consistency-guard $project-frontend-design $frontend-product-ui.

Target workstream: project-frontend-design
Target module path: apps/web

Target files:
- `apps/web/src/App.tsx`
- `apps/web/src/styles.css`
- `apps/web/test/app-shell.test.mjs`
- `docs/contracts/api-contracts.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Add job creation/status UI states backed by shared API envelope vocabulary and fixture-only behavior.

Required behavior:
- Add UI states for fixture-only sourcing job creation.
- Add job status/result display states.
- Show clean-room and fixture-only boundary clearly.
- Use the WBS-15 API envelope/status vocabulary already documented.
- Cover idle/ready, creating, queued, completed, failed, invalid-source rejected, fixture result summary, and clean-room boundary notice.
- Keep unsupported live/external source behavior visibly blocked.
- Do not add real marketplace requests, live crawling, hidden credentials, session/cookie/token handling, browser automation, or copied reference UI/assets.

Validation commands:
- `pnpm --filter @project/web typecheck`
- `pnpm --filter @project/web test`
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`

Expected evidence:
- Changed files
- UI state summary
- Fixture-only API boundary summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-17 — Connect extension request messages to sourcing job readiness boundary

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $consistency-guard $project-extension-bridge $content-script-boundary $privacy-boundary-review.

Target workstream: project-extension-bridge
Target module path: apps/extension

Target files:
- `apps/extension/src/background.ts`
- `apps/extension/src/content.ts`
- `apps/extension/test/*.test.mjs`
- `docs/contracts/api-contracts.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Connect extension request messages to the sourcing job readiness boundary without enabling live crawling, browser automation, login/session handling, or marketplace access.

Required behavior:
- Add typed extension message vocabulary for sourcing job readiness.
- Support only explicitly allowed fixture/job readiness messages with requestId correlation.
- Return deterministic readiness/status responses.
- Keep extension boundary aligned with WBS-12 contracts and WBS-15 API vocabulary.
- Preserve existing unsupported-message behavior.
- Return typed errors for unsupported messages.
- Do not use wildcard trust for external messages.
- Do not call real API endpoints, access marketplace pages, read cookies/sessions/tokens/credentials/local storage, add browser automation, or implement live crawling.

Validation commands:
- `pnpm --filter extension typecheck`
- `pnpm --filter extension build`
- `pnpm --filter extension test`
- `pnpm --filter @project/web test`
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`

Expected evidence:
- Changed files
- Extension message boundary summary
- Fixture-only readiness behavior summary
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
- `docs/architecture/browser-session-handoff.md`
- `docs/architecture/boundaries.md`
- `docs/contracts/api-contracts.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Document local-only browser session handoff boundaries for future controlled
product phases without implementing browser automation, cookie/session
extraction, credential handling, marketplace access, or live crawling.

Required behavior:
- Create or update architecture documentation for local-only browser session handoff.
- Define allowed, forbidden, and deferred behavior.
- Clarify that the current product phase remains fixture-only.
- Clarify that browser/session handoff is design-only in WBS-18.
- Clarify that no implementation code is added in this slice.
- Clarify that secrets, credentials, cookies, tokens, sessions, browser profiles, and account data must never be committed.
- Define approval gates required before any future browser/session implementation.
- Define audit/evidence requirements for future phases.
- Preserve clean-room restrictions and anti-bot boundaries.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`

Expected evidence:
- Changed files
- Browser/session handoff boundary summary
- Explicit forbidden behavior list
- Future approval gate summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-19 — Add fixture-only integration smoke evidence across contracts, collectors, core, API, web, extension, and browser-session handoff docs

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $evidence-pack $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `docs/evidence/fixture-integration-smoke.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Add fixture-only integration smoke evidence across contracts, collectors, core,
API, web, extension, and browser-session handoff documentation without adding
new product runtime behavior.

Required behavior:
- Verify WBS-12 through WBS-18 as one integrated fixture-only product foundation.
- Document the integration path: shared sourcing job contracts, deterministic
  collector fixtures, deterministic core pipeline validation, fixture-only
  sourcing job API, web job creation/status UI states, extension sourcing
  readiness boundary, and local-only browser session handoff design boundary.
- Keep evidence fixture-only.
- Preserve the WBS-05 ASGI/TestClient risk if it still reproduces.
- Do not implement runtime behavior or modify product code.
- Do not add marketplace access, live crawling, browser automation,
  login/session/cookie/token handling, secrets, or external API calls.

Validation commands:
- `pnpm validate:all`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/workspace-check.mjs`
- `node tools/checks/cleanroom-audit.mjs`
- `git diff --check`

Expected evidence:
- Changed files
- Fixture-only integration summary
- Covered modules and smoke path
- Clean-room boundary assertions
- Fixture provenance
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

## Controlled Local Runtime Implementation

This phase starts after WBS-19 and remains local-only. It may introduce local
runtime behavior, persistence, lifecycle actions, safety events, and local
integration tests, but it must not open live crawling, marketplace access,
browser automation, login automation, credential/session/cookie/token handling,
secrets, or external API calls.

### WBS-20 — Define local runtime execution policy and fixture-to-runtime promotion gates

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $consistency-guard $validation-first $evidence-pack.

Target workstream: project-development-bootstrap
Target module path: .

Target files:
- `PLANS.md`
- `docs/architecture/boundaries.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`
- `docs/evidence/local-runtime-policy.md`

Goal:
Define the local runtime execution policy and fixture-to-runtime promotion gates before any runtime implementation proceeds.

Required behavior:
- Keep this slice planning/evidence only.
- Define local-only execution, persistence, API lifecycle, UI, extension, audit, and integration boundaries.
- Define fixture-to-runtime promotion gates and rollback requirements.
- Define allowed local-only runtime behaviors.
- Define explicitly forbidden runtime behaviors.
- Preserve WBS-05 ASGI/TestClient deferred-smoke risk.
- Keep fixture-only state as the current default.
- Keep synthetic/sanitized fixtures as the only collector evidence source.
- Keep live crawling, marketplace access, browser automation, login automation, credential/session/cookie/token handling, credentials, secrets, and external API calls disabled.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`

Expected evidence:
- Changed files
- Local runtime policy summary
- Promotion gate summary
- Commands run and PASS/FAIL results
- Remaining risks or blockers
- Rollback note: Revert this slice and restore prior generated files/backups if validation fails.
```

### WBS-21 — Implement persisted local sourcing job store

```text
Read AGENTS.md first.
Use $project-backend-api $backend-test-matrix $consistency-guard $security-and-hardening.

Target workstream: project-backend-api
Target module path: apps/api

Target files:
- `apps/api/app/main.py`
- `apps/api/tests/*.py`
- `docs/evidence/local-runtime-policy.md`
- `docs/planning/phase-gates.md`
- `docs/planning/codex-command-queue.md`
- `docs/planning/codex-command-queue.json`
- `docs/planning/wbs-manifest.json`

Goal:
Implement a persisted local sourcing job store without enabling external IO or storing secret/session material.

Required behavior:
- Add local persisted sourcing job state.
- Keep runtime local-only.
- Store only non-secret job metadata and fixture/core result references.
- Do not store cookies, sessions, tokens, credentials, passwords, browser storage, or marketplace login data.
- Preserve fixture-only collector evidence as the current data source.
- Preserve existing fixture-only API behavior from WBS-15.
- Add deterministic tests for persistence behavior and cleanup/reset behavior.
- Use a repo-local runtime/state path that is clearly non-secret and test-safe.
- Do not add marketplace access, live crawling, browser automation, login automation, external API calls, or secrets.

Validation commands:
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-22 — Add API job lifecycle actions: create, read, cancel, retry

```text
Read AGENTS.md first.
Use $project-backend-api $api-contract-change $api-error-handling-review $backend-test-matrix $consistency-guard.

Target workstream: project-backend-api
Target module path: apps/api

Goal:
Add local API job lifecycle actions for create, read, cancel, and retry using the persisted local job store.

Required behavior:
- Preserve typed envelopes, request/correlation IDs, lifecycle states, cancel/retry semantics, and unsupported-source errors.
- Add or preserve local-only routes for create, read, cancel, retry, and deterministic result lookup.
- Allow cancellation only from cancellable local states and retry only from failed/cancelled local fixture states.
- Reject completed job cancel/retry attempts with typed conflict envelopes.
- Keep retries local-only and do not start live collection.
- Keep ASGI/TestClient risk visible if it still reproduces.
- Do not add marketplace access, live crawling, browser automation, login/session/cookie/token handling, secrets, or external API calls.

Validation commands:
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-23 — Connect web UI to real local API job lifecycle

```text
Read AGENTS.md first.
Use $project-frontend-design $frontend-product-ui $consistency-guard.

Target workstream: project-frontend-design
Target module path: apps/web

Goal:
Connect web job creation/status UI states to the real local API lifecycle without implying live collection.

Required behavior:
- Wire create/read/cancel/retry UI paths to local API lifecycle responses.
- Preserve loading, empty, queued, running, completed, failed, cancelled, retry, and unsupported-source states.
- Keep clean-room/local-only copy visible.
- Do not add marketplace access, live crawling, browser automation, login/session/cookie/token handling, secrets, or external API calls beyond the local API boundary.

Validation commands:
- `pnpm --filter @project/web typecheck`
- `pnpm --filter @project/web test`
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-24 — Connect extension readiness messages to local API boundary

```text
Read AGENTS.md first.
Use $project-extension-bridge $content-script-boundary $privacy-boundary-review $consistency-guard.

Target workstream: project-extension-bridge
Target module path: apps/extension

Goal:
Connect extension readiness messages to the local API boundary without page access, session access, or browser automation.

Required behavior:
- Align readiness/status/cancel/retry messages with local API lifecycle vocabulary.
- Preserve explicit sender trust, requestId/correlationId handling, and typed unsupported errors.
- Keep content script inert for browser data and page state.
- Do not read cookies, sessions, tokens, credentials, local storage, browser profiles, account data, or marketplace pages.

Validation commands:
- `pnpm --filter extension typecheck`
- `pnpm --filter extension build`
- `pnpm --filter extension test`
- `cd apps/api && pytest`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-25 — Add controlled local browser-session handoff stub without credential capture

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $privacy-boundary-review $session-boundary-security $anti-bot-compliance-check $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Goal:
Add a controlled local browser-session handoff stub that records approval metadata only and captures no credentials or browser state.

Required behavior:
- Implement stub/marker behavior only if approved by WBS-20 policy gates.
- Store metadata-only approval state; do not read, export, store, or transmit browser session material.
- Preserve design boundaries from `docs/architecture/browser-session-handoff.md`.
- Do not add Playwright, Selenium, Puppeteer, browser automation, login automation, marketplace access, live crawling, secrets, or external API calls.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-26 — Add runtime audit log and clean-room safety event records

```text
Read AGENTS.md first.
Use $project-backend-api $privacy-boundary-review $security-and-hardening $consistency-guard.

Target workstream: project-backend-api
Target module path: apps/api

Goal:
Add local runtime audit log and clean-room safety event records for lifecycle actions and blocked boundaries.

Required behavior:
- Record local job lifecycle events, safety decisions, blocked unsupported sources, cancel/retry actions, and policy-gate outcomes.
- Exclude credentials, cookies, sessions, tokens, browser profiles, account data, marketplace payloads, and secrets from logs.
- Keep audit records local-only and testable.
- Do not add marketplace access, live crawling, browser automation, login automation, or external API calls.

Validation commands:
- `cd apps/api && pytest`
- `node tools/checks/cleanroom-audit.mjs`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `pnpm validate:all`
- `git diff --check`
```

### WBS-27 — Add local-only integration tests across API, web, extension, collectors, and core

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $test-driven-development $consistency-guard $evidence-pack.

Target workstream: project-development-bootstrap
Target module path: .

Goal:
Add local-only integration tests across API, web, extension, collectors, and core without external IO.

Required behavior:
- Exercise local job lifecycle from API through web and extension boundaries using deterministic collector/core behavior.
- Prove unsupported live sources remain rejected.
- Preserve WBS-05 ASGI/TestClient risk visibility if it still reproduces.
- Do not add marketplace access, live crawling, browser automation, login/session/cookie/token handling, secrets, or external API calls.

Validation commands:
- `pnpm validate:all`
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/workspace-check.mjs`
- `node tools/checks/cleanroom-audit.mjs`
- `git diff --check`
```

### WBS-28 — Prepare go/no-go decision for opening limited live collection boundary

```text
Read AGENTS.md first.
Use $planning-and-task-breakdown $security-and-hardening $privacy-boundary-review $anti-bot-compliance-check $consistency-guard.

Target workstream: project-development-bootstrap
Target module path: .

Goal:
Prepare a go/no-go decision for opening a limited live collection boundary without enabling that boundary in this slice.

Required behavior:
- Document decision criteria, required approvals, risk register, rollback plan, anti-bot compliance evidence, privacy/security gates, and validation requirements.
- Require explicit future approval before any live collection, marketplace access, browser automation, credential/session handling, or external API calls.
- Keep current runtime local-only.
- Do not implement or enable live collection.

Validation commands:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `node tools/checks/cleanroom-audit.mjs`
- `pnpm validate:all`
- `git diff --check`
```
