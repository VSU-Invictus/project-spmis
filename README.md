# Student Profiling Management Information System (SPMIS)

A web-based, university-wide system that lets faculty members contribute review-style information about students to support selection, recommendation, and vetting for activities (competitions, events, tasks, and similar opportunities).

**Project Managers:** Jomari Joseph A. Barrera · Kyle Anthony Nierras

Copyright © 2026 Jomari Joseph A. Barrera. All rights reserved. See [LICENSE.md](./LICENSE.md).

## Table of Contents
1. [Overview](#1-overview)
2. [Project Team](#2-project-team)
3. [Tech Stack](#3-tech-stack)
4. [Getting Started](#4-getting-started)
5. [Project Structure](#5-project-structure)
6. [Domain Rules & Business Logic](#6-domain-rules--business-logic)
7. [Data Model Reference](#7-data-model-reference) 
8. [UI/UX Sitemap & Features](#8-uiux-sitemap--features)
9. [Design Details](#9-design-details)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Out of Scope](#11-out-of-scope)
12. [Assumptions & Decisions Log](#12-assumptions--decisions-log)
13. [Project Management & Contributing](#13-project-management--contributing)
14. [Deployment](#14-deployment)
15. [License](#15-license)
16. [Glossary](#16-glossary)
17. [Open Questions & Risks](#17-open-questions--risks)

---

## 1. Overview

SPMIS is an "intelligence network" among faculty: any faculty member, from any academic department, can contribute a review — free text plus optional tags — about a student they have taught, advised, coached, or otherwise worked with. Reviews are opinions grounded in a relationship, not verified facts, and every contributor is always visibly attributed; nothing in the system is ever anonymized. A contributor retains full, exclusive control over their own review's visibility (hide/unhide) and can delete it outright. Other faculty mine this information in two ways — structured filters, or an AI chatbot that can reason across the entire visible corpus — to inform decisions made *outside* the system about who to select, recommend, or vet for an activity. Activity/opportunity management itself is not part of this system.

**Project repository:** [Repository URL](https://github.com/VSU-Invictus/project-spmis)

Three roles are supported:
- **Faculty Member** — self-registers, contributes/manages their own reviews, browses/filters/chats to research students, applies to register new students or propose new programs/departments.
- **System Administrator** — verifies faculty accounts and student/program/department applications; never has access to, or override power over, review content itself.
- **Database Administrator** — an out-of-band, infrastructure-level role, not an in-app role. Only ever invoked to force-delete a record pursuant to a verified Terms & Conditions violation decided by appropriate personnel outside this system.

---

## 2. Project Team

| Role | Name | GitHub Username |
|---|---|---|
| Team Leader | Bandibas, Norman John N. | `@eNJay143` |
| Frontend Lead | Arañez, Carl Roy F. | `@carlroyaranez` |
| Frontend Dev | Asis, Monarch Renante G. | `@mrAsis1` |
| Frontend Dev | Paloma, Nexus Francisco | `@NexusfPaloma` |
| Frontend Dev | Vega, Geryme M. | `@gerymeee` |
| Backend Lead | Moreno, Radz Ponce A. | `@donot4tmee` |
| Backend Dev | Magadan, Evan Kasimir Y. | `@EvanMagadan` |
| QA Lead | Bantaculo, Reese Tortillas | `@reeseBan` |
| QA Member | Caduyac, Liza Mae G. | `@Zaming` |
| QA Member | Castro, Azriel Kaye C. | `@AzrielKaye` |
| QA Member | Dollera, Precious Belle | `@dollyraexe` |

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 single-page app, built with Vite |
| Language | TypeScript |
| Routing | React Router (data router) |
| Server state / data fetching | TanStack Query |
| Client state | React Context + `useReducer` — session/role, chat conversation, and UI preferences; no third-party global store |
| Forms | React Hook Form + Zod resolver |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase — PostgreSQL with Row Level Security, Auth; `pgvector` extension enabled for review-embedding retrieval |
| Backend logic | Supabase Edge Functions (Deno) — every operation needing a secret, a privileged write, or multi-step orchestration |
| Auth | Supabase Auth — Google OAuth only (any Google account; admin verification gates feature access) |
| AI (generation + embeddings) | Google Gemini API, called **only** from Edge Functions — see [§9 AI De-identification & Retrieval Design](#9-design-details) and [Assumption 16](#12-assumptions--decisions-log) |
| API contract | OpenAPI 3.1 — `contract/openapi.yaml`, hand-authored, the single source of truth for every endpoint the frontend may call |
| API documentation | Redoc — in-app `/docs` route (auth-gated outside development) plus a static bundle published by CI (`@redocly/cli`) |
| Generated API client | `openapi-typescript` (types) + `openapi-fetch` (typed client) — generated from the contract, never hand-edited |
| Contract enforcement | `redocly lint`, a codegen-freshness check, and a PostgREST drift check — all run in CI |
| API mocking | MSW (component/e2e tests) and Prism (runnable stub server) — lets screens be built against the contract before the backend exists |
| Database types | `supabase gen types typescript` — database-side types, kept distinct from contract types |
| Migrations | Supabase CLI, SQL migration files |
| Validation | Zod on the client, mirroring the contract's request schemas; RLS, DB constraints, and Edge Function checks server-side |
| Testing | Vitest + React Testing Library (unit/component), Playwright (e2e) |
| CI/CD | GitHub Actions |
| Project Management | GitHub Issues, Milestones, Projects (board), Pull Requests |
| Hosting | Vercel (static SPA build) + hosted Supabase project (database/auth) |
| Node | 20.x (pin via `.nvmrc`) |
| Package manager | npm — one lockfile (`package-lock.json`); do not introduce a second package manager |

### Contract-First Convention

There is no application server between the React app and Supabase — Supabase *is* the backend. The frontend/backend boundary is therefore not a deployment boundary but a **contract**: `contract/openapi.yaml`.

The frontend never queries the database ad hoc. Every call it makes is an operation declared in the contract, and the typed client is generated from that file, so an endpoint that isn't in the contract cannot be called in a type-checking build. The contract covers two backend surfaces:

1. **PostgREST data endpoints** (`/rest/v1/<table>`) — the read and simple-write operations the app is entitled to make. Authorization is RLS, not client-side discipline.
2. **Edge Function endpoints** (`/functions/v1/<name>`) — anything that needs a secret, a privileged write, or a multi-step transaction (see [§9 API Contract](#9-design-details) for this project's full list).

Supabase auto-publishes a machine-generated OpenAPI description of PostgREST. **That is not the contract**: it exposes every column and filter on every table, changes silently with each migration, and carries no versioning. `contract/openapi.yaml` is the curated, reviewed subset the frontend is allowed to use; CI diffs the two so a migration that breaks a documented shape fails the build rather than the browser.

This boundary carries unusual weight in SPMIS. Review text must be de-identified before it reaches Google Gemini, and the Gemini key must never be shipped to a browser — so review authoring and chat are *contractually* Edge Function operations, not table writes. `Review.body_text` is not a column the frontend is permitted to write directly, and RLS enforces that independently of the contract.


## 4. Getting Started

### Prerequisites
- Node.js 20.x (`nvm use`)
- npm — canonical package manager
- Docker (for local Supabase)
- Supabase CLI
- A Supabase project (remote, for staging/production) with `pgvector` enabled
- A Google Cloud OAuth client (for Google Sign-In)
- A Google AI Studio (Gemini) API key

### Environment Variables
Create a `.env.local` file. This is a client-side bundle: **every `VITE_`-prefixed variable is compiled into JavaScript the browser downloads, so nothing secret may appear here.**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=            # publishable anon key; RLS is what protects the data
VITE_SITE_URL=                     # e.g. http://localhost:5173 — used for OAuth redirect URLs
```
`GEMINI_API_KEY` is an **Edge Function secret**, never an app variable — there is no server-side app environment to hide it in, so it lives with the only code that may use it:
```bash
supabase secrets set GEMINI_API_KEY=...
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions by the platform automatically — do not add them to `.env.local`. Google OAuth client ID/secret are configured in the Supabase Auth provider dashboard.

### Installation
```bash
git clone <repo-url>
cd spmis
npm install
supabase login
supabase link --project-ref <project-ref>
```

### Local Development Database
```bash
supabase start
supabase migration up
supabase db seed
supabase gen types typescript --local > src/lib/supabase/database.types.ts
supabase functions serve                # run Edge Functions locally
```
Run `supabase gen types typescript` again after every schema-changing migration.

### Generating the API Client
The typed client is generated from the contract, not written by hand:
```bash
npm run contract:lint     # redocly lint contract/openapi.yaml
npm run contract:gen      # openapi-typescript → contract/generated/schema.d.ts
npm run contract:check    # fails if generated output is stale, or if PostgREST has drifted from the contract
npm run contract:docs     # build the static Redoc bundle
```
`contract/generated/` is committed so a fresh clone type-checks without network access; `contract:check` in CI keeps it honest. Redoc is also served in-app at `/docs` while the dev server is running.

### Seed Data Specification
`supabase/seed.sql` should populate enough sample data to exercise every UI state without real student data:
- 2–3 sample Departments and 2–3 sample Programs (all `approved`).
- A handful of FacultyProfiles spanning both statuses: at least one `pending` (to exercise the pending-verification screen) and several `active`, including one seeded as a System Administrator.
- A dozen or so StudentProfiles distributed across the sample Programs.
- A small set of sample Reviews with tags, deliberately including at least one `hidden` review and one `deleted` review, so hide/delete visibility rules are testable locally without waiting for real usage.
- At least one pending ApprovalQueueItem of each type (faculty account, student registration, program proposal, department proposal), so admin queues aren't empty on first run.

### Running the App
```bash
npm run dev
```
The app runs at `http://localhost:5173`.

### Available Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and produce the production bundle |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit/component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run contract:lint` | Lint `contract/openapi.yaml` (`redocly lint`) |
| `npm run contract:gen` | Regenerate the typed API client from the contract |
| `npm run contract:check` | Fail if the generated client is stale or PostgREST has drifted from the contract |
| `npm run contract:docs` | Build the static Redoc bundle |
| `npm run db:types` | Regenerate Supabase database types |
| `npm run functions:serve` | Run Edge Functions locally (`supabase functions serve`) |

### Troubleshooting
- **RLS denials during local dev**: confirm you're testing as an authenticated role (not the service role key, which bypasses RLS) — see [Data Access & RLS](#9-design-details).
- **OAuth sign-in issues**: there is no domain restriction (any Google account may sign in); if sign-in fails outright, check the Supabase Auth Google provider configuration rather than an allow-list, since none exists.
- **AI chatbot errors locally**: confirm the `GEMINI_API_KEY` Edge Function secret is set (`supabase secrets list`) and that `supabase functions serve` is running — the SPA has no fallback path to Gemini. If requests intermittently fail, check whether the Gemini free-tier daily quota has been exhausted by other local/testing traffic.
- **404 on a deep link after deploy**: the SPA needs a catch-all rewrite to `index.html` (see [§14](#14-deployment)) — without it, only `/` resolves.
- **`contract:check` fails after a migration**: PostgREST's shape changed but `contract/openapi.yaml` wasn't updated. Update the contract, re-run `contract:gen`, and commit both.
- **Migration conflicts**: run `supabase migration list` to check for divergence between local and remote history before pushing.

## 5. Project Structure
```
contract/
  openapi.yaml         # THE contract — single source of truth for every callable endpoint
  redocly.yaml         # lint ruleset + Redoc theme config
  generated/           # openapi-typescript output (committed, CI-verified fresh, never hand-edited)
src/
  main.tsx             # app entry; mounts providers
  App.tsx              # router + provider composition
  routes/
    auth/              # Google sign-in, pending-verification screen, T&C acceptance
    faculty/           # faculty portal routes
    admin/             # admin portal routes
    docs/              # in-app Redoc viewer (auth-gated outside development)
  components/
    ui/                # shared primitives (buttons, modals, tables, badges)
    features/          # feature-specific components (review composer, filter panel, chat UI)
  context/             # React Context providers (see §9 State Management)
    SessionContext.tsx      # session, faculty profile, role, verification status
    ChatContext.tsx         # active chatbot conversation, in-flight state, retry status
    PreferencesContext.tsx  # theme, table density, persisted UI preferences
  lib/
    api/               # openapi-fetch client bound to contract/generated: auth header, error mapping
    supabase/          # supabase-js browser client (auth only), generated database types
    validation/        # Zod schemas mirroring the contract's request bodies
  hooks/               # TanStack Query hooks, one per contract operation
supabase/
  migrations/          # SQL migration files
  functions/           # Edge Functions — each one an operation in contract/openapi.yaml
    reviews/           # create/edit/hide/delete: de-identification + embedding lifecycle
    chat/              # AI chatbot; the only holder of GEMINI_API_KEY
    approvals/         # bulk approve/reject across the four queue types
  seed.sql             # local/dev seed data
.github/
  workflows/           # CI pipelines
  ISSUE_TEMPLATE/       # bug report / test-case issue templates
```

Note what is *absent*: there is no `lib/ai/` in `src/`. De-identification, embedding, retrieval, and prompt assembly live exclusively in `supabase/functions/`, because none of them may run on a machine the user controls.

## 6. Domain Rules & Business Logic

### Users & Roles
- Two in-app roles: Faculty Member, System Administrator. No Student role/access exists.
- **Faculty self-registration**: sign in with any Google account. This creates a `pending` FacultyProfile with self-declared name and department. The user sees a pending-verification screen and has no feature access until a System Administrator approves the account (Assumption 1).
- **System Administrator accounts** are assumed to be provisioned directly (seed/manual/promotion by an existing admin), not through the self-registration flow (Assumption 2 — flagged for confirmation).
- System Administrator is a single, university-wide role — not scoped per department.
- A faculty member always belongs to exactly one Department.

### Departments & Programs
- Both **Department** and **Program** are admin-managed lists with the same apply→approve pattern: a faculty member can propose a new one or an edit; it sits `pending` until a System Administrator approves or rejects it.
- A department can also be proposed inline during faculty self-registration; the admin may approve the new department as-is, or redirect the applicant to an existing approved department instead.
- **Program is entirely independent of Department** — no foreign-key relationship between them.

### Students
- **StudentProfile** has: ID, last name, first name, middle name (optional), program.
- Admin-direct registration is immediate/active.
- Faculty-submitted registration requires **physical verification** — a real-world, off-system process. The admin's approve/reject action is the only trace left in SPMIS; no verification-method or reference field is captured (per the user's explicit instruction — a simple approve/reject action is sufficient).
- SPMIS maintains its own, independent student roster; no external roster or registrar system feeds StudentProfile.

### Reviews
- A Review has: the subject student, the authoring (owner) faculty member, free-text body, and optional tags.
- A faculty member may author unlimited reviews about the same student over time, and may **edit**, **hide/unhide**, or **delete** any review they own — no one else, including System Administrators, has any of these powers over another faculty member's review content.
- **Edit history** is retained and is visible to **every** user who can view the review (not gated to owner or admin) — a first-class transparency feature, not an audit-only artifact.
- **Contributor identity is always visible.** There is no anonymization anywhere in this system — full attribution is a core trust/integrity value.
- **Hide** is a reversible, owner-exclusive toggle: a hidden review's content is visible to no one but its owner, and a System Administrator cannot view its content or override the toggle — only a metadata-level "hidden/unhidden by X at time T" entry appears in the audit log. Hiding means "I'm retracting this assessment right now, for a reason (e.g. the student has changed)" — not deletion.
- **Delete** is treated as irreversible: content becomes invisible to everyone, including the owner and admins, through the application. It is retained at the database layer only — never physically purged, and never surfaced through any in-app view (Assumption 9 — flagged, since owner-side invisibility after delete is inferred from the hide/delete distinction rather than explicitly stated).
- Hidden and deleted reviews are excluded identically from both mining features described below.

### Review Lifecycle (state summary)
| From | Action (actor) | To | Notes |
|---|---|---|---|
| *(new)* | Create (owner) | `active` | Generates `deidentifiedText` and a `ReviewEmbedding` immediately |
| `active` | Edit (owner) | `active` | No status change, but `deidentifiedText` is regenerated and the existing `ReviewEmbedding` is **recomputed in place** so AI retrieval never serves stale content against an updated review |
| `active` | Hide (owner) | `hidden` | Reversible; content visible only to owner; `ReviewEmbedding` removed |
| `hidden` | Edit (owner) | `hidden` | Owner may still edit their own hidden review; `deidentifiedText` is updated but no `ReviewEmbedding` is (re)created while hidden |
| `hidden` | Unhide (owner) | `active` | `ReviewEmbedding` regenerated from the current `deidentifiedText` |
| `active` or `hidden` | Delete (owner) | `deleted` | **Terminal** — irreversible in-app; content retained at DB layer only, invisible to everyone including the owner and admins; any `ReviewEmbedding` is removed |

### Mining Reviews (the "intelligence network" feature)
Two independent, complementary access paths — both respect the hide/delete exclusion rule identically:

1. **Structured filters** — department of the review's owner, tag keyword, owner (specific faculty member), and substring search within review text. Entirely internal to the system's own database; nothing leaves the trust boundary. Results are paginated (see [§8](#8-uiux-sitemap--features)).
2. **AI chatbot** — an open, cross-student conversational assistant (not scoped to one student at a time) that can reason over the entire visible review corpus to answer nuanced relational queries a structured filter can't express — e.g. "only from faculty who were an instructor of a course this student took" or "only from an adviser or coach of an org/team this student was part of." See [§9](#9-design-details) for how student privacy is protected before any text reaches the external AI provider.

A System Administrator can use both mining features but cannot author reviews (not a faculty member).

### Tags
- Free-form. On save, whitespace-tokenized, lowercased, and stored as normalized tag rows.
- No approval workflow — unlike Program/Department, any tag a faculty member types becomes immediately usable.

### Approval Workflow
- One generic pending→approved/rejected shape covers four application types: faculty account, student registration, program proposal (new-program submissions **and** edit-requests to an existing program, distinguished within the type's `payload` — see §7), department proposal.
- Admin queue views support a search bar and checkbox-driven bulk approve/reject for all four types (the faculty-verification queue was the motivating case — e.g. bulk-rejecting applications containing `@gmail.com` — but the same tooling applies everywhere). Queue views are paginated (see [§8](#8-uiux-sitemap--features)).
- The submitting faculty member is notified of the outcome, with a reason on rejection. See [§9 Notification Delivery Mechanism](#9-design-details) for how the notification is delivered.

### Approval Queue Lifecycle (state summary)
| From | Action (actor) | To | Notes |
|---|---|---|---|
| *(new)* | Submit (faculty, or admin direct-add) | `pending` | Admin-direct student/department/program additions may bypass `pending` entirely and are created already `approved` |
| `pending` | Approve (admin) | `approved` | **Terminal**; submitter notified |
| `pending` | Reject (admin) | `rejected` | **Terminal**; submitter notified with reason; resubmission creates a new ApprovalQueueItem, not a reopened one |

### Audit & Integrity
- Every mutating action generates an append-only AuditLogEntry: actor, action, entity, timestamp.
- Content is masked in the audit log exactly as it is everywhere else — a hide/unhide event never exposes review content to anyone but the owner; a delete event's content is not exposed to anyone via any in-app audit view, including System Administrators.
- The only path to a deleted review's content is a direct, out-of-band Database Administrator action, taken only pursuant to a verified Terms & Conditions violation determined by appropriate personnel outside this system's role model — a documented policy/process, not a built feature.

## 7. Data Model Reference

### Entity Glossary
| Entity | Purpose |
|---|---|
| FacultyProfile | Faculty identity; self-registered via Google, admin-verified; self-editable except email/department/role; carries the `role` field distinguishing Faculty Member from System Administrator |
| Department | Managed list; faculty always belongs to exactly one; apply→approve for new entries |
| Program | Managed list, independent of Department; apply→approve for new/edited entries |
| StudentProfile | Basic student record; admin-direct or faculty-applied (physically verified off-system) |
| Review | Free-text, tag-carrying assessment of one student by one faculty owner |
| ReviewRevision | Append-only version/diff history for a Review, visible to all who can see the review |
| ReviewTag | Normalized, lowercased, whitespace-tokenized tag linked to a Review |
| ReviewEmbedding | De-identified vector representation of a Review's active text, used for AI retrieval; removed the instant its Review is hidden or deleted |
| ApprovalQueueItem | Generic pending-application record: faculty account, student registration, program proposal, department proposal |
| AuditLogEntry | Immutable event log; content masked per the same visibility rules as the live UI |

### Field-Level Schema Sketch
This is a lightweight starting point for migration authoring, not final DDL — types, constraints, and indexes should be refined during actual schema implementation.

**FacultyProfile**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | equals `auth.users.id` |
| `email` | text, unique, not null | admin-only after creation |
| `full_name` | text, not null | self-editable |
| `department_id` | uuid, FK → Department, not null | admin-only after creation |
| `role` | enum(`faculty`,`admin`) | not null, default `faculty`; admin-only to set — never part of self-registration or self-editable; this is the field RLS policies check for System-Administrator-gated actions (§9) |
| `status` | enum(`pending`,`active`) | default `pending` |
| `created_at`, `updated_at` | timestamptz | |

**Department** / **Program**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `name` | text, unique, not null | |
| `status` | enum(`pending`,`approved`,`rejected`) | |
| `proposed_by` | uuid, FK → FacultyProfile, nullable | null for admin-direct entries |
| `created_at`, `updated_at` | timestamptz | |

**StudentProfile**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | internal key — never exposed to the AI provider |
| `student_id_number` | text, unique, not null | official/human-readable ID |
| `last_name`, `first_name` | text, not null | |
| `middle_name` | text, nullable | |
| `program_id` | uuid, FK → Program, not null | |
| `registration_source` | enum(`admin_direct`,`faculty_applied`) | |
| `created_at`, `updated_at` | timestamptz | |

**Review**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `student_id` | uuid, FK → StudentProfile, not null | |
| `owner_id` | uuid, FK → FacultyProfile, not null | immutable after creation |
| `body_text` | text, not null | never leaves the system boundary |
| `deidentified_text` | text, not null | only text sent to the AI provider |
| `status` | enum(`active`,`hidden`,`deleted`) | default `active` |
| `created_at`, `updated_at` | timestamptz | |

**ReviewRevision**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `review_id` | uuid, FK → Review, not null | |
| `body_text_snapshot` | text, not null | pre-edit snapshot |
| `edited_by` | uuid, FK → FacultyProfile, not null | always equals `Review.owner_id` |
| `edited_at` | timestamptz, not null | |

**ReviewTag**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `review_id` | uuid, FK → Review, not null | |
| `tag` | text, not null | lowercased, whitespace-tokenized |

**ReviewEmbedding**
| Field | Type | Notes |
|---|---|---|
| `review_id` | uuid, PK/FK → Review | 1:0-or-1 with Review |
| `embedding` | vector (pgvector) | |
| `generated_at` | timestamptz, not null | |

**ApprovalQueueItem**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `type` | enum(`faculty_account`,`student_registration`,`program_proposal`,`department_proposal`) | |
| `submitted_by` | uuid, FK → FacultyProfile, nullable | null for admin-direct actions |
| `payload` | jsonb, not null | type-specific application data; for `type = program_proposal`, an included `program_id` indicates an edit request to that existing Program, while its absence indicates a new-program submission |
| `status` | enum(`pending`,`approved`,`rejected`) | default `pending` |
| `decided_by` | uuid, FK → FacultyProfile, nullable | admin who decided |
| `decision_reason` | text, nullable | required on reject |
| `created_at`, `decided_at` | timestamptz | |

**AuditLogEntry**
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `actor_id` | uuid, FK → FacultyProfile, nullable | null for system-triggered events |
| `action` | text, not null | e.g. `review.hidden`, `application.approved` |
| `entity_type` | text, not null | |
| `entity_id` | uuid, not null | |
| `metadata` | jsonb, nullable | masked/content-free details only |
| `created_at` | timestamptz, not null | |

### Relationship / Cardinality Summary
| Entity A | Relationship | Entity B | Cardinality |
|---|---|---|---|
| FacultyProfile | belongs to (admin-locked) | Department | many : 1 |
| StudentProfile | belongs to | Program | many : 1 |
| FacultyProfile | authors | Review | 1 : many |
| StudentProfile | is subject of | Review | 1 : many |
| Review | has | ReviewRevision | 1 : many |
| Review | tagged with | ReviewTag | many : many |
| Review | has | ReviewEmbedding | 1 : 0 or 1 (present only while active) |
| FacultyProfile | submits | ApprovalQueueItem | 1 : many |
| Any auditable entity | generates | AuditLogEntry | 1 : many |

## 8. UI/UX Sitemap & Features

### Public / Auth
| Route | Purpose |
|---|---|
| `/login` | "Sign in with Google" (any account) |
| `/pending-verification` | Shown to a self-registered faculty member awaiting admin approval |
| `/terms` | Required Terms & Conditions (privacy, appropriate use, AI de-identification notice — must accept before activation) |
| `/docs` | Redoc view of `contract/openapi.yaml`; open in development, authenticated-only in deployed environments |

### Faculty Portal
| Route | Features |
|---|---|
| `/faculty/dashboard` | Quick links, status of own pending applications |
| `/faculty/students` | Search/browse students; structured filters (department of owner, tag, owner, substring); paginated results; empty state when no matches, loading skeleton while fetching |
| `/faculty/students/:id` | Student basic info + all visible reviews (active + own hidden), edit history shown inline |
| `/faculty/students/:id/new-review` | Compose a review (free text + tags) |
| `/faculty/students/register` | Apply to register a new student (pending, physically verified by admin) |
| `/faculty/chat` | Open, cross-student AI chatbot; shows a loading state during generation and a graceful retry prompt if the provider is rate-limited |
| `/faculty/programs` | View program list; apply to add/edit |
| `/faculty/departments` | View department list; apply to add |
| `/faculty/applications` | Status of own pending applications |
| `/faculty/profile` | Edit own profile (excl. email, department, role) |

### Admin Portal
| Route | Features |
|---|---|
| `/admin/dashboard` | System-wide stats, pending-queue counts |
| `/admin/faculty-applications` | Search + bulk approve/reject faculty registrations; paginated |
| `/admin/student-applications` | Search + bulk approve/reject faculty-submitted student registrations; paginated |
| `/admin/program-applications` | Search + bulk approve/reject program proposals; paginated |
| `/admin/department-applications` | Search + bulk approve/reject department proposals; paginated |
| `/admin/students` | Direct-add/manage students |
| `/admin/departments`, `/admin/programs` | Direct CRUD on managed lists |
| `/admin/faculty` | Manage faculty accounts; override any self-declared field including email/department |
| `/admin/audit-log` | Read-only, metadata-level audit trail (content masked per hide/delete rules); paginated |

## 9. Design Details

### Architecture
A React SPA talks to Supabase over HTTP, and only through operations declared in `contract/openapi.yaml`. Read-heavy views (student search, review lists, admin queues) are TanStack Query reads against PostgREST endpoints, where RLS decides what the caller may see. Writes split by whether the client can be trusted with them:

- **Simple, single-row writes** (profile edits, application submission) go straight to PostgREST under RLS.
- **Everything touching review content or the AI provider** goes through an Edge Function. Review create/edit/hide/delete must generate `deidentifiedText` and maintain the `ReviewEmbedding` lifecycle atomically with the status change; the chatbot must hold `GEMINI_API_KEY` and perform the reverse substitution before an answer is returned. Neither can happen in a browser.

There is no application server of our own, and the SPA is the least trusted component in the system: it runs on a machine the user controls, and its bundle is readable. Every rule that matters is therefore either an RLS policy or an Edge Function — never a client-side check.

### API Contract (OpenAPI 3.1 + Redoc)

**Source of truth.** `contract/openapi.yaml` is hand-authored and reviewed like code. It is the interface between whoever builds screens and whoever builds schema/functions, and it is written *before* either side is implemented.

**Layout and versioning.** Supabase fixes the path prefixes (`/rest/v1`, `/functions/v1`), so the contract carries its own semver in `info.version`. A breaking change (removing a field, tightening a type, changing an operation's meaning) requires a major bump plus a migration note in the PR description; additive changes are minor.

**Operations.** Every operation has a stable `operationId` in camelCase (`searchStudents`, `createReview`, `hideReview`, `askChatbot`), which is what the generated client's method names derive from. Operations are grouped by portal with `x-tagGroups` (Faculty / Admin / Auth), so Redoc's sidebar mirrors the app's structure.

**Auth.** One `bearerAuth` security scheme (the Supabase JWT) is declared globally. The few unauthenticated operations opt out explicitly with `security: []`. The contract documents, per operation, *which role can succeed* — RLS is the enforcement, but an undocumented 403 is a contract bug.

**Error model.** A single `Error` schema matching PostgREST's `{ code, message, details, hint }`. Edge Functions must return the same shape and status codes, so `src/lib/api` has exactly one error path regardless of which surface answered. The chatbot's provider-quota case is a documented `429` with a retry hint, not a generic 500 — the UI's graceful-retry behavior depends on being able to tell them apart.

**Edge Function operations for this system:**

| Operation | Endpoint | Why it can't be a plain PostgREST write |
|---|---|---|
| `createReview` | `POST /functions/v1/reviews` | Generates `deidentifiedText` and the initial `ReviewEmbedding` in the same transaction as the review row |
| `updateReview` | `PATCH /functions/v1/reviews/{id}` | Regenerates `deidentifiedText` and recomputes the embedding in place (or skips it, if the review is `hidden`) |
| `setReviewStatus` | `POST /functions/v1/reviews/{id}/status` | Hide/unhide/delete: adds or removes the `ReviewEmbedding` atomically with the status change, so a hidden review is never briefly retrievable |
| `askChatbot` | `POST /functions/v1/chat` | Sole holder of `GEMINI_API_KEY`; runs retrieval over `deidentifiedText`, calls Gemini, and performs the reverse substitution server-side |
| `decideApplications` | `POST /functions/v1/approvals` | Bulk approve/reject across a selection, with each decision's audit entry and submitter notification written together |

`Review.body_text` is not writable through PostgREST by any role — RLS denies it, so the de-identification step cannot be bypassed by calling the table endpoint directly. This is the one place where "the contract says so" is not sufficient and the database enforces it independently.

**Generated client.** `openapi-typescript` produces `contract/generated/schema.d.ts`; `openapi-fetch` wraps it into a typed client in `src/lib/api`, which attaches the current access token and normalizes errors. Query hooks in `src/hooks` are thin wrappers, one per operation. Nothing else in the app imports `supabase-js` for data access — the Supabase SDK is used only for auth.

**Drift detection.** After migrations run in CI, `contract:check` fetches the live auto-generated PostgREST description and compares it against every PostgREST path the contract documents. A migration that renames a column or changes a type fails CI, rather than surfacing as a runtime error in the browser.

**Documentation.** Redoc renders the contract two ways, deliberately: an in-app `/docs` route (the `redoc` React component, so contributors read the same spec the running build uses — gated behind an authenticated session outside development), and a static bundle built by `redocly build-docs` in CI, published as a build artifact so the contract is browsable without running anything.

### Auth & Session Flow
Supabase Auth handles Google OAuth through the `supabase-js` browser client, with the session persisted in browser storage and refreshed automatically, and **no domain restriction** — any Google account may sign in. `SessionContext` subscribes to `onAuthStateChange`, resolves the signed-in user's FacultyProfile once, and exposes `{ session, profile, role, status }` to the whole tree.

First sign-in creates a `pending` FacultyProfile with self-declared name and department. The pending user reaches only `/pending-verification` — but that redirect is a courtesy, not the gate: RLS denies a `pending` profile every faculty operation regardless of what the client renders, since route guards in a React bundle can be bypassed by whoever runs it.

### Data Access & RLS
- **Faculty (verified/active)**: SELECT on all active Reviews, StudentProfiles, Departments, Programs; SELECT on own hidden Reviews only; INSERT/UPDATE/soft-DELETE on own Reviews only; INSERT on ApprovalQueueItem; UPDATE on own FacultyProfile excluding email/department.
- **Faculty (pending)**: no access beyond the pending-verification screen.
- **System Administrator**: identified by `FacultyProfile.role = 'admin'`; full SELECT/UPDATE on FacultyProfile, StudentProfile, Department, Program, ApprovalQueueItem; SELECT (metadata-level only) on AuditLogEntry; **no** UPDATE/DELETE rights on Review content, enforced at the application/RLS layer regardless of role.

### AI De-identification & Retrieval Design
The AI features (embedding indexing + chatbot generation) call an external third-party API. During this initial/testing phase on Google Gemini's free tier — whose terms permit using submitted data to improve their models — every piece of review text that leaves the system boundary is de-identified first:

1. On create/edit — inside the `createReview`/`updateReview` Edge Function, never in the browser — alongside the raw `bodyText`, the system generates a `deidentifiedText` variant: the subject student's known name variants (last/first/middle name and common concatenations) are substring-replaced, case-insensitively, with a stable opaque placeholder — `{{STUDENT:<system_uuid>}}`, built from SPMIS's own internal primary key, **not** the student's official/human-readable ID number.
2. Only `deidentifiedText` is ever embedded (ReviewEmbedding) or assembled into the AI chatbot's retrieval context — `bodyText` never leaves the system. An edit to an already-`active` review recomputes its `ReviewEmbedding` in place (see the Review Lifecycle table in §6) so retrieval reflects the current text rather than a stale prior version; an edit to a `hidden` review updates `deidentifiedText` but does not create or touch a `ReviewEmbedding`, consistent with hidden reviews being excluded from both mining paths.
3. The chatbot's system prompt instructs the model to refer to students only by their given placeholder token, and never to invent or restate identifying detail beyond it.
4. Before the AI's answer is returned to the querying faculty member, the `askChatbot` Edge Function performs the reverse substitution — each `{{STUDENT:<uuid>}}` token is replaced with that student's real name/ID/program. This happens entirely inside the function, before the response crosses the contract boundary; the browser never receives a placeholder token or the mapping needed to resolve one. The retrieval step runs under the caller's own JWT, so it only ever pulls from reviews that faculty member is already entitled to see — no new access is granted by the substitution.
5. Hidden and deleted reviews never enter the AI's index — their ReviewEmbedding row is removed the instant the review is hidden or deleted, consistent with the mining-exclusion rule.
6. **Known limitation**: name-substring substitution catches the primary explicit identifier but cannot guarantee removal of indirect identifying context a contributor might write (nicknames, physical descriptions, named third parties, role descriptions like "the team captain"). This is a best-effort technical mitigation, not a formal anonymization guarantee, and is paired with a Terms & Conditions clause asking contributors to avoid unnecessary identifying detail about the student or third parties within review text.
7. **Planned upgrade path**: this layer is the interim safeguard for running on a free-tier model. A later version is expected to migrate the AI features to a paid tier (which carries a contractual no-training-on-input commitment); at that point the token-substitution layer may be kept as defense-in-depth rather than a strict requirement. That migration, and any relaxation, is deferred to a future planning pass.

### Notification Delivery Mechanism
- **v1: in-app only.** Application outcome notifications (approve/reject, with reason on rejection) surface via `/faculty/applications` status and dashboard indicators. No outbound email is sent.
- Outbound email (e.g., via a transactional provider or Supabase's built-in email) is a documented future enhancement, deferred until a provider is selected — see [Assumption 23](#11-assumptions--decisions-log).

### Rate Limiting & Abuse Prevention
- **`askChatbot` Edge Function**: throttling is applied inside the function, per faculty member, to protect the shared Gemini free-tier daily budget across all users. It has to live there — a static SPA has no request path to intercept. Exact thresholds (requests/day/faculty) are intentionally left unspecified pending real pilot usage data — see [Assumption 24](#12-assumptions--decisions-log). When the provider-level quota is exhausted, the function returns the contract's documented `429` with a retry hint, and the UI degrades to a retry prompt rather than a hard error (consistent with [Error Handling & Validation](#9-design-details) below).
- **Mutation endpoints** (review create/edit, tag add, applications): no custom per-user throttle planned for v1 beyond standard platform-level protections (Supabase's own API gateway limits); abuse is expected to surface through the audit trail and be handled per the Terms & Conditions process rather than technical blocking.

### Input Validation & Content Safety
- Review body text is always rendered as plain text — React escapes interpolated strings by default, and `dangerouslySetInnerHTML` is banned for review content by lint rule. Markdown is not interpreted in v1. This removes stored-XSS as an attack surface for user-authored review content.
- Review body length and tag length are capped in the contract's request schemas, mirrored by Zod on the form and re-checked inside the Edge Function — exact limits are an implementation detail, not fixed here. The client-side check is a UX affordance; the function's check is the enforcement.
- No automated profanity or content moderation filter in v1: consistent with the system's design principle that no one, including admins, has override power over review content — enforcement relies on faculty self-governance, the Terms & Conditions, and the audit trail, not technical filtering.

### Tag Handling
Free-form; on save, split on whitespace, lowercased, stored as normalized ReviewTag rows (duplicates within one review collapsed). No approval workflow.

### Approval Workflow & Notifications
A single ApprovalQueueItem shape covers all four application types. Admin queue views support search plus checkbox-based bulk approve/reject. The submitting faculty member is notified of the outcome either way, with a reason on rejection, via the in-app mechanism described above.

### Component & Styling Conventions
Tailwind CSS utilities with shadcn/ui as the component base — chosen for rapid, accessible, consistently-themed UI development without hand-rolling a design system for a pilot-scale academic tool.

### Responsive Design & Accessibility
Mobile-first breakpoints; target WCAG 2.1 AA (semantic HTML, keyboard-navigable forms/modals, sufficient color contrast, accessible labels on all form inputs) — set as SPMIS's own baseline given faculty are expected to use the system across both desktop and mobile devices.

### State Management
Three tiers, kept deliberately separate:

- **Server state — TanStack Query.** Everything that lives in Postgres: student search results, review lists, admin queues, audit entries. Query keys are derived from the contract's `operationId` plus its parameters, so invalidation after a mutation is mechanical rather than guesswork — hiding a review invalidates exactly the queries that could have contained it. Nothing fetched from the server is copied into Context.
- **Client state — React Context.** Cross-cutting state that isn't server data and would otherwise be prop-drilled through most of the tree:
  - `SessionContext` — session, FacultyProfile, `role`, and verification `status`, populated once from `onAuthStateChange`. Route guards, the API client's auth header, and every role-conditional render read from here. This is the app's single auth source of truth.
  - `ChatContext` — the active chatbot conversation, its in-flight/streaming state, and retry status. Chat turns are conversational UI state rather than a queryable server resource, so they belong here rather than in Query's cache; the surrounding layout and the composer both read from it.
  - `PreferencesContext` — theme, table density, and similar persisted UI preferences.
  Each provider is its own file with a `use…()` hook that throws when consumed outside its provider, and each holds a narrow value; a single app-wide "store" context is deliberately avoided, since it would re-render the whole tree on any change. Providers whose value is an object memoize it, and `ChatContext` uses `useReducer` — its transitions (send, stream, succeed, rate-limited, retry) are a state machine, not independent flags.
- **Local state — `useState`.** Forms, modals, filter panel drafts.

No third-party global state library is used; Query plus Context covers both tiers without one.

### Error Handling & Validation
Zod schemas in `src/lib/validation` mirror the contract's request bodies and back the React Hook Form resolvers, so a payload the server would reject is normally caught before it is sent. They are a UX affordance, not the enforcement layer — RLS and the Edge Functions are.

The generated client normalizes every failure into the contract's single `Error` shape, so components handle one error type whether it came from PostgREST or an Edge Function. `askChatbot` failures are distinguished by status: the documented `429` (provider quota exhausted, or the per-faculty throttle) renders a retry prompt with the returned hint, while a genuine provider error surfaces as a plain failure. Free-tier rate limits are expected during this phase, so the retry path is a normal state, not an edge case.

### Migration & Naming Conventions
Supabase CLI migrations: `YYYYMMDDHHMMSS_description.sql`, one logical change per file, snake_case identifiers throughout.

## 10. Non-Functional Requirements
- Designed for the stated initial scale: ~1,000 faculty across ~100 departments (3–20 faculty per department); student population assumed in the thousands, consistent with a typical mid-size university (assumption).
- Audit log entries retained indefinitely, no auto-purge. Deleted-review content is likewise retained at the database layer indefinitely, never purged, reachable only via the out-of-band Database Administrator process described in §9.
- AI provider calls originate only from Edge Functions; `GEMINI_API_KEY` is an Edge Function secret and is never part of the client bundle, which is fully readable by anyone who loads the app.
- Free-tier AI usage is expected to be rate-limited (low-hundreds-to-low-thousands requests/day depending on model, per current Gemini free-tier terms as of mid-2026) — workable for a pilot at this scale, but the provider integration should be a configuration change, not a redesign, when moving to a paid tier.
- **Performance targets (soft, pilot-scale goals, not load-tested SLAs)**: standard page loads (search, dashboards, queues) targeted under ~2 seconds server response time under expected pilot load; the AI chatbot has no hard latency SLA given reliance on a free-tier provider — the UI should show a loading state and tolerate multi-second responses gracefully.
- **Backup/recovery**: relies on the hosted Supabase project's built-in backup tier; no custom backup pipeline planned for v1.
- **Browser support**: latest two versions of Chrome, Firefox, Safari, and Edge; no legacy browser support required.

## 11. Out of Scope
- Activity/opportunity creation, management, or outcome tracking (a resulting review may still be entered manually).
- A student-facing portal, account, or any student visibility into the system.
- Structured "relationship type" metadata on reviews — deliberately superseded by free text plus AI-chatbot interpretation.
- Enrollment, grades, curriculum, or advising data of any kind.
- Any admin override or moderation power over review content.
- External/automated sync of student or faculty rosters from another system.
- A formal in-app appeals/dispute process for Terms & Conditions violations — handled by appropriate personnel outside the system, per policy.
- Outbound email notifications (deferred — see §9).
- Automated content moderation or profanity filtering (deferred — see §9).

## 12. Assumptions & Decisions Log
1. Faculty accounts are self-registered via Google Sign-In (any Google account); admin verification is required before any feature access; no password-based login for faculty.
2. System Administrator accounts are assumed provisioned directly (seed/manual/promotion), not via the self-registration flow — flagged for confirmation.
3. Student rosterization: admin-direct-add (immediate) or faculty-applied (pending, requires off-system physical verification, no verification-method field stored); no external database feeds the roster.
4. Program and Department are both independent, admin-managed lists with an apply→approve workflow; Program is entirely independent of Department (no FK).
5. A faculty member belongs to exactly one Department; a self-registering faculty member may propose a new one, which the admin can approve as-is or redirect to an existing department.
6. After verification, a faculty member may self-edit their profile except email, department, and role, which remain admin-only.
7. A Review is created, edited, hidden/unhidden, or deleted only by its owning faculty member — never by an admin.
8. Hiding a review is reversible by its owner and invisible to everyone else, including admins (who see only a metadata-level event in the audit log).
9. Deleting a review is irreversible and invisible to everyone, including the owner and admins, through the application; content is retained at the database layer only — flagged: owner-side invisibility after delete is inferred from the hide/delete distinction rather than explicitly stated; confirm.
10. Edit history on an active review is visible to every user who can view the review, not just the owner or admin.
11. Reviews carry free-text plus optional whitespace-tokenized, lowercased, free-form tags; tags require no approval.
12. Two access paths exist for mining review information — structured filters and an AI chatbot — both excluding hidden and deleted reviews identically.
13. The AI chatbot is not scoped to a single student; it reasons across the entire visible corpus.
14. All AI-facing text is de-identified via name-substring substitution against an internal opaque token before leaving the system, with reverse-mapping applied only to the final answer shown to an already-authorized viewer — see §9 for the mechanism and its documented limitations.
15. The system is expected to migrate AI features to a paid-tier provider in a later version for stronger data-use guarantees; the de-identification layer is the interim (and likely permanent defense-in-depth) safeguard.
16. Default AI provider for this phase: Google Gemini — chosen for offering both generation and embedding models under one ongoing free tier, and for pairing naturally with Supabase's `pgvector` extension; open to revisiting (e.g. DeepSeek).
17. No content moderation or override power is granted to System Administrators over review content under any circumstance within the system; the only override path is the out-of-band Database Administrator process.
18. Students have no account, login, or visibility into the system; protection against misuse relies on mandatory Terms & Conditions acceptance by every user, not technical restriction.
19. All admin approval queues share a common search + bulk-approve/reject UI pattern; the submitting faculty member is notified of the outcome either way.
20. Tech stack for SPMIS — React (Vite SPA), TypeScript, React Router, TanStack Query, React Context for client state, Tailwind CSS + shadcn/ui, Zod, Supabase (Postgres/RLS/Auth/Edge Functions, with `pgvector`), Vitest/RTL + Playwright, GitHub Actions, Vercel (static) + hosted Supabase, plus Google Gemini for AI generation/embeddings — a type-safe client backed by a single managed Postgres + Auth + Vector store, minimizing infrastructure surface for a pilot-scale system.
21. Non-functional defaults for SPMIS — indefinite audit retention (an integrity requirement, not a storage-cost tradeoff, at this scale), mobile-first responsive design, a WCAG 2.1 AA accessibility target, and shadcn/ui component conventions — are set as SPMIS's own baseline for a university-facing tool used by faculty across devices.
22. Project management (GitHub Issues/Milestones/PRs/CI) and licensing terms (All Rights Reserved, contributor IP assignment) follow the project's standard delivery workflow — see §13 and §15.
23. Notification delivery for v1 is in-app only; outbound email is a deferred enhancement pending selection of an email provider.
24. Rate-limiting thresholds for the AI chatbot (requests/day/faculty) are intentionally left unspecified pending real usage data from the Gemini free tier; the system should degrade gracefully (retry prompt) rather than hard-fail when limits are hit.
25. Performance targets stated in §10 are soft, pilot-scale goals, not load-tested SLAs.
26. **Role modeling** — System Administrator is a `FacultyProfile.role` value (`faculty`/`admin`), not a separate entity or table; admin-only to set, never part of self-registration or self-editable — see §7, §9.
27. **Embedding freshness on edit** — editing an `active` review recomputes its `ReviewEmbedding` in place (not just `deidentifiedText`) so AI retrieval never serves stale content; editing a `hidden` review updates `deidentifiedText` only, since hidden reviews carry no embedding — see §6, §9.
28. **Contract-first backend boundary** — there is no application server; Supabase is the backend, and the frontend/backend interface is `contract/openapi.yaml` (OpenAPI 3.1), documented with Redoc. The frontend may only call operations declared there, and calls through a client generated from it. The auto-generated PostgREST spec is treated as a drift-detection input, never as the contract itself — see §3 and §9.
29. **Server-side logic placement** — review authoring and the AI chatbot are Supabase Edge Function operations, not table writes, because de-identification must precede any text leaving the system and `GEMINI_API_KEY` cannot exist in a client bundle. `Review.body_text` is not writable through PostgREST by any role, so the de-identification step cannot be bypassed — see §9.

## 13. Project Management & Contributing

This system is built by a cross-functional project team. Everything below assumes developers, QA engineers, product/project management, and other delivery members sharing one repository, and the conventions exist to keep the team from blocking itself.

All project management lives on GitHub: Issues, Milestones, Projects (board), Pull Requests, and reviews. There is no external PM tool.

### Team Structure & Parallel Work

The contract is what makes parallel delivery possible. `contract/openapi.yaml` is written and agreed **first**, before either half is implemented — after that, the frontend team can build every screen against a mock while the backend team implements schema, RLS, and Edge Functions, and neither waits on the other. Integration is then a base-URL change rather than a week of surprises.

A workable delivery split, adapted to the team's size:

| Responsibility | Owns |
|---|---|
| **Contract** | `contract/openapi.yaml` — the operations, schemas, and error responses. Reviewed by both sides before either builds against it |
| **Frontend** | `src/` — routes, components, Context providers, Query hooks, and the generated client wrapper |
| **Backend** | `supabase/` — migrations, RLS policies, Edge Functions |
| **Quality Assurance** | Test strategy, test-case issues, automated end-to-end coverage, and release verification |
| **Project Manager** | Milestones, the issue board, delivery coordination, and the tiebreak on contract disputes |

Two rules keep the split honest:

- **A contract change is a shared decision.** A PR that edits `contract/openapi.yaml` needs approval from someone on the *other* side of it — the frontend cannot quietly add a field it wants, and the backend cannot quietly drop one the UI renders. Ordinary PRs that only consume the contract need the standard single approval.
- **Nobody hand-edits generated output.** `contract/generated/` is regenerated with `npm run contract:gen`; a PR that edits it by hand fails `contract:check` in CI.

Project contributions are documented through commits, pull requests, issue history, test evidence, and review records — see §15.4.

### Test Cases as Issues
End-to-end test cases are raised as GitHub Issues by Quality Assurance in coordination with the Project Manager. Each test-case issue specifies the scenario, steps, and expected result (e.g., "Faculty member attempts to hide a review they don't own — action should be rejected/hidden from the UI entirely"). A developer or QA engineer implements the corresponding Playwright test referencing the issue number, and the PR that adds it must close that issue.

### Milestones
Milestones group issues by development phase/sprint (e.g., "Review Authoring & Lifecycle," "Approval Queues," "AI Chatbot & De-identification"). Every issue should be assigned to a milestone before work starts.

### Branching & Pull Requests
- Branch naming: `feature/<short-description>`, `fix/<short-description>`, tied to an issue number where applicable (e.g., `feature/09-review-hide-toggle`).
- **Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)**: `type(scope): imperative description`, using `feat`, `fix`, `docs`, `refactor`, `test`, `style`, or `chore`. A change that breaks existing callers takes a `!` before the colon — `feat(contract)!: rename the load endpoint` — which is how a breaking contract change announces itself in the log rather than in someone's failing build.
- Every PR must reference the issue(s) it addresses and describe what changed.
- **1 required reviewer approval** before merging, enforced via GitHub branch protection on `main`.
- CI (see below) must pass before a PR is eligible for merge.

### CI (GitHub Actions)
Workflows in `.github/workflows/` run on every PR:
- Contract lint (`npm run contract:lint`)
- Contract check (`npm run contract:check`) — fails if the committed generated client is stale, or if the live PostgREST schema has drifted from what the contract documents
- Lint (`npm run lint`)
- Typecheck (`npm run typecheck`)
- Unit/component tests (`npm run test`)
- Build (`npm run build`)
- E2E tests (`npm run test:e2e`) against a Supabase instance seeded via `supabase/seed.sql`, run with an authenticated test role (not the service role key) so RLS — including the review hide/delete visibility rules — is actually exercised.

The contract jobs run first: a PR that changes schema without updating `contract/openapi.yaml` fails before anything else runs, which is the point of the boundary.

On merge to `main`, a separate deploy workflow applies pending migrations to staging (`supabase db push`), deploys Edge Functions (`supabase functions deploy`), publishes the static Redoc bundle (`npm run contract:docs`) as a build artifact, and then promotes the Vercel deployment.

## 14. Deployment
- Frontend is a static bundle (`npm run build`) hosted on Vercel; database, auth, and Edge Functions live in a hosted Supabase project with `pgvector` enabled.
- Vercel needs a catch-all rewrite to `index.html` (`vercel.json`) so React Router can resolve deep links; without it only `/` is reachable.
- GitHub Actions applies `supabase migration up`/`db push` against a staging project, then `supabase functions deploy`, before promoting to production.
- `VITE_`-prefixed variables are configured per-environment in Vercel project settings (Preview/Production). They are compiled into the client bundle and are therefore public by construction. **`GEMINI_API_KEY` is never among them** — it is set per Supabase environment with `supabase secrets set` and is readable only by the `chat` Edge Function.
- The static Redoc bundle is published per environment alongside the app, so the deployed contract is always browsable at a stable URL.


## 15. License


**Student Profiling Management Information System (SPMIS)**

Copyright © 2026 Jomari Joseph A. Barrera. All rights reserved.

### 14.1 Ownership

This software, including its source code, database schema, documentation, and associated design materials (collectively, the "Work"), is the intellectual property of Jomari Joseph A. Barrera ("the Owner"). The Work is developed under the Owner's direction by the project team. Any code, documentation, designs, test assets, or other materials contributed to the Work are project contributions and are assigned to the Owner as set out in Section 14.3.

### 14.2 Grant of Rights

No rights are granted to any person or entity to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the Work, in whole or in part, except:

(a) as expressly and separately authorized in writing by the Owner; or
(b) as necessary for an authorized Contributor (as defined in Section 14.3) to perform assigned project work under the Owner's direction.

If this repository or any part of the Work is made visible to the public or to external parties, such access is provided, if at all, for viewing purposes only. No license to reuse, redistribute, or create derivative works is granted by that access.

### 14.3 Contributors

"Contributor" means any developer, QA engineer, designer, project manager, or other authorized project team member who submits code, documentation, test assets, designs, or other materials to the Work.

By contributing, a Contributor:

(a) assigns to the Owner all right, title, and interest in and to their contribution, to the fullest extent permitted by law, or, where such assignment is not legally permitted, grants the Owner a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and incorporate the contribution into the Work without restriction;
(b) retains the right to identify their participation in the project for personal portfolio or resume purposes, but may not distribute, publish, or otherwise reuse the Work's source code itself without the Owner's separate written permission;
(c) acknowledges that this assignment is made in connection with project work, without expectation of compensation, royalty, or ongoing rights beyond the attribution described in Section 14.4.

### 14.4 Attribution

The Owner may, at their discretion, credit Contributors for their work. Attribution does not confer any ownership, licensing, or distribution rights on a Contributor.

### 14.5 Relationship to Applicable Agreements

This license states the Owner's claim of ownership and the terms on which the Owner makes the Work available. It does not attempt to override, and remains subject to, any applicable employment, contractor, client, or intellectual-property agreement. Where such an agreement conflicts with this license, that agreement shall govern to the extent required by law.

### 14.6 No Warranty

THE WORK IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE OWNER BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE WORK OR ITS USE.

### 14.7 Governing Law

This license is governed by and construed in accordance with the laws of the Republic of the Philippines.

### 14.8 Contact

For permission requests or licensing inquiries, contact Jomari Joseph A. Barrera.

### 14.9 Data Privacy Notice

This system processes personal information about students and faculty as part of its core function. Its handling of that data — including the AI de-identification approach described in §9 — should be reviewed against the Philippines' Data Privacy Act of 2012 (RA 10173) and any applicable organizational data-privacy policy before any deployment involving real student data. This document does not constitute legal advice; independent legal/compliance review is recommended.

*This is not legal advice. Independent legal review is recommended, particularly regarding how this license interacts with applicable intellectual-property agreements and data privacy law.*

## 16. Glossary

| Term | Meaning |
|---|---|
| **Active** (Review) | Normal, visible state — findable via filters and the AI chatbot by anyone entitled to view it. |
| **Hidden** (Review) | Owner-retracted; visible only to the owner; reversible. |
| **Deleted** (Review) | Terminal, irreversible in-app; content retained at the DB layer only, invisible to everyone including the owner. |
| **Pending** (FacultyProfile / ApprovalQueueItem) | Awaiting a System Administrator's approve/reject decision. |
| **Active/Verified** (FacultyProfile) | Admin-approved; has full faculty feature access. |
| **De-identified text** | A Review's body text with the subject student's known name variants substring-replaced by an opaque placeholder token, generated before any text leaves the system boundary to the AI provider. |
| **Mining** | The act of researching the review corpus via structured filters or the AI chatbot. |
| **Database Administrator** | An out-of-band, infrastructure-level role (not an in-app role) invoked only to force-delete a record pursuant to a verified Terms & Conditions violation. |

## 17. Open Questions & Risks

Consolidated from flagged items across the document — resolve before or during early implementation:

1. **System Administrator provisioning** (Assumption 2) — confirm accounts are seeded/promoted rather than self-registered.
2. **Owner-side invisibility after delete** (Assumption 9) — confirm a deleted review should be invisible even to its own owner through the application, not just to other faculty.
3. **AI chatbot rate-limiting thresholds** (Assumption 24) — no concrete numeric limits are set; needs real pilot usage data or an explicit policy decision before launch.
4. **Notification mechanism** (Assumption 23) — confirm in-app-only notifications are acceptable for v1, or prioritize selecting an email provider sooner.
5. **Performance targets** (§10) — confirm the stated soft targets are acceptable, or commission load testing ahead of a larger rollout.
6. **Data Privacy Act (RA 10173) compliance review** (§15.9) — required before any deployment involving real student data; not yet conducted.
7. **De-identification limitation** (§9, point 6) — indirect identifying context (nicknames, physical descriptions, named third parties) is not caught by substring substitution; monitor whether this proves sufficient in practice or needs a stronger mitigation.
8. **PostgREST drift-check strictness** (§9) — the CI comparison between `contract/openapi.yaml` and the live auto-generated PostgREST description needs a decided policy on additive changes: a new column is harmless to the frontend but is still drift. Confirm whether the check fails on any difference or only on ones affecting documented operations.
9. **Contract review in a small group** (§13) — the both-sides-approval rule for contract changes assumes the group is large enough that the frontend and backend halves are different people. Confirm how it degrades for a two-person group, where one member may own both sides and the rule becomes self-approval.
10. **Edge Function cold-start latency for the chatbot** (§9, §10) — moving chat from an always-warm server process to an on-demand Edge Function adds cold-start time on top of Gemini's own latency. No hard SLA exists (§10), but confirm the combined worst case is acceptable for a pilot before launch.

