# Glossary

Canonical terms used by this project.

## clean-room reference

- Avoid: copy source, clone code
- Notes: Uploaded app.zip and recovered sourcemap files are read-only references. Extract roles, contracts, route states, and fixtures only.

## sourcing job

- Avoid: crawler stuff
- Notes: A bounded run that receives market/query/options, emits progress/cancel events, and returns normalized product candidates.

## market collector

- Avoid: scraper blob
- Notes: Site-specific collector with input/output/error contracts and session boundary review.

## keyword intelligence

- Avoid: keyword page
- Notes: Keyword/detail/ad/recommendation analysis for product discovery, naming, and listing decisions.

## commerce workspace

- Avoid: dashboard page
- Notes: Web UI hub for sourcing, ranking, keyword, ad report, product name, purchase/order, settings, and evidence states.

## session boundary

- Avoid: hidden login
- Notes: Credentials, cookies, tokens, browser sessions, and account state stay local/user-controlled and are never embedded in repo docs.
