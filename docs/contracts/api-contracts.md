# API Contracts

WBS-04 defines the shared TypeScript DTO/schema source of truth in
`packages/contracts/src/index.ts`. These contracts are clean-room shapes for
web, API, extension, collectors, and core pipeline integration. They do not
include reference source, assets, secrets, session cookie material, or
Korean-facing UI labels.

## Schema Version

- Current version: `2026-05-07.wbs-12`
- Export: `contractSchemaVersion`
- Compatibility rule: add optional fields for compatible growth. Renaming,
  removing, changing discriminators, or changing enum values is breaking and
  requires a migration note before downstream modules adopt it.

## Shared Boundaries

| Contract | Purpose | Stability notes |
| --- | --- | --- |
| `SourcingRequest` | User-initiated sourcing input from web/API/extension into collectors and core. | Uses `SourcingSeed`, `SourcingScope`, and `SourcingPolicy`; captcha solving and stored credentials are explicitly disallowed. |
| `SourcingJobRequest` | Fixture-backed job creation input for the next product phase. | Uses `FixtureSafeSourcingPolicy`; external network, marketplace automation, stored credentials, captcha solving, and session material are explicitly disallowed. |
| `SourcingJobCreatedResponse` | API response data for accepted fixture-backed job creation. | Always starts at `queued`; wrapped by `ApiResponseEnvelope<SourcingJobCreatedResponse>`. |
| `SourcingJobStatusResponse` | API response data for job status/progress/cancel/retry/result summary. | Uses explicit `SourcingJobStatus` values and typed `SourcingJobError[]`; wrapped by `ApiResponseEnvelope<SourcingJobStatusResponse>`. |
| `FixtureCollectorInput` | Deterministic collector input for fixture-only test and smoke paths. | Requires `FixtureProvenance` and `sourceType: fixture`; it is not a live crawl request. |
| `FixtureCollectorResult` | Deterministic collector output wrapper for fixture-only integration. | Wraps `MarketCollectorResult` so downstream modules can validate fixture output without calling marketplaces. |
| `NormalizedMarketItem` | Job-facing normalized market item reference. | Alias of `NormalizedProduct` to avoid duplicate shapes while preserving job vocabulary. |
| `NormalizedProduct` | Market-neutral product DTO for downstream API, web, and pipeline use. | Product facts are explicit fields or `ProductAttribute[]`; no open object payload is required. |
| `MarketCollectorResult` | Collector output for success, partial success, or failure. | Discriminated by `status`; partial and failed results carry typed `PartialFailure[]`. |
| `PipelineEvent` | Progress, log, and failure events emitted by core/collectors. | Discriminated by `kind`; stages are limited by `PipelineStage`. |
| `PartialFailure` | Recoverable or fatal unit failure within a larger run. | Failure reasons come from `CollectorFailureReason`; retry guidance is embedded as `RetryState`. |
| `ErrorEnvelope` | Typed API and extension error payload. | Uses `ApiErrorCode` and `ErrorDetail[]`; every error carries `correlationId` and `retryable`. |
| `JobState` | Shared lifecycle, cancel, and retry state for async work. | `CancelState` and `RetryState` are explicit unions to avoid ambiguous booleans. |
| `ExtensionMessageEnvelope` | Browser extension boundary message wrapper. | Message commands/events are explicit; session messages use markers only. |
| `ApiResponseEnvelope<TData>` | API response wrapper for success and failure. | Discriminated by `ok`; success carries `data`, failure carries `ErrorEnvelope`. |
| `LocalOnlyBoundaryMarker` | Marker for secrets and authenticated browser sessions. | Secret/session material must never be serialized; markers are metadata-only references. |

## Secret And Session Rules

- `LocalOnlySecretRef.material` must always be `never-serialized`.
- `LocalOnlySessionBoundaryMarker.serialization` must always be `metadata-only`.
- `LocalOnlySessionBoundaryMarker.transfer` must always be `same-device-only`.
- API, web, extension, collector, and core code may pass boundary markers, but
  must not place real credentials, cookies, tokens, or captured session values
  inside DTO payloads, logs, API responses, or extension messages.

## DTO Summary

### Sourcing Request

`SourcingRequest` captures a user-initiated request with:

- `SourcingSeed`: `keyword`, `product-url`, or `market-product-id`
- `SourcingScope`: markets, locale, currency, and maximum product count
- `SourcingPolicy`: consent, collection mode, rate limit profile, and hard
  false flags for stored credentials and captcha solving
- optional `LocalOnlySessionBoundaryMarker` for authenticated local sessions
- optional `RetryState`

### Sourcing Job Contracts

WBS-12 introduces fixture-backed sourcing job DTOs for the next product phase.
They are contracts only; they do not implement runtime crawling, login,
marketplace automation, browser automation, external API calls, or credential
handling.

`SourcingJobStatus` is limited to:

- `queued`
- `running`
- `completed`
- `failed`
- `cancelled`

`SourcingJobRequest` captures fixture-safe job creation input:

- `SourcingJobId` is the job identifier alias used by job-specific DTOs.
- `SourcingJobSourceType` identifies the request source as `fixture`,
  `manual-keyword`, `manual-product-url`, or `manual-market-product-id`.
- `FixtureSafeSourcingPolicy` keeps `collectionMode` at `public-page` and sets
  `fixtureOnly`, `allowExternalNetwork`, and `allowMarketplaceAutomation` to
  deterministic false/true values that prevent live collection.
- `FixtureProvenance` records synthetic or sanitized fixture origin and hard
  false flags for secrets and session material.

