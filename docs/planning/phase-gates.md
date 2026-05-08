# Phase Gates

| Phase | PASS condition | FAIL / blocker |
|---|---|---|
| intake | `python -S tools/codex/codex_skillset_generator.py validate-generated --root .` passes or blocker is documented | Missing evidence, path mismatch, secret exposure, or unapproved behavior deletion |
| stack-decision | `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` passes or blocker is documented | Missing evidence, path mismatch, secret exposure, or unapproved behavior deletion |
| bootstrap | `python -S tools/codex/codex_skillset_generator.py validate-scaffold --root .` passes or blocker is documented | Missing evidence, path mismatch, secret exposure, or unapproved behavior deletion |
| reference-analysis | `pnpm cleanroom:audit` passes or blocker is documented | Missing evidence, path mismatch, secret exposure, or unapproved behavior deletion |
| contracts | `pnpm --filter @project/contracts typecheck` passes and shared DTO/schema contracts remain the source of truth for API envelopes, collector results, pipeline events, errors, and extension messages | Type errors, duplicated contract shapes, missing schema versioning, secret/session material in DTOs, path mismatch, or unapproved behavior deletion |
| backend-api | `cd apps/api && pytest` passes for health/error envelope smoke; full ASGI client integration smoke remains deferred to integration validation because TestClient hung in this environment during WBS-05 | Pytest failure, health/error envelope mismatch, hidden credential/session handling, or unresolved ASGI smoke blocker without documented integration follow-up |
| frontend-shell | `pnpm --filter web build` passes and the shell remains wired to the shared API envelope vocabulary without adding product behavior beyond scaffold states | Build failure, broken envelope copy, missing empty/loading/error/success states, or unapproved feature deletion |
| extension-bridge | `pnpm --filter extension build` passes and MV3 manifest/message boundary support requestId correlation plus typed unsupported-message errors | Build failure, wildcard external trust, cookie/session/credential handling, live crawling, or mock-success fallback |
| collectors | `pnpm --filter @project/collectors typecheck` passes and collector contracts keep raw capture metadata separate from normalized `MarketCollectorResult` output | Type errors, selector-only contract without fallback evidence, hidden session/cookie/token handling, marketplace crawling, or collapsed partial failures |
| core-pipeline | `pnpm --filter @project/core typecheck` passes and core orchestration preserves partial failures across collect, normalize, filter, dedupe, enrich, image_search_ready, save_ready, and summarize stages | Type errors, new IO/browser/API work in core, generic failure collapse, mock-success fallback, or missing cancel/retry readiness |
| integration | `pnpm validate:all` passes after the direct smoke checks for contracts, API, web, extension, collectors, core, scaffold, planning, dev-flow, workspace, and clean-room audit | Any failing module check; WBS-10 is not done until the failure is classified by source module and fixed without bypassing tests or weakening clean-room boundaries |
| handoff | `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` passes or blocker is documented | Missing evidence, path mismatch, secret exposure, or unapproved behavior deletion |
| product-contracts | `pnpm --filter @project/contracts typecheck`, `pnpm --filter @project/contracts test`, planning/dev-flow validation, and `pnpm validate:all` pass; sourcing job DTOs/errors/events remain shared-contract first and fixture-safe | Contract drift across API/web/extension/core, missing typed errors, mock-success fallback, secret/session fields, external IO, live crawling, or unapproved feature deletion |
| fixture-collectors | `pnpm --filter @project/collectors typecheck` passes and deterministic fixtures represent only synthetic or sanitized fixture data | Live marketplace crawling, copied reference data/assets, hidden session/cookie/token handling, fixture provenance gaps, or type mismatch |
| core-validation | `pnpm --filter @project/core typecheck` passes and core input/output validation preserves partial failures using fixture collector results | Generic failure collapse, external API/browser IO in core, mock-success fallback, or fixture/result contract mismatch |
| backend-jobs | `cd apps/api && pytest` passes for fixture-only sourcing job create/status/progress/cancel boundaries | Real marketplace calls, hidden session handling, untyped error envelopes, ASGI/client smoke hangs hidden instead of documented, or weakened tests |
| web-jobs | `pnpm --filter @project/web typecheck` and `pnpm --filter @project/web test` pass for sourcing job creation/status UI states | Missing loading/empty/error/partial/cancel states, API envelope mismatch, product copy that implies live crawling, or broken responsive layout |
| extension-job-bridge | `pnpm --filter extension build` passes and extension messages remain explicitly allowed, request-correlated, and unsupported-message typed | Wildcard external trust, login/session/cookie/credential extraction, live crawling, or mock success for unsupported messages |
| session-handoff-design | Planning/dev-flow validation, clean-room audit, `pnpm validate:all`, and `git diff --check` pass; `docs/architecture/browser-session-handoff.md` documents a design-only, local-only browser/session handoff boundary with approval gates and no runtime code | Any implementation of browser automation, cookie/session/token capture, credential storage, browser profile/account data handling, marketplace access, live crawling, external API calls, or weakened clean-room validation before approval |
| fixture-integration | `pnpm validate:all`, planning/dev-flow validation, workspace check, clean-room audit, and `git diff --check` pass with fixture-only end-to-end smoke evidence in `docs/evidence/fixture-integration-smoke.md` | Any failing module check, hidden external IO, copied source/assets, real secrets, product runtime code change, or unclassified ASGI/TestClient integration blocker |
| local-runtime-policy | Planning/dev-flow validation and `generate-next-command` pass with WBS-20 defining local runtime execution policy and fixture-to-runtime promotion gates | Policy gaps that allow live crawling, marketplace access, browser automation, credential/session handling, external API calls, or hidden ASGI/TestClient risk |
| local-job-store | API tests and `pnpm validate:all` pass with a persisted local sourcing job store that stores no secrets/session material and performs no external IO | Credential/session storage, marketplace access, live crawling, hidden external IO, unsafe persistence, or weakened API tests |
| api-job-lifecycle | API lifecycle create/read/cancel/retry tests pass against the local store with typed errors and local-only behavior | Untyped lifecycle errors, hidden background crawling, unsafe retry behavior, session handling, or ASGI/TestClient risk hidden |
| web-local-api-lifecycle | Web typecheck/test and API tests pass with UI wired to local API lifecycle states only | UI implying live collection, broken local API contracts, missing error/cancel/retry states, or secret/session fields |
| extension-local-api-readiness | Extension typecheck/build/test pass with readiness messages aligned to the local API boundary and no page/session access | Wildcard trust, content-script data extraction, credential/session access, marketplace URL access, or browser automation |
| browser-session-stub | Planning/security/privacy checks pass with a local-only stub that captures no credentials, cookies, tokens, sessions, browser profiles, or account data | Any browser state read/export, credential capture, login automation, marketplace access, or permission expansion without approval |
| runtime-audit-log | API/tests pass with local audit and clean-room safety event records that exclude secrets/session material | Logs containing credentials/session data, missing safety events, external egress, or audit records that mask failures |
| local-runtime-integration | Local-only integration tests pass across API, web, extension, collectors, and core with clean-room audit passing | Live network access, marketplace crawling, browser automation, hidden session handling, or fixture-to-runtime contract drift |
| live-boundary-go-no-go | Go/no-go decision evidence is documented and validation passes without enabling live collection | Any runtime enablement of live crawling, marketplace access, browser automation, credential/session handling, or external API calls |

