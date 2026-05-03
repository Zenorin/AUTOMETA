# AGENTS.md — AUTOMETA Web Clean-Room Sourcing Platform

## Purpose
Use this repository guidance with the local `.agents/skills` skillset. Keep work small, source-driven, testable, and evidence-backed.

## Project classification
- project_type: `web-clean-room-workstreams`
- project_size: `large` — Team-owned product with multiple module boundaries.
- bundles: web-saas, browser-extension, crawler-session, clean-room-rebuild, shared-contracts, backend-api, frontend-product-ui
- policy_packs: clean-room, no-feature-deletion, privacy-boundary

## Standard workflow
1. Define/refine requirements before implementation.
2. Plan small vertical slices.
3. Build incrementally.
4. Verify with tests/checks.
5. Review quality, security, consistency, and compatibility.
6. Ship only with evidence and unresolved risks documented.

## Module routing
When editing a file under a module path, read that module's local `AGENTS.md` first and prefer its listed skills.
- `apps/web` → `frontend-product-ui`; generated skills: $autometa-frontend-design, $frontend-product-ui, $design-system-consistency, $ui-state-coverage, $responsive-layout-review, $browser-smoke, $autometa-tool-selection, $autometa-cleanroom-audit, $autometa-keyword-strategy, $consistency-guard, $evidence-pack
- `apps/api` → `backend-api`; generated skills: $autometa-backend-api, $api-contract-change, $api-error-handling-review, $backend-test-matrix, $service-repository-boundary-check, $autometa-tool-selection, $autometa-cleanroom-audit, $autometa-keyword-strategy, $consistency-guard, $evidence-pack
- `apps/extension` → `browser-extension`; generated skills: $autometa-extension-bridge, $extension-permission-review, $content-script-boundary, $message-contract-review, $privacy-boundary-review, $autometa-tool-selection, $autometa-cleanroom-audit, $consistency-guard, $evidence-pack
- `packages/sourcing-contracts` → `shared-contracts`; generated skills: $autometa-sourcing-contracts, $api-contract-change, $backward-compat-check, $consistency-guard, $autometa-fixture-contract-tests, $autometa-cleanroom-audit, $evidence-pack, $documentation-and-adrs
- `packages/sourcing-core` → `data-pipeline`; generated skills: $autometa-sourcing-pipeline, $schema-contract-check, $data-quality-gate, $idempotency-check, $progress-cancel-compatibility, $autometa-cleanroom-audit, $autometa-keyword-strategy, $consistency-guard, $evidence-pack
  - optional/pruned: $backfill-rollout
- `packages/market-collectors` → `crawler-session`; generated skills: $autometa-market-collectors, $crawler-contract-review, $session-boundary-security, $anti-bot-compliance-check, $privacy-boundary-review, $autometa-fixture-contract-tests, $autometa-tool-selection, $autometa-cleanroom-audit, $consistency-guard, $evidence-pack
- `tools/reference-analysis` → `clean-room-rebuild`; generated skills: $autometa-reference-analysis, $clean-room-reference-analysis, $reference-role-report, $contract-extraction, $source-copy-audit, $autometa-cleanroom-audit, $consistency-guard, $evidence-pack
- `tests/fixtures` → `data-pipeline`; generated skills: $autometa-fixture-contract-tests, $characterization-tests, $schema-contract-check, $data-quality-gate, $consistency-guard, $evidence-pack, $idempotency-check, $observability-update
  - optional/pruned: $backfill-rollout

## First-class workstreams
Use these project-specific skills when a task maps to a concrete development lane rather than a generic bundle.
- `$autometa-frontend-design` → Build the web UI for sourcing jobs, keyword strategy, collector status, progress, partial-failure review, and result tables without dropping states.
- `$autometa-backend-api` → Implement FastAPI backend routes for sourcing jobs, quota, keyword strategy, grid state, persistence/search adapters, and contract-shaped errors.
- `$autometa-sourcing-contracts` → Own NormalizedProduct, SourcingRequest, MarketCollectResult, progress/log, job, quota, and extension message contracts.
- `$autometa-sourcing-pipeline` → Implement the sourcing pipeline as explicit stages: collect, normalize, filter, dedupe, cache, imageSearch, save, summarize.
- `$autometa-market-collectors` → Implement market collectors with clean contracts, fixture-backed parsers, explicit blocked/selector-empty errors, and session-boundary safety.
- `$autometa-extension-bridge` → Own Chrome MV3 web↔extension bridge, message allowlist, requestId mapping, task status store, progress/log/result/cancel channels, and browser-session collectors.
- `$autometa-reference-analysis` → Analyze app.zip and extension references into role reports, contracts, fixtures, and decisions without copying source implementation.
- `$autometa-fixture-contract-tests` → Build fixture-backed contract tests for raw market data, normalized products, pipeline partial failures, blocked/challenge pages, selector-empty cases, and message contracts.
- `$autometa-tool-selection` → Choose between Web/API, Chrome Extension, Playwright, Electron, direct backend collectors, and manual session flows based on reliability, compliance, and operating cost.
- `$autometa-cleanroom-audit` → Verify generated or implemented work does not copy restricted source, depend on competitor APIs, leak secrets, or delete behavior without trace.
- `$autometa-keyword-strategy` → Implement pre-listing keyword strategy using search volume, related keywords, competition, product count, and listing name/tag candidates before ad-report dependency.
- `$autometa-evidence-release` → Own final evidence pack, validation logs, risk register, and release handoff for Codex-generated work.

