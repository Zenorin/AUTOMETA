# AGENTS.md — extension

Scope: `apps/extension`
Module type: `browser-extension`
Bundles: browser-extension
Policy packs: none

## Generated preferred skills
- `$project-extension-bridge`
- `$content-script-boundary`
- `$privacy-boundary-review`
- `$consistency-guard`
- `$evidence-pack`

## Optional skills not generated under current budget
- `$extension-permission-review`
- `$message-contract-review`
- `$browser-smoke`

## Project workstreams
- `$project-extension-bridge`

## Local commands
- Use root commands unless this module defines more specific ones.

## Local boundaries
- Minimal MV3 permissions only.
- Content script cannot access secrets or bypass site controls.

## Local quality gates
- Manifest permission rationale documented.
- Message contracts validated.

## Done definition
- Summarize changed files, validation, unresolved risks, and next steps for this module.
