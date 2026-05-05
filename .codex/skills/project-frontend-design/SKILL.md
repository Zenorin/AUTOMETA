---
name: "project-frontend-design"
description: "Own commerce workspace UI route shell, table/form/editor states, responsive layout, and Korean UX copy."
---

# Project Frontend Design

## Scope
- module_paths: `apps/web`
- objective: Own commerce workspace UI route shell, table/form/editor states, responsive layout, and Korean UX copy.

## Workflow
1. Review screen goal, route, states, and primary action.
2. Implement reusable React/Vite components without dropping UX states.
3. Run build/typecheck or document blockers.

## Quality gates
- Web build or blocker evidence exists.
- Loading/empty/error/success states are covered.

## Routing discipline
- Do not replace the root workflow skills; use this workstream as the project-specific owner for its module paths.
- Keep generated scaffold paths aligned with `module_paths` and module-local `AGENTS.md`.
- Do not move active policy-pack skills into optional/pruned output.

## Handoff
- Changed files, commands, evidence, risks, and next steps are summarized.