## WBS-10 Integration Evidence

WBS-10 connects completed scaffold slices; it does not add product features. The integration gate expects these direct smoke commands to pass before the full `pnpm validate:all` aggregate is accepted:

| Slice | Smoke command | Expected PASS criteria |
|---|---|---|
| WBS-04 shared contracts | `pnpm --filter @project/contracts typecheck` | Shared DTOs compile and remain the canonical source for schema version, API envelope, error envelope, collector result, pipeline event, retry/cancel, and extension message vocabulary |
| WBS-05 API shell | `cd apps/api && pytest` | Health route and error envelope smoke tests pass; ASGI TestClient/full integration smoke remains deferred from WBS-05 because TestClient hung in this environment |
| WBS-06 frontend shell | `pnpm --filter web build` | Web shell builds with scaffold states and API envelope terminology intact |
| WBS-07 extension bridge | `pnpm --filter extension build` | MV3 manifest and typed background message boundary compile with requestId/correlationId handling and typed unsupported-message errors |
| WBS-08 collectors | `pnpm --filter @project/collectors typecheck` | Collector contract scaffold compiles with raw/normalized split, blocked-session/rate-limit evidence, and no live crawling/session extraction |
| WBS-09 core pipeline | `pnpm --filter @project/core typecheck` | Core pipeline scaffold compiles with explicit stages/states, progress/log/failure events, preserved partial failures, and cancel/retry readiness |
| Workspace and clean room | `python -S tools/codex/validate_scaffold.py --root .`; `python -S tools/codex/validate_planning.py --root .`; `python -S tools/codex/validate_dev_flow.py --root .`; `node tools/checks/workspace-check.mjs`; `node tools/checks/cleanroom-audit.mjs` | Scaffold, planning, dev-flow ordering, workspace scripts, and clean-room artifact checks pass |

