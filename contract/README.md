# SPMIS API Contract

`openapi.yaml` is the single source of truth for the SPMIS API. `generated/schema.d.ts` is generated from it and must never be edited by hand. See [`../docs/contract-decisions.md`](../docs/contract-decisions.md) for architectural proposals and scope decisions.

## Contract Freeze (`v1.0.0` — Frozen 2026-10-30)

- **Status:** **FROZEN** (`v1.0.0`, tagged as `contract-v1.0.0`, effective **2026-10-30**).
- **Purpose:** Locks the 27-operation request/response boundary so **Milestone 3 (Backend — DB, RLS & Edge Functions)** and **Milestone 4 (Frontend — React SPA on Mock)** can proceed in parallel without blocking or surprising each other.
- **Change Control Policy:**
  1. Neither Frontend nor Backend may unilaterally add, rename, or remove endpoints, parameters, or schema fields.
  2. Any required contract change after the freeze must be proposed in a dedicated PR editing `contract/openapi.yaml`, regenerating `contract/generated/schema.d.ts` (`npm --prefix app run contract:gen`) and `app/public/docs/index.html` (`npm --prefix app run contract:docs`), and updating `docs/contract-decisions.md`.
  3. Breaking contract changes must use the `feat(contract)!:` or `contract!:` conventional commit prefix, bump `info.version` in `contract/openapi.yaml`, and receive explicit review approval from **both** Frontend and Backend leads plus the Project Manager before merging.

---

## Scope & Operations

This contract covers the 27 curated PostgREST, RPC, and Edge Function operations required by SPMIS:
- **Profiles & Auth:** `getOwnProfile`, `updateOwnProfile`, `listFaculty`
- **Student Directory & Search:** `searchStudents`, `getStudentById`, `createStudent`, `updateStudent`
- **Academic Taxonomy:** `listDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment`, `listPrograms`, `createProgram`, `updateProgram`, `deleteProgram`
- **Reviews, Tags & History:** `listStudentReviews`, `createReview`, `updateReview`, `setReviewStatus`, `listReviewVersions`, `listTags`, `suggestReviewTags`
- **Approval Queues:** `listApprovalQueueItems`, `createApprovalRequest`, `decideApplications`
- **AI Chat Assistant & Audit:** `askChatbot`, `listAuditLogs`

Detail reads have dedicated operation IDs: `getStudentById` calls `GET /rest/v1/rpc/get_student_by_id` with `p_student_id=<uuid>`, and `getOwnProfile` calls `GET /rest/v1/rpc/get_own_profile` without identity input. Each returns one object or JSON `null`; table list reads return arrays.

---

## Commands

Run from the repository root:

```powershell
npm --prefix app run contract:lint
npm --prefix app run contract:gen
npm --prefix app run contract:check
npm --prefix app run contract:docs
npm --prefix app run mock:server
```

- **Pinned Tooling:** `@redocly/cli` (`2.71.0`), `openapi-typescript` (`7.13.0`), and `@stoplight/prism-cli` (`5.16.0`) are pinned in `app/package.json`.
- **Type Generation (`contract:gen` & `contract:check`):** Uses `--default-non-nullable=false` so schema defaults do not turn optional request fields (such as rich-text `bold`/`italic` and chat `history`) into required TypeScript properties. `contract:check` lints the spec and regenerates types in a temporary directory to fail CI if `contract/generated/schema.d.ts` is stale.
- **Redoc Documentation (`contract:docs`):** Writes the static Redoc bundle to `app/public/docs/index.html`, served in-app at `/docs` (guarded by Supabase session authentication outside development, redirecting unauthenticated users to `/signin`) and uploaded as a CI build artifact.
- **Lint Ignore Rules (`.redocly.lint-ignore.yaml`):** Records only the three intentional internal entity schemas required by Issue #3 (`ReviewTag`, internal `ReviewEmbedding`, and internal `ReviewAttachment`). Public review responses expose `ReviewAttachmentMetadata`, which omits internal Storage object keys.

---

## Prism Response Simulation

Prism validates request headers and bodies before applying a response override:
- **PostgREST mutations (`POST` / `PATCH` on `/rest/v1/*`):** Include the required `Prefer: return=representation` header. Because Prism gives precedence to the `Prefer` header over `?__code=` query parameters, simulate documented `403` or `409` responses on PostgREST mutations by passing `Prefer: return=representation, code=403` or `Prefer: return=representation, code=409`.
- **Read endpoints (`GET`) & Edge Functions (`/functions/v1/*`):** Append `?__code=403`, `?__code=404`, `?__code=409`, `?__code=422`, or `?__code=429` to the mock URL (or pass `Prefer: code=422, example=wordLimit` / `Prefer: code=429` where no `Prefer` header schema restricts it).
- Keep the required `apikey` and `Authorization: Bearer <token>` headers in place; Prism overrides the response status code but still enforces OpenAPI request validation.
