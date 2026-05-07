# WBS-19 Fixture Integration Smoke Evidence

## Scope

WBS-19 verifies WBS-12 through WBS-18 as one fixture-only product
foundation. This evidence slice adds documentation only. It does not add or
modify product runtime code, browser automation, marketplace access, live
crawling, login/session/cookie/token handling, secrets, or external API calls.

## Covered Modules

| Slice | Module or boundary | Evidence |
| --- | --- | --- |
| WBS-12 | `packages/contracts` | Shared sourcing job contracts define fixture-safe request, status, result, error, progress, and envelope vocabulary. |
| WBS-13 | `packages/collectors` | Deterministic collector fixtures validate synthetic fixture inputs/results without live crawling. |
| WBS-14 | `packages/core` | Core pipeline validation consumes fixture collector results and preserves deterministic stages, events, summary, and partial failures. |
| WBS-15 | `apps/api` | Fixture-only sourcing job API boundary exposes create/status/result behavior through typed envelopes. |
| WBS-16 | `apps/web` | Web shell renders fixture job creation/status/result states using WBS-15 vocabulary and static fixture evidence. |
| WBS-17 | `apps/extension` | Extension readiness messages return deterministic fixture-only readiness/status responses and typed unsupported-source errors. |
| WBS-18 | `docs/architecture/browser-session-handoff.md` | Browser/session handoff remains local-only design guidance with approval gates and no implementation. |

## Smoke Path

1. Shared sourcing job contracts provide schema version, request correlation,
   fixture-safe source policy, API envelopes, typed errors, and fixture
   collector/result vocabulary.
2. Deterministic collector fixtures supply synthetic `fixture.invalid` inputs,
   sanitized raw metadata snapshots, normalized fixture results, and typed
   partial-failure outcomes.
3. Core pipeline validation accepts the deterministic collector fixture results
   and produces deterministic output, progress/log/failure events, summary
   counts, and preserved partial failures.
4. The API exposes fixture-only sourcing job create, status, and result
   handlers that use shared contract vocabulary and deterministic in-memory
   fixture state.
5. The web shell renders fixture-only job creation/status/result UI states,
   invalid-source rejection, result summary counts, and clean-room boundary
   copy without network behavior.
6. The extension readiness boundary accepts only explicit fixture sourcing
   readiness/status messages and rejects unsupported live/external sources with
   typed errors.
7. The browser/session handoff document records a future local-only,
   human-approved, metadata-only design boundary and keeps implementation
   deferred.

## Validation Commands

Every WBS-19 validation command passed on the final fixture-only evidence
slice:

| Command | Status |
| --- | --- |
| `pnpm validate:all` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-planning --root .` | PASS |
| `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .` | PASS |
| `node tools/checks/workspace-check.mjs` | PASS |
| `node tools/checks/cleanroom-audit.mjs` | PASS |
| `git diff --check` | PASS |

## Clean-Room Boundary Assertions

- Evidence remains fixture-only and documentation-only.
- No product runtime code is changed in WBS-19.
- No marketplace access, live crawling, browser automation, login automation,
  captcha solving, anti-bot bypassing, external API calls, or background
  workers are added.
- No cookies, sessions, tokens, credentials, local storage, browser profiles,
  account data, service-account files, API keys, passwords, private keys, or
  secrets are read, exported, persisted, logged, committed, serialized, or
  stored in fixtures.
- Unsupported live/manual source behavior remains rejected by typed errors.
- Validators, clean-room audit, and prior fixture-only tests are not weakened.
- No copied reference source, generated chunks, branded assets, marketplace
  data, or product copy are introduced.

## Fixture Provenance

The WBS-13 collector fixtures are synthetic clean-room data using reserved
`fixture.invalid` URLs. WBS-14 through WBS-17 consume deterministic fixture
vocabulary or static fixture examples derived from those contracts. WBS-18 is a
design-only document. WBS-19 adds no new fixture data and does not capture live
marketplace responses.

## Remaining Risks

- WBS-05 carried a full ASGI/TestClient smoke risk because TestClient hung in
  the earlier local environment. WBS-19 preserves that risk as documented
  planning evidence while relying on direct API handler pytest coverage and
  aggregate `pnpm validate:all` results.
- Future browser/session work remains deferred and requires a later approved
  WBS with security, privacy, anti-bot compliance, contract, test, clean-room,
  secret-scanning, dependency/permission, and rollback evidence.

## Rollback Note

Revert the WBS-19 evidence document, phase gate, command queue, compact command
queue JSON, and manifest changes to restore the pre-WBS-19 planning state.

## Next Rollout Decision

The next safe rollout decision is a handoff from fixture-backed foundation
evidence to a separately approved product slice. No live marketplace,
browser/session, automation, or external network behavior is approved by
WBS-19.
