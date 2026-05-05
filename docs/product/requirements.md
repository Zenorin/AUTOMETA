# Requirements

## Functional requirements
- `WBS-00`: Confirm scope, secret boundary, and clean-room constraints under `.`.
- `WBS-01`: Review and approve stack decision under `.`.
- `WBS-02`: Generate and validate repository scaffold under `.`.
- `WBS-03`: Write clean-room reference role report before implementation under `tools/reference-analysis`.
- `WBS-04`: Define shared DTO/schema contracts under `packages/contracts`.
- `WBS-05`: Implement API shell, health route, and error envelope under `apps/api`.
- `WBS-06`: Implement web route shell and complete UI states under `apps/web`.
- `WBS-07`: Implement extension manifest and message boundary under `apps/extension`.
- `WBS-08`: Define collector contract and raw/normalized split under `packages/collectors`.
- `WBS-09`: Implement deterministic core pipeline skeleton under `packages/core`.
- `WBS-10`: Connect contracts, API, web, extension, collectors, and core with smoke evidence under `.`.
- `WBS-11`: Prepare evidence pack and next-session handoff under `.`.

## Security requirements
- Secrets remain outside profiles, AGENTS.md, SKILL.md, commands, PRD, WBS, and generated source.
- `.env.example` must contain placeholders only.
