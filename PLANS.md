# PLANS.md — AUTOMETA Bulsaja Clean Room Rebuild

Use this file for ambiguous or multi-step work. Current slice: next-phase planning after completed WBS-11 handoff.

## Goal
- Create the next development phase for actual AUTOMETA product work beyond the completed clean-room scaffold/bootstrap phase.
- Keep this slice planning-only: update WBS, phase gates, and command queue without implementing product code.
- Ensure `generate-next-command` selects the first new actionable WBS item after WBS-11.

## Phase Name
Fixture-Backed Product Foundation

This phase moves from scaffold readiness to fixture-backed product behavior. It keeps live marketplace crawling, browser automation, login, session extraction, cookie handling, token handling, credential handling, and external API calls disabled unless a later approved phase explicitly opens one of those boundaries.

## New WBS Items
| WBS | Phase | Workstream | Scope |
|---|---|---|---|
| WBS-12 | product-contracts | `project-contracts` | Expand shared sourcing job DTOs, progress/cancel/status vocabulary, typed errors, and request correlation. |
| WBS-13 | fixture-collectors | `project-market-collectors` | Add deterministic collector fixtures and fixture result contract checks using synthetic or sanitized data only. |
| WBS-14 | core-validation | `project-core-pipeline` | Validate core pipeline inputs/outputs against fixture collector results and preserve partial failures. |
| WBS-15 | backend-jobs | `project-backend-api` | Implement fixture-only sourcing job API boundary with typed envelopes and tests. |
| WBS-16 | web-jobs | `project-frontend-design` | Add web job creation/status UI states using shared API envelope vocabulary. |
| WBS-17 | extension-job-bridge | `project-extension-bridge` | Align extension request messages with sourcing job readiness contracts without wildcard trust or session handling. |
| WBS-18 | session-handoff-design | `project-development-bootstrap` | Document local-only browser session handoff boundaries; design only, no implementation. |
| WBS-19 | fixture-integration | `project-development-bootstrap` | Add fixture-only integration smoke evidence across modules and keep clean-room audit passing. |

## Planning Evidence
- Files/docs inspected: `AGENTS.md`, `docs/product/PRD.md`, `docs/planning/WBS.md`, `docs/planning/wbs-manifest.json`, `docs/planning/phase-gates.md`, `docs/planning/codex-command-queue.md`, `PLANS.md`.
- WBS-00 through WBS-11 remain marked `done`.
- WBS-12 through WBS-19 are new `todo` items and depend sequentially on WBS-11.
- The command queue Markdown and JSON are both updated because planning validation reads `docs/planning/codex-command-queue.json`.
- The first generated next command should now target WBS-12, not a completed bootstrap item.

## Validation Commands
Required for this planning slice:
- `python -S tools/codex/codex_skillset_generator.py validate-planning --root .`
- `python -S tools/codex/codex_skillset_generator.py validate-dev-flow --root .`
- `python -S tools/codex/codex_skillset_generator.py generate-next-command --config codex-profile.json --root .`

## Clean-Room Boundaries
- No product code changes in this planning slice.
- No copied reference source, assets, marketplace data, or product copy.
- No hidden session, cookie, token, credential, or browser profile handling.
- No real marketplace crawling, login automation, browser automation, or external API calls.
- No mock-success fallback to hide unsupported messages, collector failures, pipeline failures, or API errors.
- No real secrets in repository files, logs, fixtures, tests, or docs.

## Risks
- Full ASGI TestClient/client smoke remains a carried risk from WBS-05 if the local environment still hangs; WBS-15 and WBS-19 must keep that risk visible instead of hiding it.
- Fixture data must be synthetic or sanitized and must include provenance in WBS-13 evidence.
- Package-level type exports are still not formalized for internal workspace packages; future slices should fix only if directly required by validation.

## Rollback
Revert the planning-only edits to `PLANS.md`, `docs/planning/wbs-manifest.json`, `docs/planning/phase-gates.md`, `docs/planning/codex-command-queue.md`, and `docs/planning/codex-command-queue.json` to restore the completed WBS-11 handoff state.
