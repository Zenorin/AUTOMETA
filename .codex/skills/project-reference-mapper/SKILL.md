---
name: "project-reference-mapper"
description: "Map uploaded Bulsaja/Electron/Next reference package into clean-room route, role, IPC/message, collector, and contract evidence before implementation."
---

# Project Reference Mapper

## Scope
- module_paths: `tools/reference-analysis`
- objective: Map uploaded Bulsaja/Electron/Next reference package into clean-room route, role, IPC/message, collector, and contract evidence before implementation.

## Workflow
1. Inspect uploaded package inventories and recovered source-map file names as read-only evidence.
2. Extract roles/contracts/fixtures/failure modes without copying source text or assets.
3. Classify implement-now vs defer-with-contract items before contracts/schema work.

## Quality gates
- Role report exists.
- Source-copy audit passes.

## Routing discipline
- Do not replace the root workflow skills; use this workstream as the project-specific owner for its module paths.
- Keep generated scaffold paths aligned with `module_paths` and module-local `AGENTS.md`.
- Do not move active policy-pack skills into optional/pruned output.

## Handoff
- Changed files, commands, evidence, risks, and next steps are summarized.
