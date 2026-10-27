# SPMIS API contract

`openapi.yaml` is the API source. `generated/schema.d.ts` is generated and must
never be edited by hand. Version 0.1.0 is a review draft; see
[`../docs/contract-decisions.md`](../docs/contract-decisions.md) for proposals and
unresolved requirements. The backend is not implemented by these files.

Run from the repository root:

```powershell
npm --prefix app run contract:gen
npm --prefix app run contract:check
```

For lint only:

```powershell
npm --prefix app run contract:lint
```

These scripts pin Redocly CLI 2.71.0 and openapi-typescript 7.13.0 using npm exec.
Generation and freshness checking both use `--default-non-nullable=false` so
schema defaults do not turn optional request fields into required TypeScript
properties. Rich-text `bold`/`italic` and chat `history` can be omitted, as
documented in the YAML. Required fields remain required.
Linting uses `redocly.yaml` for the shared rules and Redoc theme.
`.redocly.lint-ignore.yaml` records only the three intentional unused entity schemas
required by Issue #3 (`ReviewTag`, internal `ReviewEmbedding` and internal
`ReviewAttachment`). Review responses use `ReviewAttachmentMetadata`, which
excludes internal Storage object keys.
The first run needs network access and the normal npm cache. No global install
is needed. contract:check re-generates types in a unique temporary directory and
compares them without modifying the committed output. It checks lint/freshness,
not live backend drift or endpoint behavior.

Radz's Redoc task consumes this YAML. Testers can use it with Prism, but a mock
does not execute the proposed SQL functions, enforce real RLS, or prove a
database transaction. Fake identities in examples are for mock testing only.

After editing the source, regenerate types and run the check before committing.
Include the YAML, matching generated types, decision log and changelog together.
Backend implementers must implement the documented view/RPC projections and
record approved schema additions in migrations. The contract needs frontend and
backend review before merge into dev.
