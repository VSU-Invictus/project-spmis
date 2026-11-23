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

---

## Running the API Collection (Postman / Bruno)

`collection/spmis-contract.postman_collection.json` is a runnable suite for all 27 operations in `openapi.yaml`, so any developer or instructor can execute the contract against Prism without copying curl commands. Import it together with `collection/spmis-prism.postman_environment.json`, which sets `baseUrl = http://localhost:4010`, `apiKey = mock-anon-key` and `accessToken = mock-dev-token`.

### 1. Start the mock server

From the repository root:

```powershell
npm --prefix app run mock:server
```

Prism listens on `http://localhost:4010` and must stay running while the collection executes.

### 2. Import and run

- **Postman:** Import both JSON files, select the **SPMIS Prism (local mock)** environment, then run the collection with the Collection Runner.
- **Bruno:** Use *Import Collection* -> *Postman Collection* and choose `spmis-contract.postman_collection.json`. Create an environment with the three variables from `spmis-prism.postman_environment.json` and select it, then run the collection.
- **Newman (CLI):**

```powershell
npx newman run contract/collection/spmis-contract.postman_collection.json -e contract/collection/spmis-prism.postman_environment.json
```

### What the collection contains

- **Folders:** `Profiles`, `Students`, `Departments`, `Programs`, `Reviews`, `Applications`, `Chat`, `Audit`. These group operations by resource, so they do not map 1:1 to the OpenAPI tags (`Auth`, `Faculty`, `Admin`).
- **Success requests:** every operation has a `[2xx]` request. Discriminated bodies have one request per variant (`submitApplication`: `student_registration`, `program_proposal`, `department_proposal`; `decideApplications`: `approve`, `reject`).
- **Error requests:** every operation has a `[401]` request that omits `Authorization`. Key `400`, `403`, `404`, `409`, `422` and `429` error-envelope checks are included, each asserting the status and the `code`/`message`/`details`/`hint` envelope.
- **Response forcing:** follows [Prism Response Simulation](#prism-response-simulation). `POST`/`PATCH` requests on `/rest/v1/*` send `Prefer: return=representation, code=<status>`; all other forced errors use `?__code=<status>` (the review word-limit case also adds `__example=wordLimit`). Genuine validation failures (malformed UUID, empty review, empty chat message) are sent without any override.

### Authorization and data rules

- Authenticated requests use `{{apiKey}}` and `{{accessToken}}`; `[401]` requests omit `Authorization` and keep `apikey`.
- Never put real JWTs, Supabase keys or student data in the collection or environment files. All names and UUIDs in the collection are fictional.
- This suite verifies the contract (status codes and error envelopes) against Prism only; it does not test backend behavior.

## Local Supabase Instructor Demos

The live database and Edge Function demonstrations are kept in a companion collection so the Prism contract runner remains unchanged:

- `collection/spmis-instructor-demos.postman_collection.json` contains the Lesson 3.3 RLS enforcement and Lesson 4.4 two-layer validation bypass requests.
- `collection/spmis-supabase-local.postman_environment.json` sets `baseUrl = http://127.0.0.1:54321`, contains safe placeholders for the local anon key and role JWTs, and uses the synthetic fixture IDs from `supabase/seed.sql`.

### Setup and run

1. Start the local stack and load the repository fixtures:

   ```powershell
   npx supabase start
   npx supabase db reset
   ```

2. Obtain the local anon key with `npx supabase status`. The seeded Auth users have no shared test passwords: set local-only passwords for them through the local Auth admin interface/API, then sign each one in against `POST /auth/v1/token?grant_type=password` with the anon key to obtain its `access_token`. Use `owner@example.test` for `facultyToken`, `faculty@example.test` for `nonOwnerFacultyToken`, `pending@example.test` for `pendingToken`, and `admin@example.test` for `adminToken`. The matching database identities and role/status fixtures are in `supabase/seed.sql`.
3. Import the demo collection and local environment into Postman. Replace the four JWT placeholders and the anon-key placeholder in the selected environment; keep the key and tokens local and do not export or commit populated credentials.
4. Start the Edge Functions when running the function requests:

   ```powershell
   npx supabase functions serve --env-file supabase/.env
   ```

   `supabase/.env` must be a local, untracked copy of `supabase/.env.example`. The invalid review request is rejected before embedding; a Gemini key is not needed for this particular validation case.
5. Run the demo collection with **SPMIS Supabase (local)** selected. The RLS reads should return `200` with `[]`; the direct review PATCH should return `403`; and invalid review, department, and approval writes should return `400` or `422` as asserted.

Run the original 27-operation collection separately with **SPMIS Prism (local mock)** as described above. Prism validates and simulates the frozen API contract; it does not execute Supabase RLS, database constraints, or Edge Function logic, so the instructor demo collection is intentionally for the local Supabase environment only.
