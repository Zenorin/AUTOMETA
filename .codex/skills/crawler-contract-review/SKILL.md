---
name: "crawler-contract-review"
description: "Review crawler selectors, headers, fallback paths, return schema, errors, and rate/ban signals."
---

# Crawler Contract Review

## Crawler contract review
- Define allowed entry pages, inputs, outputs, error codes, retry rules, and fallback paths.
- Do not rely on brittle selectors without fallback or evidence.
- Respect login/session/manual boundaries and access-control signals.
- Keep raw capture and normalized result schemas separate.

## Handoff
- Summarize changes, evidence, risks, and next steps.
- Cite relevant project docs or source files by path.
