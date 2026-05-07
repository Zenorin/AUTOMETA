# Browser Session Handoff Boundary

WBS-18 is a design-only boundary for a possible future local browser session
handoff. It does not add product runtime behavior, browser automation,
marketplace access, live crawling, external API calls, credential handling, or
session extraction. The current product phase remains fixture-only.

## Current Phase

- Sourcing jobs use deterministic fixture data from the WBS-13 through WBS-17
  slices.
- API, web, extension, collectors, and core must keep live collection disabled.
- Browser/session handoff is documentation only in WBS-18.
- No implementation code, dependencies, permissions, scripts, or runtime
  configuration are added by this slice.

## Allowed Design Concepts

- A future human-approved, local-only handoff may describe that a signed-in user
  can keep their own browser session on their own device.
- Product code may refer to `LocalOnlyBoundaryMarker` style metadata that proves
  a boundary decision exists without serializing private material.
- Future evidence may record approval status, operator identity, local device
  scope, time window, marketplace scope, and validation result as metadata.
- Clean-room documentation may explain consent, audit logs, rollback, and
  failure handling without copying reference implementation details or
  marketplace data.

## Forbidden Behavior

- Do not implement browser automation.
- Do not add Playwright, Selenium, Puppeteer, or equivalent browser drivers.
- Do not read, export, persist, log, commit, or transmit cookies, sessions,
  tokens, credentials, local storage, browser profiles, account data, service
  account files, API keys, passwords, or private keys.
- Do not add marketplace access, live crawling, login automation, captcha
  solving, anti-bot bypassing, or external API calls.
- Do not add hidden background workers, browser extension permissions, local
  scripts, fixtures, or tests that collect real account state.
- Do not weaken validators, clean-room audit, unsupported-source errors, or the
  fixture-only behavior of WBS-15 through WBS-17.

## Deferred Implementation

Any future browser/session implementation is deferred until an approved WBS
explicitly opens that boundary. A future slice must provide:

- A written product approval naming the exact markets, user action, data
  categories, and retention policy.
- Security and privacy reviews for authentication, authorization, egress,
  storage, logs, and user consent.
- Anti-bot compliance review confirming the workflow respects marketplace
  access controls, robots policies where applicable, rate limits, and manual
  login boundaries.
- Contract updates proving secret/session material is represented only by
  metadata markers and is never serialized into DTOs, API responses, extension
  messages, logs, tests, or repository files.
- A test plan that proves unsupported live sources remain rejected until the
  approved implementation is active.
- Rollback steps that remove permissions, dependencies, scripts, feature flags,
  docs, and evidence for the implementation slice.

## Audit Evidence Required Later

Future phases that request this boundary must record:

- Approval identifier, reviewer, date, scope, and expiration.
- Exact files changed and dependency/permission diffs.
- Validation command results, including clean-room audit and secret scanning
  evidence.
- Proof that no secrets, credentials, cookies, tokens, sessions, browser
  profiles, or account data entered git history, logs, fixtures, or artifacts.
- Proof that marketplace access remains blocked unless a later approved WBS
  narrowly enables it.
- Remaining risks, incident rollback path, and owner for follow-up review.

## WBS-18 Decision

WBS-18 documents the local-only handoff concept and approval gates only. It is
not permission to build browser automation, read browser state, access
marketplaces, or run live collection.
