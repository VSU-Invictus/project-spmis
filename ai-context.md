# SPMIS Project Context & AI Rules

## 1. Source of Truth (Hierarchical)
When resolving conflicts, AI agents must evaluate directives in this strict order:
1. **`README.md`** — the master 17-section authoritative specification (domain rules, data model, sitemap, assumptions log). Treat it as the ultimate source of truth for *what the system is*.
2. **`contract/openapi.yaml` (`v1.0.0` — Frozen)** — the single source of truth for the 27 callable PostgREST, RPC, and Edge Function operations, request/response schemas, and error envelopes (`contract/generated/schema.d.ts` is generated from it and must never be hand-edited).
3. **Minutes of the Meeting (MoM)** — binding project decisions, stored as `docs/minutes/mom-0N/mom-0N.md` (+ signed `.pdf`), currently MoM #1–#7 (26 Aug – 03 Oct 2026). Per README §13, the Project Manager holds the tiebreak on contract disputes; MoM decisions govern project process, priorities, and UI/UX direction, and supersede the spec where the two conflict.
4. **`docs/DESIGN_SYSTEM.md`** — the official token, spacing, and typographic standard.
5. **`mockup/pages/design-system.html`** — the living, interactive style guide. Consult it for `.ui-*` primitives before inventing new components. Its React port is `app/src/pages/StyleguidePage.tsx` (`/styleguide`).
6. **This `ai-context.md` file.**

---

## 2. Repo Map & Structural Constraints
Top level: `README.md`, `ai-context.md`, `.gitignore`, `.github/`, `app/`, `contract/`, `docs/`, `mockup/`, `supabase/`.

* **`contract/` — Frozen API Contract (`v1.0.0`, tagged `contract-v1.0.0`).**
  * `openapi.yaml` defines all 27 curated operations (`getOwnProfile`, `updateOwnProfile`, `updateFacultyByAdmin`, `listFaculty`, `searchStudents`, `getStudentById`, `createStudentDirect`, `updateStudent`, `listDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment`, `listPrograms`, `createProgram`, `updateProgram`, `deleteProgram`, `listStudentReviews`, `createReview`, `updateReview`, `setReviewStatus`, `listReviewVersions`, `listTags`, `suggestReviewTags`, `listApprovalQueueItems`, `submitApplication`, `decideApplications`, `askChatbot`, `listAuditLogs`).
  * `generated/schema.d.ts` contains the `openapi-typescript` (`7.13.0`) types verified in CI by `contract/check-generated.mjs`.
  * `collection/` contains `spmis-contract.postman_collection.json` and `spmis-prism.postman_environment.json` (81 requests, 176 assertions across all 27 operations).
