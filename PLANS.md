# PLANS.md — AUTOMETA Controlled Local Runtime Implementation

Use this file for ambiguous or multi-step work. Current slice: next-phase
planning after the completed Fixture-Backed Product Foundation phase.

## Goal

- Create the next controlled local runtime implementation phase after WBS-19.
- Keep this slice planning-only: update planning docs and queues without
  implementing product runtime code.
- Ensure `generate-next-command` selects WBS-20 as the first new actionable WBS
  item.

## Completed Context

- WBS-00 through WBS-11 are complete.
- WBS-12 through WBS-19 are complete.
- WBS-19 added fixture-only integration smoke evidence across contracts,
  collectors, core, API, web, extension, and local-only browser/session handoff
  design.
- No marketplace access, live crawling, browser automation,
  login/session/cookie/token handling, secrets, or external API calls are
  enabled.
- The WBS-05 full ASGI/TestClient deferred-smoke risk remains preserved.

## Phase Name

Controlled Local Runtime Implementation

This phase promotes the fixture-backed foundation into local runtime behavior in
small controlled steps. It allows local persistence, local API lifecycle
actions, UI/API wiring, extension-to-local-API readiness, local-only safety
audit records, and local integration tests. It does not open live crawling,
marketplace access, browser automation, login automation, credential capture,
cookie/session/token handling, secrets, or external API calls.

## New WBS Items

| WBS | Phase | Workstream | Scope |
| --- | --- | --- | --- |
| WBS-20 | local-runtime-policy | `project-development-bootstrap` | Define local runtime execution policy and fixture-to-runtime promotion gates before implementation. |
| WBS-21 | local-job-store | `project-backend-api` | Implement a persisted local sourcing job store without credentials, sessions, marketplace access, or external IO. |
| WBS-22 | api-job-lifecycle | `project-backend-api` | Add API job lifecycle actions for create, read, cancel, and retry against the local store. |
| WBS-23 | web-local-api-lifecycle | `project-frontend-design` | Connect web UI states to the real local API job lifecycle. |
| WBS-24 | extension-local-api-readiness | `project-extension-bridge` | Connect extension readiness messages to the local API boundary without page/session access. |
| WBS-25 | browser-session-stub | `project-development-bootstrap` | Add a controlled local browser-session handoff stub without credential capture. |
| WBS-26 | runtime-audit-log | `project-backend-api` | Add runtime audit log and clean-room safety event records. |
| WBS-27 | local-runtime-integration | `project-development-bootstrap` | Add local-only integration tests across API, web, extension, collectors, and core. |
| WBS-28 | live-boundary-go-no-go | `project-development-bootstrap` | Prepare a go/no-go decision for opening a limited live collection boundary. |

## Planning Evidence

- Files/docs inspected: `AGENTS.md`, `docs/product/PRD.md`,
  `docs/planning/WBS.md`, `docs/planning/wbs-manifest.json`,
  `docs/planning/phase-gates.md`, `docs/planning/codex-command-queue.md`,
  `docs/planning/codex-command-queue.json`, `PLANS.md`.
- WBS-00 through WBS-19 remain marked `done`.
- WBS-20 through WBS-28 are added as `todo` and depend sequentially from
  WBS-19.
- The command queue Markdown and JSON are both updated because planning
  validation and next-command generation read the planning state.
- The first generated next command should now target WBS-20.

## Validation Commands

Required for this planning slice:

- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `python -S tools/codex/codex_skillset_generator.py generate-next-command --config codex-profile.json --root .`
- `pnpm validate:all`
- `git diff --check`

## Clean-Room Boundaries

- No product runtime code changes in this planning slice.
- No copied reference source, assets, marketplace data, or product copy.
- No live marketplace crawling, marketplace access, browser automation, login
  automation, or external API calls.
- No session, cookie, token, password, credential, browser profile, account
  data, or secret capture/storage/transmission.
- No validator, test, clean-room audit, unsupported-source guard, or safety
  boundary weakening.

## Risks

- Full ASGI/TestClient/client smoke remains a carried risk from WBS-05 and
  must stay visible in WBS-20 through WBS-28 evidence until resolved.
- WBS-21 through WBS-24 introduce local runtime behavior, so their gates must
  prove local-only execution and no external IO.
- WBS-25 is a stub only; it must not read browser state or capture
  credentials/session material.
- WBS-28 is a decision gate only; it must not enable limited live collection by
  itself.

## Rollback

Revert the planning-only edits to `PLANS.md`,
`docs/planning/wbs-manifest.json`, `docs/planning/phase-gates.md`,
`docs/planning/codex-command-queue.md`, and
`docs/planning/codex-command-queue.json` to restore the completed WBS-19
fixture foundation state.