## Anti-rationalization rules
- Tests can wait → Add/adjust tests or document why they cannot run.
- This path looks unused → Prove with evidence or approval before deletion.
- A mock success is enough → Do not fake success states to pass checks.
- Old behavior is probably not important → Treat observable behavior as a possible contract.

## Project-specific forbidden defaults
- competitor API operational dependency
- hardcoded token/cookie/session
- wildcard postMessage trust
- mock-success fallback
- unexplained feature deletion
- Electron-first Coupang collector

## Commands
- `install`: `pnpm install`
- `dev:web`: `pnpm --filter web dev`
- `dev:api`: `python -m uvicorn app.main:app --reload`
- `lint`: `pnpm lint`
- `typecheck`: `pnpm typecheck`
- `test`: `pnpm test && pytest`
- `build`: `pnpm build`
- `validate:contracts`: `pnpm test --filter sourcing-contracts && pytest tests/contracts`
- `smoke:web`: `pnpm --filter web test:smoke`

## Quality gates
- codex_skillset_generator.py validate passes.
- validate-generated passes.
- Workstream skills are generated and routed to module AGENTS.md.
- Reference structure map exists and includes app.zip priority files.
- Secret and competitor API operational dependency scans pass.
- Three review/fix iterations are recorded.
- AUTOMETA-specific docs are attached after generator output.

## Boundaries
- Reference code is read-only. Extract roles, contracts, fixtures, and invariants only.
- AUTOMETA must not use competitor APIs as operational dependencies.
- Coupang and Wing browser-session flows are extension-first unless explicit experimental approval exists.
- Web UI, API, extension, contracts, core pipeline, and collectors must remain separated by module.
- No token, cookie, access key, password, session, or private key in generated guidance or Git-tracked files.

## Canonical domain terms
- `NormalizedProduct`; avoid: raw product, 상품 아무거나; notes: Shared product shape after market-specific normalization.
- `MarketCollectResult`; avoid: crawl result maybe; notes: Collector boundary result with success/error/counts/products.
- `requestId`; avoid: messageId primary; notes: Canonical async correlation ID. messageId is legacy alias only.
- `partial failure`; avoid: failed all; notes: Market-level failure that preserves other market results.
- `extension-first coupang`; avoid: backend coupang default; notes: Coupang collector primary path is Chrome Extension browser session.

## Available project skills
- `$using-agent-skills`
- `$spec-driven-development`
- `$planning-and-task-breakdown`
- `$context-engineering`
- `$source-driven-development`
- `$incremental-implementation`
- `$test-driven-development`
- `$debugging-and-error-recovery`
- `$code-review-and-quality`
- `$security-and-hardening`
- `$consistency-guard`
- `$evidence-pack`
- `$clean-room-reference-analysis`
- `$reference-role-report`
- `$contract-extraction`
- `$source-copy-audit`
- `$no-feature-deletion-guard`
- `$pass-manifest-verification`
- `$characterization-tests`
- `$privacy-boundary-review`
- `$data-egress-review`
- `$autometa-frontend-design`
- `$autometa-backend-api`
- `$autometa-sourcing-contracts`
- `$autometa-sourcing-pipeline`
- `$autometa-market-collectors`
- `$autometa-extension-bridge`
- `$autometa-reference-analysis`
- `$autometa-fixture-contract-tests`
- `$autometa-tool-selection`
- `$autometa-cleanroom-audit`
- `$autometa-keyword-strategy`
- `$autometa-evidence-release`
- `$authz-security-review`
- `$session-boundary-security`
- `$api-contract-change`
- `$crawler-contract-review`
- `$content-script-boundary`
- `$anti-bot-compliance-check`
- `$frontend-product-ui`
- `$api-error-handling-review`
- `$backend-test-matrix`
- `$extension-permission-review`
- `$schema-contract-check`
- `$message-contract-review`
- `$db-migration`
- `$service-repository-boundary-check`
- `$ui-state-coverage`
- `$data-quality-gate`
- `$browser-smoke`
- `$idempotency-check`
- `$documentation-and-adrs`
- `$observability-update`
- `$accessibility-check`
- `$ui-a11y-check`
- `$backward-compat-check`
- `$incident-hotfix`
- `$design-system-consistency`
- `$responsive-layout-review`
- `$form-table-filter-ux`
- `$visual-regression-plan`
- `$progress-cancel-compatibility`

## Command templates
Use `commands/` as optional cross-tool workflow prompts. Codex can call skills directly with `$skill-name`.

## References
Use `references/` for testing, security, performance, accessibility, and orchestration checklists.

## Personas
Use `agents/` as optional review personas for complex tasks, not mandatory overhead.

## Done definition
Work is not done until changed files, validation evidence, risks, and next steps are summarized.
