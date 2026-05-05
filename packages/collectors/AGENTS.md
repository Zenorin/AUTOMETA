# AGENTS.md — collectors

Scope: `packages/collectors`
Module type: `crawler-session`
Bundles: crawler-session
Policy packs: none

## Generated preferred skills
- `$project-market-collectors`
- `$crawler-contract-review`
- `$session-boundary-security`
- `$anti-bot-compliance-check`
- `$consistency-guard`
- `$evidence-pack`
- `$privacy-boundary-review`

## Optional skills not generated under current budget
- `$idempotency-check`

## Project workstreams
- `$project-market-collectors`

## Local commands
- Use root commands unless this module defines more specific ones.

## Local boundaries
- Collectors must respect access controls, robots/ToS constraints, rate limits, and user-owned sessions.
- Raw collection and normalized output remain separate.

## Local quality gates
- Input/output/error schema exists for Coupang, Naver, 1688/Taobao/AliExpress-class references before implementation.
- Selector fallback and blocked-session evidence are documented.

## Done definition
- Summarize changed files, validation, unresolved risks, and next steps for this module.
