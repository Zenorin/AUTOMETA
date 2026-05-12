# WBS-20 Local Runtime Execution Policy

## Scope

WBS-20 defines the controlled local runtime execution policy and
fixture-to-runtime promotion gates before any runtime product code is opened.
This slice is planning/evidence only. It does not implement runtime product
code, API lifecycle actions, a persisted job store, browser automation,
marketplace access, live crawling, login automation, credential/session
handling, secrets, or external API calls.

## Current Default

Fixture-only behavior remains the current default. Synthetic or sanitized
fixtures are the only collector evidence source. WBS-13 fixture data, WBS-14
deterministic core validation, WBS-15 fixture API boundaries, WBS-16 web states,
WBS-17 extension readiness messages, WBS-18 browser/session design boundaries,
and WBS-19 integration evidence remain the active foundation.

## Local Runtime Execution Policy

Later WBS items may introduce local runtime behavior only after the promotion
gates in this document are satisfied. Local runtime means:

- Execution stays on the developer/user machine.
- Runtime state may be persisted locally in later WBS items.
- API lifecycle behavior may create, read, cancel, and retry local jobs in
  later WBS items.
- Web and extension behavior may connect to the local API boundary in later WBS
  items.
- Runtime audit and clean-room safety events may be recorded locally in later
  WBS items.
- The runtime remains local-only until a later go/no-go decision explicitly
  opens a narrower boundary.

## Allowed Local-Only Behaviors

- Local persisted job metadata, status, timestamps, lifecycle state, retry
  state, cancel state, policy decisions, and clean-room safety event IDs.
- Local API handlers and tests for deterministic job lifecycle behavior.
- Local web UI states that call only the local API boundary.
- Extension readiness messages that use explicit request/correlation IDs and
  cannot access page, storage, cookie, session, token, credential, or account
  data.
- Local audit records that prove unsupported live boundaries remain blocked.

## Forbidden Runtime Behaviors

- No live marketplace crawling in WBS-20.
- No marketplace access in WBS-20.
- No browser automation in WBS-20.
- No login automation.
- No reading, capturing, storing, transmitting, logging, or committing cookies,
  sessions, tokens, passwords, credentials, local storage, browser profiles,
  account data, service-account files, API keys, private keys, or secrets.
- No external API calls unless explicitly approved in a later WBS.
- No copied reference source, assets, marketplace data, generated chunks, or
  product copy.
- No validator, test, clean-room audit, unsupported-source guard, or safety
  boundary weakening.

## Fixture-To-Runtime Promotion Gates

1. Contract gate: shared DTOs, API envelopes, extension message vocabulary, and
   lifecycle error semantics are documented and validated.
2. Fixture gate: deterministic fixture tests pass and synthetic/sanitized
   fixture provenance remains documented.
3. Local persistence gate: persisted files contain no secrets, credentials,
   cookies, sessions, tokens, passwords, browser profiles, account data,
   marketplace responses, or external API data.
4. Runtime audit gate: lifecycle actions produce local clean-room audit events
   that exclude secret/session material.
5. UI/API gate: web and API behavior remains deterministic under tests and
   preserves typed loading/error/cancel/retry states.
6. Extension boundary gate: extension code cannot access cookies, sessions,
   tokens, local storage, credentials, browser profiles, account data, or
   marketplace pages.
7. Integration gate: local-only integration smoke passes across API, web,
   extension, collectors, and core with clean-room audit passing.
8. Go/no-go gate: live collection remains blocked until the WBS-28 decision
   explicitly approves a later limited boundary.

## ASGI/TestClient Risk

The WBS-05 full ASGI/TestClient deferred-smoke risk remains preserved. WBS-20
does not resolve or hide it. Later runtime slices must either resolve that risk
with passing evidence or keep it explicitly documented.

## Validation Commands

Every WBS-20 validation command passed on the final planning/evidence slice:

| Command | Status |
| --- | --- |
| `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` | PASS |
| `node tools/checks/cleanroom-audit.mjs` | PASS |
| `pnpm validate:all` | PASS |
| `git diff --check` | PASS |

