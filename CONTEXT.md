# SPMIS Project Context & AI Rules

## 1. Source of Truth (Hierarchical)
When resolving conflicts, AI agents must evaluate directives in this strict order:
1. **`README.md`** — the master 17-section authoritative specification (domain rules, data model, sitemap, assumptions log). Treat it as the ultimate source of truth for *what the system is*.
2. **Minutes of the Meeting (MoM)** — binding project decisions. Per README §13, the Project Manager holds the tiebreak on contract disputes; MoM decisions govern project process, priorities, and UI/UX direction, and supersede the spec where the two conflict.
3. **`docs/DESIGN_SYSTEM.md`** — the official token, spacing, and typographic standard.
4. **`mockup/pages/design-system.html`** — the living, interactive style guide. Consult it for `.ui-*` primitives before inventing new components.
5. **This `ai-context.md` file.**

## 2. Repo Map & Structural Constraints
Per MoM #4, the `/mockup` folder structure is locked and a strict **one-file-per-route** rule applies (each sitemap route = exactly one HTML file).
* `mockup/pages/{admin,faculty,auth}` — one HTML file per sitemap route.
* `mockup/components/{modals,navigation,tables}` — reusable UI fragments.
* `mockup/assets/{css,js,icons}` — vanilla assets (`global.css`, `components.css`, `faculty-sidebar.js`, icons).
* `mockup/tests/` — test suites.
* `docs/` — documentation, including `docs/change log/CHANGELOG.md`, which must be updated alongside relevant codebase changes.

> Note: MoM #4's locked tree lists `assets/{css,images,icons}` with only `global.css`; the repo currently also ships `components.css` and has no `images/` folder. Treat the locked tree as the target and do not add new top-level folders.

## 3. Project Management (Rule §13 & MoM #5)
* **No Feature Suggestion Issues:** Per MoM #5, feature suggestions are handled verbally in weekly meetings, not via GitHub Issues. GitHub Issues are reserved for actual bugs and approved tasks.
* **Naming Conventions:** "Chat" must be labeled **"AI Chat Assistant"**. "Register Student" is a **pop-up modal**, not a dedicated page.

## 4. Current Phase: Milestone 1 (Descriptive Realities)
This section describes the *actual current state* of the repository.
* **Tech Stack:** Static HTML5 and vanilla CSS. Do NOT generate React components, JSX, Vue, Angular, or use bundlers.
* **M1 Modals (Current State):** Modals in M1 are built as static `div`-based overlays (e.g., `.modal-overlay` / `.modal-container`).
* **Empty Components:** The three reusable modal files (`modal-rejection-reason.html`, `modal-add-edit-entity.html`, `modal-delete-confirm.html`) are currently placeholder files awaiting content.
* **AI & Privacy:** Zero real data is permitted in mockups. AI text de-identification uses `{{STUDENT:<uuid>}}`. The Gemini API and `GEMINI_API_KEY` are strictly confined to Supabase Edge Functions.

## 5. Target Architecture & Design (Post-M1)
This section describes the *target state* that new code should build toward.
* **Target Stack:** React 19 + Vite, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query.
* **Target Modals:** Route-backed modals, with no nested modals (e.g., rejection reasons captured inline via row expansion). *Note: This is a binding design directive mandated by the instructor; it will be formally reflected in `README.md` once the Milestone 1 documentation updates are merged.*
* **API Boundary:** Contract-first via `contract/openapi.yaml` (OpenAPI 3.1). No ad-hoc PostgREST queries that bypass this schema.
* **Styling Targets:** Claude+ theme. All styling relies on CSS custom properties (OKLCH tokens). No ad-hoc hex colors or inline styles.

## 6. Known Debt & Active Migrations
AI agents must be aware of these existing technical debts and actively migrate them when modifying adjacent code.
* **Legacy Hex & Inline Styles:** Existing files (e.g., `faculty-applications.html`, `chat.html`, and `design-system.html`) heavily violate the "no hex" rule with inline `<style>` blocks and attributes. **New/refactored markup must use `.ui-*` classes and tokens. Existing mockups are legacy and are being migrated incrementally.**
* **Typography:** `DESIGN_SYSTEM.md` specifies **Outfit** for UI text and **Geist Mono** for code. However, files like `faculty-applications.html` currently load **Inter**. Flag any Inter usage as legacy to be migrated.
* **Dual Class System:** `global.css` ships legacy classes (`.btn`, `.card`, `.input-field`) alongside semantic aliases, while `components.css` retrofits legacy classes using `:is()` and heavy `!important`. Migrate legacy classes toward the `.ui-*` standard rather than introducing a third pattern.
* **Corrupted `.gitignore`:** The root `.gitignore` currently contains only the string `tatus` (a typo) and therefore ignores nothing. Flag this; do not rely on it to exclude build artifacts.