# Bulsaja Reference Role Report — AUTOMETA Clean Room

작성 시각: 2026-05-05 19:26:05 KST

## 1. 판정

업로드된 `app.zip`은 원본 개발 저장소가 아니라 Electron/Next 기반 배포 산출물과 소스맵 복원 산출물이 섞인 reference package로 판정한다. 대상 구현은 이 파일을 직접 복제하지 않고, 역할·계약·상태·오류·fixture만 추출하는 clean-room 재구현으로 진행한다.

## 2. 확인한 근거 파일

| 파일 | SHA256 | 사용 목적 |
|---|---|---|
| app.zip | `1e3b5bd1959a9aeaf366bdabf575d5429bcccc086f70bbe658f39e656b3b8fe2` | reference package ZIP integrity 및 구조 확인 |
| package.json | `f2bc55c5f873e1c799c2a44ae24e77c81cb111c78d46e1b7314069b16e0b12ea` | 런타임/라이브러리/메인 진입점 분석 |
| folder-structure.filtered.md | `c615b94a1cff19219546e8edc82fc7ecb880b867229039111143f7036ec62152` | 핵심 route/static/template 구조 확인 |
| folder-structure.md | `7682f95438e601a45f4ba3292184b54bc8e198e1735b5df9b9798c1fe9ac03b5` | 전체 구조 확인 |
| library-references.md | `01935ba0e4490e743c894a9e8dd436a8361f38d69de9ddb39364fab54865c96a` | background 번들 외부 의존성 확인 |
| node_modules-top-level.md | `207c77a0e92d532b9667848093bc4285a6165b451a7653550490db07f0c4b219` | 라이브러리 계층 분류 |

## 3. reference 구조 요약

- 패키지명/버전: `bulsaja` / `0.12.53`
- Electron main 진입점: `app/background.js`
- `app/background.js`, `app/preload.js`, `app/_next/static/chunks/*`가 존재하므로 런타임은 Electron shell + Next static output 성격이 강하다.
- `recovered-background-sources`는 source map 기준 `730`개, `recovered-preload-sources`는 `5`개가 복원된 것으로 표시된다.
- products route에는 keyword, detailkeyword, adkeyword, coupangreview, productname, recommend, purchase 계열 화면이 있다.
- manage route에는 bulsaSourcing, productRank, buyorder, sourcingSites, analytics, alibomber, trash 계열 화면이 있다.
- admanage route에는 coupang 광고/매출/비용/정산 보고서 계열 화면이 있다.
- setting route에는 AI API key, collection, filter words, markets, order account 계열 화면이 있다.

## 4. 개발 카테고리별 clean-room 매핑

| 개발 카테고리 | reference에서 확인한 역할 | 대상 모듈 | Codex workstream |
|---|---|---|---|
| Frontend shell | dashboard, products, manage, admanage, settings route | `apps/web` | `project-frontend-design` |
| Backend API | job 실행, 계정/설정 저장, 광고/정산/리포트 데이터 처리 | `apps/api` | `project-backend-api` |
| Shared contracts | sourcing progress/cancel, market collector output, report import/export DTO | `packages/contracts` | `project-contracts` |
| Core pipeline | keyword/product/rank/recommendation normalization, export/import transforms | `packages/core` | `project-core-pipeline` |
| Collectors | Coupang/Naver/Smartstore/Taobao/AliExpress-class collectors and handlers | `packages/collectors` | `project-market-collectors` |
| Extension bridge | Electron preload/IPC 역할을 user-controlled Chrome MV3 message boundary로 재표현 | `apps/extension` | `project-extension-bridge` |
| Reference analysis | source-map/file inventory, role report, fixture extraction, copy audit | `tools/reference-analysis` | `project-reference-mapper` |

## 5. 구현 우선순위

1. `reference-analysis`: route/IPC/message/collector role report와 fixture shape를 먼저 문서화한다.
2. `contracts/schema`: sourcing job, progress, cancel, market product, keyword metric, ad report, order/account settings DTO를 정의한다.
3. `backend API`: health, job create/read/cancel, product/keyword/report/settings API shell을 만든다.
4. `frontend shell`: 주요 route와 상태 UI를 먼저 만든다.
5. `extension/collectors`: 브라우저 권한과 session boundary 검토 후 collector를 붙인다.
6. `core pipeline`: normalization/ranking/recommendation/import-export 로직을 deterministic test와 함께 구현한다.
7. `integration/validation`: cleanroom audit, workspace check, contract test, build/test evidence를 묶는다.

## 6. 금지/보류 항목

- `background.js`, `preload.js`, `.map`, `_next/static/chunks/*`, recovered source text, 이미지/logo/template asset은 대상 repo product code로 복사하지 않는다.
- reference에 보이는 token, cookie, service account, ID/PW, browser session, admin state 저장 방식은 복제하지 않는다.
- mock-success fallback, 숨겨진 로그인, 인증 우회, 인증서/보안 경고 무력화 패턴은 구현하지 않는다.
- branded copy와 상표성 asset은 재사용하지 않는다.

## 7. Codex 작업 지시 기준

- Codex는 `AGENTS.md`를 먼저 읽고, WBS ID 단위로 작업한다.
- WBS-03 `reference-analysis` 완료 전 contracts/API/UI 구현으로 넘어가지 않는다.
- 실패 시 `repair-command`로 실패 유형을 분류하고 관련 workstream으로 되돌린다.

## 8. WBS-03 승인된 산출물 경계

- `tools/reference-analysis/src/index.ts`는 target module별 역할, 허용 증거, 금지 입력을 코드로 고정한다.
- 허용 증거는 route inventory, message/API/DTO role, failure mode, fixture shape, hash, file inventory, policy decision으로 제한한다.
- 금지 입력은 reference source text, recovered source, generated chunk, branded asset, screenshot/template, credential/session/token/cookie이다.
- WBS-04 이후 계약/스키마 작업은 이 보고서의 역할과 `source-inventory.json`의 추상 evidence만 사용한다.
- reference package의 구현 알고리즘, 주석, copywriting, UI asset, hidden credential/session behavior는 product code로 이동하지 않는다.
