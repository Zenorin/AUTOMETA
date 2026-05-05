# Module Routing Guide

Use module-local AGENTS.md files to route Codex work by path. This guide lists generated route skills, optional/pruned skills, and project-specific workstreams.

## web — `apps/web`
- type: `frontend-product-ui`
- workstreams: $project-frontend-design
- generated skills: $project-frontend-design, $frontend-product-ui, $consistency-guard, $evidence-pack
- optional/pruned: $design-system-consistency, $ui-state-coverage, $responsive-layout-review, $browser-smoke, $accessibility-check, $form-table-filter-ux, $visual-regression-plan

## api — `apps/api`
- type: `backend-api`
- workstreams: $project-backend-api
- generated skills: $project-backend-api, $api-contract-change, $api-error-handling-review, $backend-test-matrix, $authz-security-review, $consistency-guard, $evidence-pack
- optional/pruned: $service-repository-boundary-check, $db-migration, $observability-update, $backward-compat-check, $incident-hotfix

## extension — `apps/extension`
- type: `browser-extension`
- workstreams: $project-extension-bridge
- generated skills: $project-extension-bridge, $content-script-boundary, $privacy-boundary-review, $consistency-guard, $evidence-pack
- optional/pruned: $extension-permission-review, $message-contract-review, $browser-smoke

## contracts — `packages/contracts`
- type: `shared-contracts`
- workstreams: $project-contracts
- generated skills: $project-contracts, $api-contract-change, $consistency-guard, $evidence-pack
- optional/pruned: $backward-compat-check, $documentation-and-adrs

## core — `packages/core`
- type: `data-pipeline`
- workstreams: $project-core-pipeline
- generated skills: $project-core-pipeline, $consistency-guard, $evidence-pack
- optional/pruned: $schema-contract-check, $data-quality-gate, $idempotency-check, $observability-update, $backfill-rollout

## collectors — `packages/collectors`
- type: `crawler-session`
- workstreams: $project-market-collectors
- generated skills: $project-market-collectors, $crawler-contract-review, $session-boundary-security, $anti-bot-compliance-check, $consistency-guard, $evidence-pack, $privacy-boundary-review
- optional/pruned: $idempotency-check

## reference-analysis — `tools/reference-analysis`
- type: `clean-room-rebuild`
- workstreams: $project-reference-mapper
- generated skills: $project-reference-mapper, $clean-room-reference-analysis, $reference-role-report, $contract-extraction, $source-copy-audit, $consistency-guard, $evidence-pack, $no-feature-deletion-guard
- optional/pruned: none
