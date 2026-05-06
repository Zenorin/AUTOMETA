# API Contracts

WBS-04 defines the shared TypeScript DTO/schema source of truth in
`packages/contracts/src/index.ts`. These contracts are clean-room shapes for
web, API, extension, collectors, and core pipeline integration. They do not
include reference source, assets, secrets, session cookie material, or
Korean-facing UI labels.

## Schema Version

- Current version: `2026-05-06.wbs-04`
- Export: `contractSchemaVersion`
- Compatibility rule: add optional fields for compatible growth. Renaming,
  removing, changing discriminators, or changing enum values is breaking and
  requires a migration note before downstream modules adopt it.

## Shared Boundaries

| Contract | Purpose | Stability notes |
| --- | --- | --- |
| `SourcingRequest` | User-initiated sourcing input from web/API/extension into collectors and core. | Uses `SourcingSeed`, `SourcingScope`, and `SourcingPolicy`; captcha solving and stored credentials are explicitly disallowed. |
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

### Normalized Product

`NormalizedProduct` standardizes market product data:

- source identity: market, market product id, canonical URL, collection time
- commercial data: `ProductOffer`, `Money`, availability, seller, fulfillment
- descriptive data: title, brand, category path, images, attributes

The DTO intentionally does not contain UI labels. Presentation modules can map
field names to Korean-facing labels at display time.

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