Clean-room boundaries for this gate:
- No copied reference source or assets.
- No hidden session, cookie, token, or credential handling.
- No real marketplace crawling, browser automation, login automation, or external API calls.
- No mock-success fallback to hide unsupported messages, collector failures, or pipeline failures.
- No real secrets in repository files, logs, fixtures, or docs.

Known carried risk:
- WBS-05 deferred full ASGI TestClient smoke because TestClient hung in the local environment. WBS-10 keeps that risk visible and moves ASGI client/integration smoke into integration validation instead of marking it silently complete.

## Next Phase: Fixture-Backed Product Foundation

The next development phase starts after completed WBS-11 handoff and moves from scaffold readiness to fixture-backed product behavior. It keeps all collection, browser session, login, cookie, token, credential, marketplace automation, and external API behavior disabled unless a later approved WBS explicitly opens that boundary.

| WBS | Phase | Gate intent |
|---|---|---|
| WBS-12 | product-contracts | Expand shared sourcing job contracts for create/status/progress/cancel, typed errors, and request correlation before API/web/extension implementation. |
| WBS-13 | fixture-collectors | Add deterministic collector fixtures and fixture contract checks using synthetic or sanitized fixture data only; collectors typecheck/test, planning/dev-flow validation, and `pnpm validate:all` pass before done. |
| WBS-14 | core-validation | Validate core pipeline inputs/outputs against fixture collector results without adding external IO. |
| WBS-15 | backend-jobs | Add fixture-only sourcing job API boundary and tests using shared envelopes. |
| WBS-16 | web-jobs | Add web job creation/status UI states driven by the API envelope vocabulary. |
| WBS-17 | extension-job-bridge | Connect extension readiness messages to the sourcing job boundary without wildcard trust or session extraction. |
| WBS-18 | session-handoff-design | Document local-only browser session handoff boundaries in `docs/architecture/browser-session-handoff.md`; design only, no implementation. |
| WBS-19 | fixture-integration | Add fixture-only integration smoke evidence across modules and keep ASGI/TestClient risk visible if it still reproduces. |

Clean-room boundaries for this phase:
- No copied reference source, assets, marketplace data, or product copy.
- No hidden session, cookie, token, credential, or browser profile handling.
- No real marketplace crawling, login automation, browser automation, or external API calls.
- No mock-success fallback to hide unsupported messages, collector failures, pipeline failures, or API errors.
- No real secrets in repository files, logs, fixtures, tests, or docs.

## WBS-12 Contract Evidence

WBS-12 is complete when the shared contracts export fixture-backed sourcing job
vocabulary without adding runtime product behavior. The completed contract slice
adds:

- `SourcingJobId`, `SourcingJobStatus`, and `SourcingJobSourceType`
- `SourcingJobRequest`, `SourcingJobCreatedResponse`, and
  `SourcingJobStatusResponse`
- `SourcingJobResultSummary`, `SourcingJobError`, and
  `SourcingJobProgress`
- `FixtureCollectorInput`, `FixtureCollectorResult`, `FixtureProvenance`, and
  `NormalizedMarketItem`
- `SourcingJobCreateApiResponse` and `SourcingJobStatusApiResponse` aliases
  using `ApiResponseEnvelope<TData>`

This gate remains fixture-safe: no live marketplace crawling, login automation,
hidden cookie/session/token handling, credential handling, external API calls,
secrets, or copied reference source/assets are allowed.

## WBS-13 Fixture Collector Evidence

WBS-13 is complete when deterministic collector fixtures exercise shared
fixture collector contracts without adding runtime crawling behavior. The
completed collector slice adds:

