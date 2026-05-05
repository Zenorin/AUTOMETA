# AGENTS.md — api

Scope: `apps/api`
Module type: `backend-api`
Bundles: backend-api
Policy packs: none

## Generated preferred skills
- `$project-backend-api`
- `$api-contract-change`
- `$api-error-handling-review`
- `$backend-test-matrix`
- `$authz-security-review`
- `$consistency-guard`
- `$evidence-pack`

## Optional skills not generated under current budget
- `$db-migration`
- `$observability-update`
- `$backward-compat-check`
- `$incident-hotfix`
- `$service-repository-boundary-check`

## Project workstreams
- `$project-backend-api`

## Local commands
- Use root commands unless this module defines more specific ones.

## Local boundaries
- No hidden cookie/token storage. Local env/secret store only.
- Keep handler/service/repository boundaries.

## Local quality gates
- Health route and typed error envelope exist.
- Contract tests cover success/error/cancel/progress scenarios.

## Done definition
- Summarize changed files, validation, unresolved risks, and next steps for this module.
