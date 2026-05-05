---
name: "api-error-handling-review"
description: "Review status codes, error envelopes, validation errors, retries, and client-facing failure semantics."
---

# Api Error Handling Review

## API error checklist
- Status code matches failure class.
- Error envelope shape is stable and documented.
- Validation errors identify fields without leaking secrets.
- Frontend/client behavior for each failure mode is clear.
- Retries do not create duplicate side effects.

## Handoff
- Summarize changes, evidence, risks, and next steps.
- Cite relevant project docs or source files by path.