## Remaining Risks

- WBS-21 through WBS-24 will introduce local runtime behavior and must prove
  local-only execution with no external IO.
- WBS-25 must remain a stub and must not read browser state or capture
  credential/session material.
- WBS-28 is a decision gate only and must not enable live collection by itself.

## Rollback Note

Revert the WBS-20 policy evidence, boundary, phase gate, command queue, compact
command queue JSON, manifest, and `PLANS.md` changes to restore the pre-WBS-20
planning state.

## WBS-21 Local Persisted Store Evidence

WBS-21 implements the first local runtime persistence boundary. The persisted
store is local-only and records only non-secret sourcing job metadata plus
deterministic fixture/core result references. It preserves the WBS-15
fixture-only API behavior and keeps synthetic/sanitized fixtures as the current
collector evidence source.

Persisted fields:

- `job_id`
- `status`
- `source_type`
- `fixture_id`
- `created_at`
- `updated_at`
- `result_summary`
- `error_code`
- `error_message`

Forbidden persisted fields:

- `cookie`
- `session`
- `token`
- `secret`
- `password`
- `credential`
- `authorization`
- `localStorage`
- `browserStorage`
- marketplace account identifiers
- real external URLs beyond reserved fixture/synthetic URLs

Every WBS-21 validation command passed on the final local persisted store slice:

| Command | Status |
| --- | --- |
| `cd apps/api && pytest` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` | PASS |
| `node tools/checks/cleanroom-audit.mjs` | PASS |
| `pnpm validate:all` | PASS |
| `git diff --check` | PASS |

WBS-21 does not add live crawling, marketplace access, external API calls,
browser automation, login automation, or credential/session/cookie/token
handling. Test cleanup uses an isolated `AUTOMETA_JOB_STORE_PATH` temp file and
`reset_store_for_tests()`.

## WBS-22 Local API Lifecycle Evidence

WBS-22 expands the local-only API lifecycle actions on top of the WBS-21
persisted store. The implemented route boundary is:

- `POST /api/v1/sourcing/jobs`: create a persisted fixture-backed job.
- `GET /api/v1/sourcing/jobs/{job_id}`: read current persisted job status.
- `POST /api/v1/sourcing/jobs/{job_id}/cancel`: cancel queued or running local
  fixture-backed jobs only.
- `POST /api/v1/sourcing/jobs/{job_id}/retry`: retry failed or cancelled local
  fixture-backed jobs only by returning them to `queued`.
- `GET /api/v1/sourcing/jobs/{job_id}/result`: preserve deterministic
  fixture/core result output.

Status transitions:

- `queued -> cancelled`
- `running -> cancelled`
- `failed -> queued`
- `cancelled -> queued`
- `completed` remains not cancellable and not retryable

The lifecycle actions use typed API envelopes for success, `not-found` invalid
job IDs, and `conflict` unsupported status transitions. Persisted state remains
limited to non-secret job metadata, fixture IDs, timestamps, result summaries,
status, and typed error metadata.

WBS-22 does not add live crawling, marketplace access, external API calls,
browser automation, login automation, credential handling, cookie/session/token
capture, browser storage access, or secrets.

Every WBS-22 validation command passed on the final local API lifecycle slice:

| Command | Status |
| --- | --- |
| `cd apps/api && pytest` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` | PASS |
| `node tools/checks/cleanroom-audit.mjs` | PASS |
| `pnpm validate:all` | PASS |
| `git diff --check` | PASS |

Remaining risks:

- The persisted store is still a local JSON store; concurrent writes,
  migrations, and production-grade locking remain deferred.
- Web and extension runtime wiring remains deferred to WBS-23 and WBS-24.
- The WBS-05 ASGI/TestClient deferred-smoke risk remains preserved.

Rollback note: revert the WBS-22 API lifecycle routes/helpers, lifecycle tests,
API contract documentation, local-runtime evidence, phase gate, command queue,
and manifest changes to restore the WBS-21 local persisted store state.