`SourcingJobCreatedResponse` is returned inside
`ApiResponseEnvelope<SourcingJobCreatedResponse>` for create routes. It
contains the `jobId`, `requestId`, `correlationId`, `queued` status, and
creation timestamp.

`SourcingJobStatusResponse` is returned inside
`ApiResponseEnvelope<SourcingJobStatusResponse>` for status routes. It contains
the current `SourcingJobStatus`, typed `SourcingJobProgress`, cancel/retry
state, optional `SourcingJobResultSummary`, and typed `SourcingJobError[]`.

`SourcingJobError` uses `SourcingJobErrorReason` values for unsupported source,
missing fixture, validation failure, cancellation, collector failure, pipeline
failure, and unknown failure cases. These errors are data contracts; they are
not mock-success fallbacks.

### Fixture-Only Sourcing Job API

WBS-15 exposes the sourcing job contract through deterministic fixture-only API
routes:

- `POST /api/v1/sourcing/jobs` accepts only `sourceType: fixture` and returns a
  `SourcingJobCreatedResponse` inside `ApiResponseEnvelope`.
- `GET /api/v1/sourcing/jobs/{job_id}` returns `SourcingJobStatusResponse`
  with completed fixture progress, result summary, retry state, and typed
  sourcing job errors.
- `GET /api/v1/sourcing/jobs/{job_id}/result` returns the deterministic
  WBS-14-style core pipeline result for the WBS-13 fixture collector results.

This API boundary is deterministic and fixture-only. It reads the synthetic
collector fixture set, preserves the raw/normalized split by not exposing raw
snapshots in API result payloads, and rejects unsupported live/manual source
types with typed `validation-failed` envelopes. It does not perform live
marketplace crawling, browser automation, login/session/cookie/token handling,
credential handling, external API calls, or secret storage.

### Fixture-Only Web Job UI

WBS-16 consumes the WBS-15 API envelope vocabulary in the web shell without
adding network calls. The UI renders deterministic fixture job states for
ready, creating, queued, completed, failed, and invalid-source rejected paths;
it also shows status/progress, result summary counts, collector statuses, and a
clean-room boundary notice.

The web UI keeps unsupported live/external source behavior disabled and visibly
rejected. It must not render secret/session/cookie/token field names, expose
credential values, call marketplace pages, automate browsers, or imply that
real collection is enabled.

### Fixture-Only Extension Readiness Messages

WBS-17 adds extension message readiness concepts for fixture-only sourcing job
coordination:

- `SOURCING_JOB_READY_CHECK` returns an allowed/ready fixture boundary.
- `SOURCING_JOB_FIXTURE_REQUEST` returns deterministic fixture job readiness
  aligned with `POST /api/v1/sourcing/jobs`.
- `SOURCING_JOB_STATUS_QUERY` returns deterministic completed job status
  aligned with `GET /api/v1/sourcing/jobs/{job_id}`.

Unknown message types still return typed unsupported errors, and unsupported
live/external source payloads are rejected with `validation-failed` envelopes.
The extension does not call real API endpoints, access marketplace pages,
automate browsers, read cookies/sessions/tokens/credentials/local storage, or
enable live collection.

### Fixture Collector References

`FixtureCollectorInput` and `FixtureCollectorResult` define the fixture-only
collector boundary used by later collector, core, and integration smoke slices.
They require fixture provenance, request/job correlation, and `sourceType:
fixture`. They must never carry cookies, tokens, credentials, browser profile
data, captured session payloads, or live marketplace responses.

### Normalized Product

`NormalizedProduct` standardizes market product data:

- source identity: market, market product id, canonical URL, collection time
- commercial data: `ProductOffer`, `Money`, availability, seller, fulfillment
- descriptive data: title, brand, category path, images, attributes

The DTO intentionally does not contain UI labels. Presentation modules can map
field names to Korean-facing labels at display time.

`NormalizedMarketItem` is exported as the job-facing alias for
`NormalizedProduct` so the sourcing job vocabulary can reference normalized
market items without duplicating or drifting from the canonical product shape.

### Collector Result And Partial Failure

`MarketCollectorResult` is a discriminated union:

- `success`: products and stats
- `partial`: products, typed failures, and stats
- `failed`: typed failures and stats

`PartialFailure` uses `CollectorFailureReason`, `FailureSeverity`,
`FailureLocation`, and `RetryState` so downstream modules can render, retry, or
stop without inspecting loose error objects.

### Pipeline Events

`PipelineEvent` is a union of:

- `PipelineProgressEvent`
- `PipelineLogEvent`
- `PipelineFailureEvent`

All events include schema version, event id, job id, correlation id, and
timestamp.

### Cancel And Retry State

`CancelState` represents not requested, requested, accepted, or cancelled.
`RetryState` represents not retryable, retryable, scheduled, or exhausted. These
types are used by sourcing requests, partial failures, job state, and extension
retry commands.

### API And Extension Envelopes

`ApiResponseEnvelope<TData>` is the shared API wrapper. It uses `ok: true` for
success and `ok: false` for typed `ErrorEnvelope` failures.

`ExtensionMessageEnvelope` wraps extension commands and events with message id,
correlation id, source, target, timestamp, and a typed message payload. Commands
cover sourcing start, cancel, retry, status lookup, and local session marker
registration. Events cover job state, pipeline events, collector results, and
errors.

## Breaking Change Checklist

- Update `contractSchemaVersion`.
- Document the old and new shape here.
- Note the migration path for web, API, extension, core, and collectors.
- Run `pnpm --filter @project/contracts typecheck` before dependent workstreams
  consume the change.
