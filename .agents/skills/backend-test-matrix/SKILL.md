---
name: "backend-test-matrix"
description: "Choose backend unit, integration, contract, migration, auth, and regression tests for the change."
---

# Backend Test Matrix

## Backend test selection
Choose the smallest credible matrix:
- Unit test for pure service logic.
- Integration test for route/database/auth boundary.
- Contract test for response/error shapes.
- Migration test or rollback note for persistence changes.
- Regression test for a reproduced bug.

## Handoff
- Summarize changes, evidence, risks, and next steps.
- Cite relevant project docs or source files by path.
