# SPMIS Project Context & AI Rules

## 1. Source of Truth (Hierarchical)
When resolving conflicts, AI agents must evaluate directives in this strict order:
1. **`README.md`** — the master 17-section authoritative specification (domain rules, data model, sitemap, assumptions log). Treat it as the ultimate source of truth for *what the system is*.
2. **Minutes of the Meeting (MoM)** — binding project decisions, stored as `docs/minutes/mom-0N/mom-0N.md` (+ signed `.pdf`), currently MoM #1–#7 (26 Aug – 03 Oct 2026). Per README §13, the Project Manager holds the tiebreak on contract disputes; MoM decisions govern project process, priorities, and UI/UX direction, and supersede the spec where the two conflict.
3. **`docs/DESIGN_SYSTEM.md`** — the official token, spacing, and typographic standard.
4. **`mockup/pages/design-system.html`** — the living, interactive style guide. Consult it for `.ui-*` primitives before inventing new components. Its React port is `app/src/pages/StyleguidePage.tsx` (`/styleguide`).
5. **This `ai-context.md` file.**

> Note: README §3–§5 and §13–§14 describe the *target* repository (root `src/`, `contract/`, `supabase/`, `.github/`, `.nvmrc`, `vercel.json`, `LICENSE.md`). None of these exist yet; do not assume they do. `docs/DESIGN_SYSTEM.md` also references an `AdminLayout` in `app/src/pages/admin.tsx` and an `@/` import alias, neither of which exists, and its file links use absolute `c:/Users/monarch/...` paths.

## 2. Repo Map & Structural Constraints
Top level: `README.md`, `ai-context.md`, `.gitignore`, `app/`, `docs/`, `mockup/`.

**`mockup/` — static M1 mockup.** Per MoM #4, the mockup folder structure is locked and a strict **one-file-per-route** rule applies (each sitemap route = exactly one HTML file).
* `mockup/index.html` — meta-refresh redirect to `pages/auth/signin.html`.
* `mockup/pages/admin/` (10) — `dashboard`, `students`, `departments`, `programs`, `faculty`, `audit-log`, and the four queue pages `{faculty,student,program,department}-applications`.
* `mockup/pages/faculty/` (10) — `dashboard`, `students`, `student-detail`, `new-review`, `register-student`, `chat`, `programs`, `departments`, `applications`, `profile`.
* `mockup/pages/auth/` (6) — `signin`, `signup`, `pending-verification`, `terms`, `about`, and `privacy policy.html` (filename contains a space; linked as `privacy%20policy.html`).
* `mockup/pages/design-system.html` — living style guide.
* `mockup/components/navigation/` — `footer-nav.html`, `sidebar-admin.html`, `sidebar-faculty.html`. Sidebars are embedded in portal pages through `<iframe class="sidebar-frame">` (admin passes `?active=<key>`); the footer is fetched into auth pages via `data-include`. The locked structure reserves `components/modals` and `components/tables`, but those folders no longer exist (their unused files were removed).
* `mockup/assets/css/` — `design-system.css` (all tokens), `global.css` (reset/base; imports Google Fonts and `design-system.css`), `components.css` (`.ui-*` primitives and legacy retrofits), `queue-modal.css`, `logout-confirmation.css`, `background/{grid,pixel}.css`, and per-page sheets in `pages/{admin,auth,faculty}/` plus `pages/design-system.css`.
* `mockup/assets/js/` — shared scripts (`card-loading.js`, `queue-modal.js`, `admin-table.js`, `admin-sidebar.js`, `faculty-sidebar.js`, `logout-confirmation.js`) and per-page scripts in `pages/{admin,auth,faculty}/`. Faculty pages load `<page>.js` + `<page>-2.js` (code extracted from former inline scripts; `register-student` also has `-3.js`).
* `mockup/assets/icons/` — `SPMIS.png` only.
* `mockup/tests/` — 8 dependency-free Node scripts (`*.cjs`), each run with `node mockup/tests/<name>.cjs`. There is no `package.json` or test runner for the mockup.

