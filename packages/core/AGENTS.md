# AGENTS.md — core

Scope: `packages/core`
Module type: `data-pipeline`
Bundles: data-pipeline
Policy packs: none

## Generated preferred skills
- `$project-core-pipeline`
- `$consistency-guard`
- `$evidence-pack`

## Optional skills not generated under current budget
- `$schema-contract-check`
- `$data-quality-gate`
- `$idempotency-check`
- `$observability-update`
- `$backfill-rollout`

## Project workstreams
- `$project-core-pipeline`

## Local commands
- Use root commands unless this module defines more specific ones.

## Local boundaries
- Pure transformations separated from IO/session/browser work.

## Local quality gates
- Deterministic fixtures for sourcing, keyword, ranking, ad report, and product-name pipelines.

## Done definition
- Summarize changed files, validation, unresolved risks, and next steps for this module.
