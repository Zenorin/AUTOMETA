# AGENTS.md — contracts

Scope: `packages/contracts`
Module type: `shared-contracts`
Bundles: shared-contracts
Policy packs: none

## Generated preferred skills
- `$project-contracts`
- `$api-contract-change`
- `$consistency-guard`
- `$evidence-pack`

## Optional skills not generated under current budget
- `$backward-compat-check`
- `$documentation-and-adrs`

## Project workstreams
- `$project-contracts`

## Local commands
- Use root commands unless this module defines more specific ones.

## Local boundaries
- Contracts are source of truth for API, extension, collectors, and core.

## Local quality gates
- Breaking fields require migration note.
- DTO schemas exported and typechecked.

## Done definition
- Summarize changed files, validation, unresolved risks, and next steps for this module.