**`app/` — React workspace (`spmis-app`).** Vite + React + TypeScript styleguide/component port. See §4.2.

**`docs/`** — `DESIGN_SYSTEM.md`, `minutes/`, and `change log/CHANGELOG.md` (Keep a Changelog format; active entries go under `[Unreleased]`; the `[Milestone 1]` section is still an unfilled placeholder). The changelog must be updated alongside relevant codebase changes (MoM #6).

> Note: MoM #4's locked tree lists `pages/auth/login.html` and `assets/{css,images,icons}` with only `global.css`. The repo instead has `signin.html`/`signup.html`, adds `about.html` and `privacy policy.html` (neither is in the README sitemap), ships additional stylesheets, and has no `images/` folder. Treat the locked tree as the target and do not add new top-level folders inside `mockup/`.

## 3. Project Management (Rule §13 & MoMs)
* **No Feature Suggestion Issues:** Per MoM #5, feature suggestions are handled verbally in weekly meetings, not via GitHub Issues. GitHub Issues are reserved for actual bugs and approved tasks.
* **Naming Conventions:** "Chat" must be labeled **"AI Chat Assistant"** (implemented in both sidebars and `FacultySidebar.tsx`). "Register Student" is a **pop-up modal**, not a dedicated page (`register-student.html` redirects to `students.html?register=true`).
* **Branching & PRs:** Branch from `dev`; never open PRs directly to `main` (MoM #1). PRs need approval from the PM or designated Leader (MoM #1), and frontend PRs need review from at least one QA member (MoM #6). Developers must not tick their own acceptance criteria (MoM #7). Every PR updates the changelog (MoM #6).
* **Commits:** Conventional Commits (`type(scope): description`) per README §13; the git history follows this, often with an issue suffix such as `(#113)`.

## 4. Current Phase: Milestone 1 (Descriptive Realities)
This section describes the *actual current state* of the repository. Milestone 1 is still `[Unreleased]` in the changelog. There is no backend, API contract, Supabase project, CI workflow, or AI integration in the repo; all data is static fixtures and all network `fetch` calls only load local HTML fragments.

### 4.1 `mockup/` (static HTML)
* **Tech Stack:** Static HTML5, vanilla CSS, and vanilla JavaScript with no build step (per `DESIGN_SYSTEM.md`). Do NOT add React, JSX, Vue, Angular, or bundlers to `mockup/`. Pages work from `file://` or any static server, and are also served by the app's Vite server at `/mockup/*`.
* **Theme:** Pages declare `<html lang="en" class="dark">`; light mode is the `:root` default when `.dark` is removed.
* **Stylesheet order:** Portal pages load `design-system.css` → `global.css` → `components.css` → feature/page sheets (`DESIGN_SYSTEM.md` documents `global.css` before `components.css`); `about`, `terms`, and `privacy policy` currently load `components.css` first.
* **M1 Modals (Current State):** Admin Students/Departments/Programs/Faculty use static `div` overlays (`.modal-overlay` / `.modal-container`). The approval-queue modal is built by `assets/js/queue-modal.js`, synced to `?queue=<faculty|student|program|department>` with `pushState`, and embeds the matching `*-applications.html` page in an iframe (`queue-embedded` mode). Faculty pages use native `<dialog>` (program/department proposals, review edit/delete, register student). Logout uses a `<dialog>` created by `logout-confirmation.js` (`?logout=true`, parent/iframe `postMessage` bridge).
* **Approval Queues:** The four queues are not sidebar items (admin nav: dashboard, students, departments, programs, faculty, audit-log); they open as modals from their parent pages and remain directly addressable.
* **Shared behaviors:** `card-loading.js` (loaded by all 26 Admin/Faculty/Auth routes) applies a 280ms card/text skeleton and exposes `window.spmisNavigationCache` (sessionStorage key `spmis-navigation-cache`) so revisited routes skip skeletons; `admin-table.js` consults the same cache. `components.css` enables View Transitions with `view-transition-name: portal-sidebar`.
* **Component Inventory:** Only the footer and two sidebar HTML fragments are consumed from `mockup/components/`. Dialogs and tables are defined in their pages or built by `queue-modal.js` / `admin-table.js`.

### 4.2 `app/` (React styleguide port)
* **Installed stack:** React 19, React Router 7 (`createBrowserRouter`), TanStack Query 5, TypeScript 5.6 (`strict`, `noEmit`), Vite 6 + `@vitejs/plugin-react`, `clsx` + `tailwind-merge` (`cn()` in `src/lib/utils.ts`). npm with `package-lock.json`.
* **Scripts:** `dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck`. No lint or test scripts and no app tests exist.
* **Routes (`src/main.tsx`):** `/` landing page (`App.tsx`), `/styleguide` (`/design-system` redirects there), and nine `/components/*` classified pages (buttons, badges, forms, cards, tables, navigation, modals, colors-typography, chats-auth). No `/admin/*`, `/faculty/*`, or auth routes are registered yet, although `AppShell` navigates to `/admin/<key>` / `/faculty/<key>` and `queues.ts` defines `QUEUE_ROUTES`.
* **Providers:** `QueryClientProvider` (`staleTime` 5m, `gcTime` 30m, no refetch on mount/focus/reconnect) → `ThemeProvider` (`src/context/ThemeContext.tsx`; default dark; persists `spmis-theme` and `theme` in localStorage; toggles `.dark` and `data-theme` on `<html>`) → `RouterProvider`.
* **Styling:** The app reuses mockup CSS directly. `src/index.css` `@import`s `components.css`, `queue-modal.css`, `logout-confirmation.css`, admin `admin-common.css`/`dashboard.css`, faculty `chat.css`, and `pages/design-system.css`, then re-declares the Claude+ tokens. `StyleguidePage.tsx` imports `design-system.css` and `global.css`. `vite.config.ts` sets `server.fs.allow: ['..']` and a `serve-mockup` plugin that serves `../mockup` at `/mockup/*`.
* **Components:** `components/ui/` (Button/ActionLink, Badge/TagCluster, Card/KpiMetricCard/InteractiveLinkCard, Label, Input/Textarea, Select, Checkbox, Modal, Table, Tabs, EmptyState, RejectionRow, DataTable + pagination, QueueMetricCard, SystemActivityLog, Typography, ShowcaseWidgets, PortalDialogs); `components/navigation/` (AdminSidebar, FacultySidebar, AppShell, FooterNav, LogoutModal); `components/queue-modal/` (QueueModal, QueueModalHost, `useQueueSearchParam`, `queues.ts`); `components/application-queue/ApplicationQueue`. `components/ui/index.ts` re-exports all of them.
* **Modals:** `QueueModal` and `Modal` render through `createPortal` (focus trap, Escape, backdrop close, scroll lock, focus restore). `useQueueSearchParam` binds the queue modal to `?queue=`. `LogoutModal` and `FacultyProposalDialog` use native `<dialog>`.
* **Data:** Static fixtures only (`src/data/queueFixtures.ts`, `src/data/rosterFixtures.ts`, plus chat/student samples in `ShowcaseWidgets.tsx`).
* **Navigation cache:** `src/lib/navigationCache.ts` (`useNavigationData`, `getNavigationQueryOptions`, `isRouteDataCached`) exists but no component uses it yet.

### 4.3 AI & Privacy
Zero real data is permitted in mockups. AI text de-identification uses `{{STUDENT:<uuid>}}`. The Gemini API and `GEMINI_API_KEY` are strictly confined to Supabase Edge Functions. The chat UIs in `mockup/` and `app/` are client-side simulations with no AI provider calls.

## 5. Target Architecture & Design (Post-M1)
This section describes the *target state* that new code should build toward.
* **Target Stack:** React 19 + Vite, TypeScript, React Router, TanStack Query, React Hook Form + Zod, Tailwind + shadcn/ui, Supabase, Vitest/RTL + Playwright (README §3). Already present in `app/`: React 19, Vite, TypeScript, React Router, TanStack Query. Installed but unused: `zod`, `lucide-react`, and `tailwindcss` + `@tailwindcss/vite` (the Vite plugin is not registered and no `@import "tailwindcss"` exists). Not yet present: shadcn/ui, React Hook Form, Supabase, test tooling, ESLint.
* **Target Modals:** Route-backed modals, with no nested modals (e.g., rejection reasons captured inline via row expansion — implemented as `RejectionRow` / `.ui-queue-rejection-row`). *Note: This is a binding design directive mandated by the instructor; it is now reflected in `README.md` §9 (Modals & Dialogs).*
* **API Boundary:** Contract-first via `contract/openapi.yaml` (OpenAPI 3.1). No ad-hoc PostgREST queries that bypass this schema. The contract does not exist yet.
* **Styling Targets:** Claude+ theme. All styling relies on CSS custom properties: OKLCH primitives (`--background`, `--primary`, …) plus semantic `--color-*` tokens in `design-system.css`. No ad-hoc hex colors or inline styles.

## 6. Known Debt & Active Migrations
AI agents must be aware of these existing technical debts and actively migrate them when modifying adjacent code.
* **Legacy Hex & Inline Styles:** Page-level `<style>` blocks have been extracted into `assets/css/pages/**` (only the two sidebar fragments keep one each), and page scripts into `assets/js/pages/**`. Remaining violations: inline `style=""` attributes in `design-system.html`, `signup.html`, `signin.html`, and `admin/students.html`; hard-coded hex in SVG `stroke` attributes across admin pages, auth pages, sidebars, and `faculty/applications.html`; heavy hex literals in CSS (e.g., `components.css`, `admin-common.css`, `queue-modal.css`, and the duplicated token block in `app/src/index.css`); and many inline `style={{…}}` objects in `app/` TSX (e.g., `App.tsx`, `AppShell.tsx`). **New/refactored markup must use `.ui-*` classes and tokens. Existing mockups are legacy and are being migrated incrementally.**
* **Typography:** `DESIGN_SYSTEM.md` specifies **Outfit** for UI text, headings, and tabular numbers (`--font-number: var(--font-sans)`), and standard system monospace for developer code. **Inter** is still loaded by `global.css`, `app/index.html`, `app/src/index.css`, `sidebar-admin.html`, and the admin `audit-log`, `departments`, `faculty`, `programs`, and `students` pages, and remains a fallback in `--font-sans`. Flag any Inter usage as legacy to be migrated. (Commit `65d3bd4` mentions "Intel One Mono for numbers", but no such font is used.)
* **Dual Class System:** Legacy `.btn` / `.card` / `.input-field` classes are no longer defined in `global.css` or used by pages. `components.css` still retrofits page-level and legacy selectors (e.g., `.add-button`, `.nav-btn-active`, `.modal-overlay`) with about 250 `:is()` selectors and over 1,100 `!important` declarations. Sidebar fragments also use Tailwind-style class names (e.g., `min-h-[40px]`, `rounded-2xl`) even though Tailwind is not loaded. Migrate toward the `.ui-*` standard rather than introducing a third pattern.
* **Duplicated Tokens & CSS Coupling:** `app/src/index.css` re-declares the tokens from `mockup/assets/css/design-system.css`, and `app/` imports mockup stylesheets by relative path, so CSS changes in `mockup/` affect the React app.
* **Unreferenced / Broken Assets:** `assets/js/pages/auth/*.js` (5 files) and `assets/js/pages/admin/dashboard.js` are not loaded by any page; the auth pages still run equivalent inline `<script>` blocks. `pending-verification.html` links a non-existent `assets/css/background.css`. `admin-sidebar.js` references an undeclared `targetKey`; its `try/catch` swallows the error.
* **Stale Test:** `mockup/tests/chat-enter.cjs` fails ("Chat handlers must exist") because it looks for handlers inline in `faculty/chat.html`, which now live in `assets/js/pages/faculty/chat.js`. The other seven suites pass.
* **`.gitignore` Coverage:** Now ignores `tatus`, `node_modules/`, `dist/`, `.env*`, `*.tsbuildinfo`, and `.vite/`. Extend it as new tooling (e.g., Supabase, Playwright output) is added.
