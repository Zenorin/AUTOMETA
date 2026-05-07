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
| product-contracts | `pnpm --filter @project/contracts typecheck` passes and sourcing job DTOs/errors/events remain shared-contract first | Contract drift across API/web/extension/core, missing typed errors, mock-success fallback, secret/session fields, or unapproved feature deletion |
| fixture-collectors | `pnpm --filter @project/collectors typecheck` passes and deterministic fixtures represent only synthetic or sanitized fixture data | Live marketplace crawling, copied reference data/assets, hidden session/cookie/token handling, fixture provenance gaps, or type mismatch |
| core-validation | `pnpm --filter @project/core typecheck` passes and core input/output validation preserves partial failures using fixture collector results | Generic failure collapse, external API/browser IO in core, mock-success fallback, or fixture/result contract mismatch |
| backend-jobs | `cd apps/api && pytest` passes for fixture-only sourcing job create/status/progress/cancel boundaries | Real marketplace calls, hidden session handling, untyped error envelopes, ASGI/client smoke hangs hidden instead of documented, or weakened tests |
| web-jobs | `pnpm --filter @project/web typecheck` and `pnpm --filter @project/web test` pass for sourcing job creation/status UI states | Missing loading/empty/error/partial/cancel states, API envelope mismatch, product copy that implies live crawling, or broken responsive layout |
| extension-job-bridge | `pnpm --filter extension build` passes and extension messages remain explicitly allowed, request-correlated, and unsupported-message typed | Wildcard external trust, login/session/cookie/credential extraction, live crawling, or mock success for unsupported messages |
| session-handoff-design | Planning/dev-flow validation passes and the local-only browser session handoff remains design-only | Any implementation of cookie/session/token capture, credential storage, login automation, or marketplace automation before approval |
| fixture-integration | `pnpm validate:all` and `node tools/checks/cleanroom-audit.mjs` pass with fixture-only end-to-end smoke evidence | Any failing module check, hidden external IO, copied source/assets, real secrets, or unclassified ASGI/TestClient integration blocker |

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
| WBS-13 | fixture-collectors | Add deterministic collector fixtures and fixture contract checks using synthetic or sanitized fixture data only. |
| WBS-14 | core-validation | Validate core pipeline inputs/outputs against fixture collector results without adding external IO. |
| WBS-15 | backend-jobs | Add fixture-only sourcing job API boundary and tests using shared envelopes. |
| WBS-16 | web-jobs | Add web job creation/status UI states driven by the API envelope vocabulary. |
| WBS-17 | extension-job-bridge | Connect extension readiness messages to the sourcing job boundary without wildcard trust or session extraction. |
| WBS-18 | session-handoff-design | Document local-only browser session handoff boundaries; design only, no implementation. |
| WBS-19 | fixture-integration | Add fixture-only integration smoke evidence across modules and keep ASGI/TestClient risk visible if it still reproduces. |

Clean-room boundaries for this phase:
- No copied reference source, assets, marketplace data, or product copy.
- No hidden session, cookie, token, credential, or browser profile handling.
- No real marketplace crawling, login automation, browser automation, or external API calls.
- No mock-success fallback to hide unsupported messages, collector failures, pipeline failures, or API errors.
- No real secrets in repository files, logs, fixtures, tests, or docs.