- Synthetic fixture collector inputs and normalized fixture results.
- Sanitized raw metadata snapshots kept outside the normalized result payload.
- Contract checks for shared schema version, market IDs, result statuses,
  fixture provenance, and collector failure reasons.
- Typed fixture outcomes for success, partial rate-limit failure, and
  unsupported-market failure.

Fixture provenance: the WBS-13 fixture set is synthetic clean-room data using
reserved `fixture.invalid` URLs. It contains no marketplace data, secrets,
cookies, tokens, credentials, session material, browser automation, live
crawling, or external API output.

## WBS-14 Core Fixture Validation Evidence

WBS-14 is complete when the core pipeline validates deterministic input and
output envelopes against the WBS-13 fixture collector results without adding
external IO. The completed core-validation slice adds:

- `CorePipelineInput`, `CorePipelineStatus`, and `CorePipelineSummary`.
- `normalizeFixtureCollectorResult`, `validateCorePipelineInput`,
  `validateCorePipelineResult`, and `runDeterministicSourcingPipeline`.
- Deterministic status/summary fields on `CorePipelineResult`.
- Fixture tests proving accepted collector fixtures, rejected invalid fixture
  shape, deterministic output, expected summary/status fields, typed
  progress/log/failure events, and preserved partial failures.

The raw/normalized split remains explicit: sanitized raw snapshots are accepted
only on `CorePipelineInput.rawSnapshots`, while normalized fixture collector
results remain separate under `CorePipelineInput.collectorResults`; core output
does not embed raw metadata. This gate remains fixture-only: no live crawling,
browser automation, login/session/cookie/token handling, credential handling,
external API calls, secrets, or copied reference source/assets are allowed.

## WBS-15 Fixture API Boundary Evidence

WBS-15 is complete when the API exposes fixture-only sourcing job create,
status, and result boundaries using shared API envelopes and deterministic
fixture data. The completed backend-jobs slice adds:

- `POST /api/v1/sourcing/jobs` for fixture-backed job creation.
- `GET /api/v1/sourcing/jobs/{job_id}` for job status, progress, summary,
  retry state, and typed errors.
- `GET /api/v1/sourcing/jobs/{job_id}/result` for deterministic core pipeline
  output derived from the WBS-13 fixture collector results.
- Handler-level tests for health, create, status, result, invalid job ID,
  unsupported live/external source rejection, and response secret/session field
  exclusion.

The API boundary reads only synthetic fixture JSON and keeps state in a
deterministic in-memory fixture job record. It does not add background workers,
live marketplace crawling, browser automation, login/session/cookie/token
handling, credential handling, external API calls, secrets, or copied reference
source/assets. ASGI/TestClient smoke remains a carried risk; this slice keeps
coverage at direct handler level so hangs are not hidden.

## WBS-16 Fixture Web UI Evidence

WBS-16 is complete when the web shell renders fixture-only sourcing job
creation/status/result states using the WBS-15 API envelope vocabulary. The
completed web-jobs slice adds:

- A fixture job console with ready, creating, queued, completed, failed, and
  invalid-source rejected states.
- Job status, progress, result summary counts, collector statuses, and an
  unsupported source guard.
- A clean-room boundary notice that keeps live marketplace access visibly
  blocked.
- Server-rendered tests for shell continuity, fixture job labels, unsupported
  source rejection, sensitive field-name exclusion, and result summary/status
  copy.

The UI uses deterministic static envelope examples and does not call live
marketplaces, automate browsers, require login, handle session/cookie/token
material, expose credentials, add secrets, or copy reference source/assets.

## WBS-17 Fixture Extension Readiness Evidence

WBS-17 is complete when the extension message boundary supports fixture-only
sourcing job readiness/status messages without opening live collection or page
access. The completed extension-job-bridge slice adds:

- `SOURCING_JOB_READY_CHECK`, `SOURCING_JOB_FIXTURE_REQUEST`, and
  `SOURCING_JOB_STATUS_QUERY` message constants.
- Deterministic fixture readiness and completed status responses aligned with
  the WBS-15 API route vocabulary.
- Typed rejection for unsupported live/external source payloads and unknown
  messages.
- An inert content-script boundary marker plus tests proving no marketplace URL
  access, browser automation, or private browser field exposure is introduced.

