# AUTOMETA Clean-Room PRD Overlay

작성 시각: 2026-05-05 19:26:05 KST

## 목표

업로드된 Bulsaja Electron/Next reference package의 기능 카테고리를 직접 복제하지 않고, web-first commerce intelligence tool로 재구현한다. 목표는 소싱, 키워드, 상품명, 순위, 광고/정산 보고서, 구매/주문, 설정, 마켓 collector를 하나의 검증 가능한 Codex 개발 흐름으로 나누는 것이다.

## Non-goals

- 기존 Electron 앱을 그대로 유지·복사하지 않는다.
- source map 복원 소스나 generated chunks를 구현 코드로 붙여 넣지 않는다.
- reference의 로고, 이미지, 템플릿, 브랜드 문구를 재사용하지 않는다.
- 사용자 ID/PW/API key/cookie/session/service account 값을 repo에 포함하지 않는다.

## 선정 스택

- Web: React + Vite + TypeScript
- API: FastAPI + Python
- Extension: Chrome MV3 + TypeScript
- Packages: TypeScript contracts/core/collectors
- Workspace: pnpm

## 기능 카테고리

1. Commerce workspace: dashboard, product workspace, keyword workspace, settings shell
2. Sourcing pipeline: market input, progress, cancel, result normalization, evidence log
3. Keyword intelligence: keyword detail, folder, product name, recommendation, ad keyword flow
4. Coupang report flow: ad, cost, sales, settlement import/normalization
5. Product management: list, rank, buy order, sourcing sites, trash/archive states
6. Account/session boundary: user-provided local credentials only; no hidden persistence
7. Extension bridge: user-controlled collection/messaging where browser context is required

## Acceptance gates

- Generated scaffold and planning validators pass.
- Clean-room audit passes.
- WBS places reference-analysis before contracts/API/UI.
- Every public contract has typed schema and error envelope.
- Every collector has session/access-control boundary notes before implementation.
