# Extension Message Contracts

Define message names, payloads, replies, errors, and versioning here.

## WBS-24 Local API Lifecycle Readiness

The extension background message boundary participates in the local-only
sourcing job lifecycle through typed readiness messages. It does not call
marketplace pages, automate browsers, read page state, access browser storage,
or transport private browser material.

Supported message concepts:

- `autometa.sourcing.job.ready.check`: returns fixture/local API readiness and
  the local API route vocabulary for create, status, cancel, retry, and result.
- `autometa.sourcing.job.fixture.request`: returns deterministic fixture
  readiness for a requested job ID.
- `autometa.sourcing.job.status.query`: returns local API status readiness for
  `queued`, `running`, `completed`, `failed`, and `cancelled` status hints.
- `autometa.sourcing.job.cancel.request`: returns a local API cancel readiness
  transition for `queued -> cancelled` or `running -> cancelled`.
- `autometa.sourcing.job.retry.request`: returns a local API retry readiness
  transition for `failed -> queued` or `cancelled -> queued`.

Blocked behavior:

- Completed jobs are not cancellable or retryable and return typed `conflict`
  errors.
- Unsupported live/external source payloads return typed validation errors.
- Payloads containing private browser-material fields are rejected without
  echoing those keys in the response.
- Unknown messages and untrusted senders continue to return typed errors.

The content script remains an inert marker with no page, storage, or network
access. WBS-24 does not add live crawling, marketplace access, external API
calls, browser automation, login automation, credential/session/cookie/token
capture, or persistence.
