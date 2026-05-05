---
name: "project-development-bootstrap"
description: "Create and validate AUTOMETA repo bootstrap, workspace, env template, planning docs, and shared build scripts without overriding module routing."
---

# Project Development Bootstrap

## Scope
- module_paths: `.`
- objective: Create and validate AUTOMETA repo bootstrap, workspace, env template, planning docs, and shared build scripts without overriding module routing.

## Workflow
1. Create root package/workspace/env/check files.
2. Do not decide feature implementation details for app/package modules.
3. Validate scaffold paths against module/workstream routing.

## Quality gates
- Root package/workspace files exist.
- No secret values are committed.
- validate-scaffold passes.

## Routing discipline
- Do not replace the root workflow skills; use this workstream as the project-specific owner for its module paths.
- Keep generated scaffold paths aligned with `module_paths` and module-local `AGENTS.md`.
- Do not move active policy-pack skills into optional/pruned output.

## Handoff
- Changed files, commands, evidence, risks, and next steps are summarized.