The extension does not call real API endpoints, access marketplace pages,
automate browsers, read cookies/sessions/tokens/credentials/local storage, add
secrets, or change MV3 permissions.

## WBS-18 Browser Session Handoff Design Evidence

WBS-18 is complete when local-only browser session handoff is documented as a
future design boundary only. The completed session-handoff-design slice adds:

- `docs/architecture/browser-session-handoff.md` as the canonical local-only
  browser/session handoff boundary.
- Architecture and contract wording that keeps WBS-15 through WBS-17
  fixture-only behavior intact.
- Explicit allowed, forbidden, and deferred behavior for any future controlled
  product phase.
- Future approval gates for security, privacy, anti-bot compliance, contracts,
  tests, clean-room audit, and rollback evidence.

This slice adds no implementation code, dependencies, permissions, scripts,
browser automation, marketplace access, live crawling, external API calls,
cookie/session/token extraction, credential handling, local storage access,
browser profile access, account-data handling, secrets, fixtures, or runtime
configuration. Secrets, credentials, cookies, tokens, sessions, browser
profiles, account data, service-account files, API keys, passwords, and private
keys must never be committed, logged, serialized, stored in fixtures, or copied
into docs as real values.

## WBS-19 Fixture Integration Smoke Evidence

WBS-19 is complete when `docs/evidence/fixture-integration-smoke.md` records
fixture-only integration evidence across WBS-12 through WBS-18 and all WBS-19
validation commands pass. The completed fixture-integration slice verifies:

- Shared sourcing job contracts from WBS-12.
- Deterministic collector fixtures from WBS-13.
- Deterministic core pipeline validation from WBS-14.
- Fixture-only sourcing job API boundaries from WBS-15.
- Web job creation/status UI states from WBS-16.
- Extension sourcing readiness messages from WBS-17.
- Local-only browser session handoff design boundaries from WBS-18.

This slice is evidence-only and does not modify product runtime code. It keeps
live marketplace access, live crawling, browser automation, login/session
cookie/token handling, credential handling, secrets, and external API calls
disabled. The WBS-05 ASGI/TestClient deferred-smoke risk remains documented
instead of being hidden by WBS-19.

## Next Phase: Controlled Local Runtime Implementation

The next development phase starts after completed WBS-19 fixture integration
evidence. It promotes fixture-backed behavior into controlled local runtime
steps while keeping live crawling, marketplace access, browser automation,
login automation, credential/session/cookie/token handling, secrets, and
external API calls disabled unless a later approved go/no-go gate explicitly
opens one narrow boundary.

| WBS | Phase | Gate intent |
|---|---|---|
| WBS-20 | local-runtime-policy | Define local runtime execution policy and fixture-to-runtime promotion gates before implementation. |
| WBS-21 | local-job-store | Implement persisted local sourcing job store with no credential/session material and no external IO. |
| WBS-22 | api-job-lifecycle | Add local API job lifecycle actions for create, read, cancel, and retry. |
| WBS-23 | web-local-api-lifecycle | Connect web UI to the real local API job lifecycle while preserving local-only states. |
| WBS-24 | extension-local-api-readiness | Connect extension readiness messages to the local API boundary without page/session access. |
| WBS-25 | browser-session-stub | Add controlled local browser-session handoff stub without credential capture or browser state reads. |
| WBS-26 | runtime-audit-log | Add runtime audit log and clean-room safety event records excluding secrets/session material. |
| WBS-27 | local-runtime-integration | Add local-only integration tests across API, web, extension, collectors, and core. |
| WBS-28 | live-boundary-go-no-go | Prepare a go/no-go decision for opening a limited live collection boundary; decision only, no enablement. |

Clean-room boundaries for this phase:
- No copied reference source, assets, marketplace data, or product copy.
- No live marketplace crawling, marketplace access, browser automation, login
  automation, external API calls, or hidden network egress.
- No cookie, session, token, password, credential, browser profile, account
  data, service-account file, API key, private key, or secret capture/storage.
- No validator, test, clean-room audit, unsupported-source guard, or safety
  event weakening.
- Preserve the WBS-05 full ASGI/TestClient deferred-smoke risk until a later
  slice either resolves it with evidence or keeps it explicitly carried.