* **`app/` — React SPA Workspace (`spmis-app`).**
  * `app/.env.example` defines browser-public `VITE_SUPABASE_*` variables. **Never** put `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or OAuth client secrets in `app/.env*`.
  * `app/public/docs/index.html` is the pre-built Redoc bundle served at `/docs` (guarded by Supabase session auth in `app/src/pages/ContractDocsPage.tsx`).
* **`supabase/` — Backend Database, RLS & Edge Functions (M3).**
  * `supabase/.env.example` defines server-only `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` for Edge Functions and local Supabase Auth.
  * Target subdirectories for M3: `supabase/migrations/`, `supabase/functions/{reviews,chat,approvals,_shared}/`, `supabase/tests/*.sql` (`pgTAP`), and `supabase/seed.sql`.
* **`mockup/` — Static M1 Mockup (Locked Structure).**
  * Per MoM #4, the mockup folder structure is locked and a strict **one-file-per-route** rule applies. Do NOT add React, bundlers, or new top-level folders inside `mockup/`.
* **`docs/` — Documentation, Contract Decisions, QA Logs & Changelog.**
  * `docs/contract-decisions.md` records architectural decisions and trade-offs for the OpenAPI contract.
  * `docs/api/` holds QA endpoint test logs (`faculty-admin-api-tests.md` — 138/138 passing against Prism) and E2E test specifications.
  * `docs/change log/CHANGELOG.md` (Keep a Changelog format; update under `[Unreleased]` alongside relevant PRs per MoM #6).
* **`.github/workflows/ci.yml` — Automated CI Merge Gate.**
  * Runs two required status check jobs on PRs and pushes to `main`, `staging`, `dev`, and `feat/**`:
    1. `Contract Lint, Check & Docs` (`contract:lint`, `contract:check`, `contract:docs` + freshness diff + Redoc artifact upload).
    2. `Typecheck, Unit Tests & Build` (`typecheck`, `test` via `vitest run`, and `build`).

---

## 3. Project Management & Workflow (Rule §13 & MoMs)
* **No Feature Suggestion Issues:** Per MoM #5, feature suggestions are handled verbally in weekly meetings, not via GitHub Issues. GitHub Issues are reserved for actual bugs and approved tasks.
* **Naming Conventions:** "Chat" must be labeled **"AI Chat Assistant"** (implemented in both sidebars and `FacultySidebar.tsx`). "Register Student" is a **pop-up modal**, not a dedicated page.
* **Branching & PRs:**
  * **Feature development:** Branch from the active milestone branch (`feat/m3-backend` or `feat/m4-frontend`) and open PRs targeting that milestone branch (never directly to `dev` or `main`).
  * **Milestone completion:** Open a PR from `feat/<milestone-name>` → `dev` titled `[Milestone] <milestone-name>`.
  * **Promotions:** `dev` → `staging` → `main` titled `[Promotion] <source-branch> -> <target-branch>`.
  * **Commits:** Conventional Commits (`type(scope): description`).
  * **Lockfile Discipline:** Shared dependencies (`zod`, `react-hook-form`, `@hookform/resolvers`, `msw`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`) are pre-installed in `app/package.json` and `app/package-lock.json`. Feature branches must **not** modify `app/package-lock.json` unless explicitly coordinated with the PM.

---

## 4. Current Phase: Milestone 2 Complete — Active M3 (Backend) & M4 (Frontend)

### 4.1 What Exists in `app/` Right Now
* **Installed & Configured Stack:** React 19, React Router 7 (`createBrowserRouter`), TanStack Query 5, `openapi-fetch` (`0.14.0`), `@supabase/supabase-js` (`^2.57.0`), `react-hook-form` (`^7.90.0`), `@hookform/resolvers` (`^5.9.1`), `zod` (`^4.6.7`), TypeScript 5.6 (`strict`, `noEmit`), Vite 6, Vitest 3 (`vitest run`), MSW (`2.15.0`), React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`), `@redocly/cli` (`2.71.0`), `openapi-typescript` (`7.13.0`), and `@stoplight/prism-cli` (`5.16.0`).
* **Typed API Client (`app/src/lib/api/`):**
  * `client.ts`: `apiClient` bound to `contract/generated/schema.d.ts`, resolving `globalThis.fetch` lazily at request time so MSW intercepts requests in Vitest; injects `Authorization: Bearer <token>` and `apikey` headers (`configureApiAuth`, `getApiAuth`, `resetApiAuth`).
  * `request.ts` & `errors.ts`: `request()` unwrapper and `ApiRequestError` normalizer (`code`, `message`, `details`, `hint`, `status`).
* **Domain Validation Rules (`app/src/lib/rules/`):**
  * `review.ts`: `REVIEW_WORD_LIMIT` (500), `extractPlainText()`, `countReviewWords()`, `validateReviewWordLimit()`.
  * `tags.ts`: `normalizeTag()`, `normalizeTags()` (lowercase, trim, collapse whitespace, deduplicate, max 30 tags / 50 chars).
  * `entityName.ts`: `validateEntityName()` (1–200 chars, case-insensitive duplicate detection, unchanged-edit rejection).
* **TanStack Query Hooks (`app/src/hooks/`):**
  * `queryKeys.ts`: mechanical `operationId`-derived query keys.
  * Implemented hooks: `useSearchStudents`, `useStudentById`, `useStudentReviews`, `useCreateReview`, `useAskChatbot`, `useApprovalQueueItems`, `useDecideApplications`, `useDepartments`, `usePrograms`, `useAuditLogs`.
* **MSW Mock Infrastructure (`app/src/mocks/`):**
  * `handlers.ts`, `server.ts`, and `setupTests.ts` (registered in `app/vite.config.ts` with `@testing-library/jest-dom/vitest`), plus test suites in `app/src/mocks/handlers.test.ts` and `app/tests/msw-integration.test.ts`.
* **Registered Routes (`app/src/main.tsx`):**
  * Public/Auth/Docs: `/`, `/signin`, `/login`, `/docs`, `/styleguide`, `/components/*`.
  * Faculty Portal: `/faculty/dashboard`, `/faculty/students`, `/faculty/chat`, `/faculty/departments`, `/faculty/programs`, `/faculty/applications`.
  * Admin Portal: `/admin/dashboard`, `/admin/applications`, `/admin/students`, `/admin/departments`, `/admin/programs`, `/admin/audit-log`.

---

## 5. Engineering Guardrails for M3 (Backend) & M4 (Frontend)

### 5.1 Milestone 3 — Backend (`feat/m3-backend`) Rules
1. **Strict Contract Alignment (`v1.0.0`):**
   * All SQL tables, views (`review_details`), and RPCs (`search_students`, `get_student_by_id`, `get_own_profile`, `update_own_profile`, `suggest_review_tags`) in `supabase/migrations/` must match the exact column names, parameter names, and return shapes defined in `contract/openapi.yaml`.
2. **Row Level Security (RLS) & `reviews.body_text` Lock:**
   * Enable RLS on **every** table in the `public` schema.
   * Enforce the 4 contract identities:
     * `pending` faculty: may only read their own `faculty_profiles` row; `0` rows returned on all other tables.
     * `active` faculty: may read active reviews, students, approved taxonomy, and their own `hidden` reviews; may only mutate their own reviews (`owner_id = auth.uid()`).
     * `admin`: may manage `faculty_profiles`, `student_profiles`, `departments`, `programs`, `approval_queue_items`, and read metadata-only `audit_log_entries`; **blocked** by RLS from mutating `reviews` content or reading `hidden`/`deleted` reviews.
   * **Direct PostgREST writes to `reviews.body_text` must be blocked for all roles**; review creation, editing, and status transitions go exclusively through Edge Functions.
   * When a review's status changes to `hidden` or `deleted`, its row in `review_embeddings` must be deleted immediately so hidden/deleted reviews are never retrieved by semantic search.
3. **Edge Functions, De-identification & Gemini Isolation (`supabase/functions/`):**
   * Always forward the caller's `Authorization: Bearer <jwt>` header when creating the request-scoped Supabase client inside an Edge Function so RLS policies remain enforced.
   * Replace all student name variants (`first_name`, `middle_name`, `last_name`, `"First Last"`, `"Last, First"`) case-insensitively with `{{STUDENT:<system_uuid>}}` (never using `student_id_number`) **before** any text is sent to Gemini for embeddings or chat completion, and reverse-substitute `{{STUDENT:<uuid>}}` back into the response.
   * `GEMINI_API_KEY` must only be read via `Deno.env.get('GEMINI_API_KEY')` inside `supabase/functions/`.
   * All Deno unit and Edge Function tests (`supabase/functions/**/*.test.ts`) must mock Gemini and **never** make live network calls to `generativelanguage.googleapis.com` in local or CI test runs.

### 5.2 Milestone 4 — Frontend (`feat/m4-frontend`) Rules
1. **Three-Bucket State Taxonomy (No State Duplication):**
   * **Server / Remote State:** Managed exclusively by **TanStack Query** (`app/src/hooks/` + `queryKeys.ts`). Never copy query results (`students`, `reviews`, `departments`, `programs`, `approvalQueueItems`) into React Context or `useState`.
   * **True Cross-Cutting Client State (React Context — max 3 providers):**
     1. `SessionContext` (`app/src/context/SessionContext.tsx`): Supabase `onAuthStateChange` + `getOwnProfile` resolution (`session`, `profile`, `role`, `status`) and dev mock-role switcher.
     2. `ChatContext` (`app/src/context/ChatContext.tsx`): `useReducer` state machine (`idle` → `sending` → `succeeded` | `rate_limited` | `failed` → `retrying`) preserving the active chat thread across route changes.
     3. `PreferencesContext` / `ThemeContext` (`app/src/context/ThemeContext.tsx`): theme and persisted UI preferences.
   * **Form & Ephemeral UI State:** Managed by **React Hook Form + Zod** (`@hookform/resolvers/zod`) using schemas in `app/src/lib/validation/` backed by pure domain rules in `app/src/lib/rules/`.
2. **Two-Layer Validation & Error Handling:**
   * Client forms validate via Zod before firing network mutations (500-word review limit, non-blank review body, tag limits, 1–200 char taxonomy names, unchanged-edit rejection, mandatory rejection reason).
   * Server errors (`400`, `401`, `403`, `404`, `409`, `422`, `429`) are normalized via `ApiRequestError` and surfaced inline with `error.message` and `error.hint`.
   * Any Prism mock-only header (`Prefer: code=...`) or simulation button in UI pages must be strictly gated behind `import.meta.env.DEV`.
3. **Modal & Design System Rules:**
   * No nested modals (e.g., rejection reasons in approval queues use inline row expansion via `RejectionRow` / `.ui-queue-rejection-row`).
   * Use `.ui-*` Design System primitives (`app/src/components/ui/`) and CSS custom properties (`var(--*)` tokens from `design-system.css`).

---

## 6. Known Debt & Active Migrations
* **Legacy Hex & Inline Styles:** When touching existing React pages in `app/src/pages/`, prefer `.ui-*` classes and CSS custom property tokens (`var(--foreground)`, `var(--muted)`, `var(--border)`, `var(--destructive)`) over ad-hoc hex colors.
* **Typography:** `DESIGN_SYSTEM.md` specifies **Outfit** for UI text, headings, and tabular numbers (`--font-number: var(--font-sans)`), and standard system monospace for developer code.
* **Mockup Isolation:** `mockup/` remains the frozen Milestone 1 static reference served at `/mockup/*` via `app/vite.config.ts`; all M4 feature work happens in `app/src/`.
