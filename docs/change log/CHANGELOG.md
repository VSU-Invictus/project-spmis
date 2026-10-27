# Changelog

All notable changes to the SPMIS project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
<!-- Active development updates -->

### Added
- **Issue #3 detail reads:** Added dedicated getStudentById and getOwnProfile
  read-only PostgREST RPC contracts with object-or-null responses, caller/RLS
  requirements and explicit examples. Removed the shared-read mapping exception;
  all operation IDs explicitly named in Issue #3 are now declared.
- **Issue #3 contract completion:** Added the Redocly lint/theme configuration,
  explicit ReviewTag, internal ReviewEmbedding and ReviewAttachment schemas,
  reusable realistic mock examples, and documented mappings from the issue's
  product-level read names to their curated PostgREST operations.
- **Contract review alignment:** Documented the mockup's 500-word review limit and
  422 word-limit examples, added a proposed active-review tag-suggestion RPC, and
  aligned OpenAPI license metadata with the README's All Rights Reserved terms.
  Program and department proposal names now use the same nonblank, 200-character
  validation as direct admin additions.
- **OpenAPI contract draft:** Added OpenAPI 3.1 operations and shared schemas for
  profiles, student search, managed lists, reviews/history, applications, chat,
  and audit metadata. Added typed application payloads, constrained
  rich-text documents, native PostgREST filters/counts, lifecycle acknowledgements,
  pinned lint/type-generation commands and a generated-type freshness check.
  API proposals, attachment metadata boundaries and admin-access considerations are
  recorded in `docs/contract-decisions.md`; backend/RLS implementation is pending.
- **Navigation Cache & Instant Page Revisits (React Query & Mockup):** Eliminated repetitive skeleton loading states across Admin and Faculty route navigation (#113):
  - Configured `@tanstack/react-query` `QueryClient` cache defaults (`staleTime: 5m`, `gcTime: 30m`, `refetchOnMount: false`, `refetchOnWindowFocus: false`) and added `navigationCache.ts` utilities.
  - Refactored `mockup/assets/js/card-loading.js` with `window.spmisNavigationCache` storing visited routes across session navigation, bypassing skeleton overlays and timers on revisit.
  - Refactored secondary page scripts (`applications-2.js`, `chat-2.js`, `dashboard-2.js`, `departments-2.js`, `new-review-2.js`, `profile-2.js`, `programs-2.js`, `register-student-2.js`, `student-detail-2.js`, `students-2.js`) and primary table loaders (`students.js`, `programs.js`, `departments.js`, `applications.js`) to immediately render views on cached revisits.
  - Extended the shared Admin table controller (`mockup/assets/js/admin-table.js`) to consult `window.spmisNavigationCache` on initial load, so previously visited Admin routes (Dashboard, Students, Departments, Programs, Faculty, Audit Log, and the four application queues) render their tables instantly without replaying skeleton rows or the `table-fade-in` animation. First uncached visits keep the existing 280ms skeleton shimmer, and the existing row-mutation observer still refreshes data after Add/Edit/Remove.
  - Updated `mockup/tests/card-loading.cjs` test suite to verify initial loading behavior on first visit and instant zero-flash rendering on revisits for both Admin and Faculty routes.
  - Extended `mockup/tests/card-loading.cjs` to cover all 10 Admin routes and added cache-integration assertions to `mockup/tests/admin-tables.cjs`.

### Fixed
- **Issue #3 scope:** Removed five additional operations for faculty profile
  creation/removal, student directory/removal and faculty enrollment, together
  with their exclusive schemas, response and filter parameter. Narrowed current
  documentation to the 27 operations required by Issue #3 and removed the
  enrollment-specific department-access proposal from this contract.
- **Contract type optionality:** Aligned type generation and freshness-check
  options so optional rich-text formatting flags and chat history stay optional
  in TypeScript, matching the documented request examples and backend defaults.
- **Pagination error mock:** Added an explicit HTTP 416 response example using
  PostgREST's PGRST103 code instead of inheriting the generic PGRST116 example.
- **Issue #3 review corrections:** Split public attachment metadata from the
  internal Storage entity, marked review body text read-only, added completed
  approval/rejection response examples and explicit admin mutation permissions.
  Aligned operation IDs with the issue and corrected Redocly EOF formatting.
- **Contract permission descriptions:** Documented the separate safe author
  projection needed by the review view without exposing private faculty profiles.
  Backend permission implementation remains pending.
- **UI:** Displayed full Faculty Applications Decision / reason text with wrapping and expanding rows; moved the column left by narrowing the leading columns and reducing its left padding.
- **UI:** Left-aligned the Decision / reason header and cells in the Faculty Applications table, overriding the shared final-column alignment.
- **UI:** Left-aligned the Audit Log Performed By and Target headers and cells, overriding the shared table alignment rules.
- **All mockup pages:** Extended the shared initial-loading controller on all 26 Admin, Faculty, and Auth routes with the Typography text skeleton treatment. Visible headings, paragraphs, captions, and breadcrumb/year labels use font-sized, line-matched skeletons for 280ms alongside card loading. Existing card/table placeholders stay in control of their content; navigation, form controls, dialogs, and live announcements stay available. Original text nodes, spacing, accessibility attributes, and updates made during loading are preserved.
- **Design system typography:** Added a repeatable 280ms skeleton-loading preview for headings, captions, labels, body/muted paragraphs, and monospace text. The right-aligned simulation button matches Cards and Tables. Shared text placeholders follow the rendered line count and font size while preserving spacing, expose accessible loading status, and respect theme and reduced-motion preferences.
- **All mockup pages:** Applied the design-system card skeletons to Admin and Faculty dashboard metrics, content panels, rendered student reviews, forms, chat cards, and Auth/information panels through a shared 280ms initial-loading controller loaded on every application route. Loading retains content dimensions, preserves navigation and existing table skeletons, avoids duplicate nested overlays and dialogs, announces status, respects reduced motion, and restores original accessibility/interaction states.
- **Design system cards:** Added a repeatable skeleton-loading preview for standard, KPI, and interactive cards. The simulation button stays right-aligned with 32px of space before the cards, and shares its width, height, typography, padding, icon spacing, and "Simulate Skeleton Loading (280ms)" label with the table simulation button through `.ui-demo-simulate-button`. Both previews run for 280ms. Shared `.ui-skeleton` placeholders preserve card dimensions, adapt to both themes, respect reduced motion, and temporarily disable unfinished card content with accessible loading announcements.
- **Logout:** Added a shared Admin and Faculty confirmation modal based on the design system dialog and button components, centered horizontally and vertically in the full page viewport. Sidebars request the modal through a validated window-message bridge so the main page owns the dialog and backdrop, including when mockups are opened from disk with isolated iframe origins. Uses `?logout=true`, supports Cancel, Escape, backdrop dismissal, and browser history, prevents stacked dialogs, and replaces browser confirmation fallbacks. Logout clears the faculty demo session and returns to sign-in only after confirmation.
- **Faculty Portal (Students & Proposal Pages):** Addressed QA and pull request review comments:
  - Fixed premature toast notifications on the "Propose Program" and "Propose Department" buttons, ensuring success toasts deliver exclusively after valid application submission in their respective proposal modals.
  - Removed the right arrow from the "Write review" button on the Student Detail page, removed the hover translateY movement for a steady interaction, and fixed the hover state so button text maintains high contrast and does not turn orange on hover.
  - Added horizontal spacing and gap between review tags so they no longer touch each other.
  - Eliminated the orange focus outline on the left, right, and bottom sides of the review description editor box.
  - Tightened vertical spacing between input fields in the Register Student modal to make the form compact and cohesive.
  - Aligned the Edit Review feature with Write Review by connecting the review kebab menu Edit action to `new-review.html` in edit mode, mirroring the exact rich text toolbar, word count counter, file attachments, interactive tag chips, and toast workflow.
  - Standardized Previous/Next pagination buttons to the Outline Action button variant and eliminated hover effects on disabled action buttons with 50% opacity.
  - Re-aligned Register Student modal actions so Cancel (`.ui-btn-outline`) is placed directly beside Submit application (`.ui-btn-primary`) at the bottom right.
  - Enhanced Write a Review page with a section divider separating student info and review text, aligned the "Back to student" link with design system interactive action links, grouped Cancel beside Publish review at the bottom right, and added a success toast notification upon publishing.
  - Upgraded Student Detail page with the primary header "Student Information & Reviews", replaced bottom review action buttons with a three-dot kebab dropdown menu beside the status badge (Edit, Hide, Delete), added rich-text formatting support to the review edit modal, upgraded the delete confirmation dialog to the Design System decision modal architecture with a warning alert and full-width confirm action, and applied generous padding and non-overlapping card spacing.
- **Admin dashboard:** Left-aligned the approval table's Action heading and Review links with matching cell padding.
- **Admin dashboard:** Kept the approval queue and activity log as separate card surfaces by renaming their grid wrapper so the shared panel selector cannot color the gap between them.
- **Admin dashboard:** Renamed the four-card section to "Pending Action Items" and rebuilt the dashboard layout with local token-based CSS so the pending approval table remains visible inside the fixed viewport. The four table review links now open their route-backed queues.
- **Admin queues:** Kept inline rejection forms visible through table pagination refreshes in all four application queues. Bulk rejection expands below the last visible table row, while individual rejection stays beside its row. Header selection now applies only to visible, eligible rows; selection resets when the view changes, completed faculty applications and admin-direct students cannot be decided again, and approved or rejected mockup applications leave the queue. Oldest/Newest now sorts by submission date, and queue close handling no longer captures unrelated dialogs.
- **Admin Departments/Programs/Faculty:** Made success toasts consistent for Add, Edit, and Remove. The three pages now clear the previous toast timer before showing a new one (matching the approval/rejection pattern in `queue-modal.js`) and use the same 3000ms duration, so a stale timer can no longer hide a newer notification. Toasts still fire only after the operation completes (including the Add/Edit confirmation step) and never on cancel.
- **Admin Departments/Programs/Faculty:** Blocked unchanged Edit submissions. Each Edit modal now retains the original record values when it opens and compares the trimmed form values before updating. Submitting an identical value (including whitespace-only edits) is prevented and shows the established inline validation message ("Please enter a new, distinct name before updating.") via `setCustomValidity()`/`reportValidity()`, matching the Faculty Portal "Apply to edit program" behavior. The original value is refreshed for every newly selected record and cleared when switching to Add mode, so Add operations, Remove/Delete confirmation, modal headings, field labels, and the "Update" action remain unchanged.

### Removed
- **Admin student queue:** Removed the Registration Source column, source filter, and admin-direct sample entries because only faculty applications require approval; admin student management uses direct CRUD. Adjusted table width and pagination for the 12 remaining faculty applications (`7d6d71d`).
- **Auth:** Reverted the added dashboard preview links and account-chooser redesign, restoring the existing Admin Portal and Faculty Portal routing in the mockup.
- **Cleanup:** Removed seven unreferenced HTML files from `mockup/components/`: `modal-add-edit-entity.html`, `modal-approval-confirm.html`, `modal-approval-queue.html`, `modal-delete-confirm.html`, `modal-rejection-reason.html`, `table-approval-queue.html`, and `table-management-roster.html`. Four were empty placeholders; three were unused modal fragments. The active footer, both sidebars, and page/script-defined modals and tables remain available.

### Added
- **Admin Students:** Added "Confirm Addition" and "Confirm Update" notices to the Add Student and Edit Student forms, matching the shared information alert styling used by Departments, Programs, and Faculty. Each form shows the notice for its current action.
- **UI:** Added record-specific, accessible empty states to admin approval queues, management tables, the dashboard approval table, and faculty Students, Applications, Programs, and Departments tables. Empty collections and filtered zero-result views now show distinct messages.
- **UI:** Added Action Confirmation Alert blocks (`.ui-alert`, `.ui-alert--warning`, `.ui-alert--info`) to Portal Modals to safeguard users from accidental approvals or rejections, providing clear context before state mutations.
- **UI:** Added confirmation Accept Modal (`#acceptModal`) across Admin applications tables (`faculty-applications.html`, `student-applications.html`, `department-applications.html`, `program-applications.html`) with applicant summary breakdown to prevent accidental single-click approvals.
- **UI:** Added zero-blink smooth page transitions across admin portal pages using the View Transitions API (`view-transition-name: portal-sidebar`) and link hover prefetching (`bd915b5`).
- **UI:** Added skeleton shimmer loading animation (`.skeleton-row`, `.skeleton-bar`) and interactive loading simulation across Admin and Faculty data tables (`fba6ebb`).
- **UI:** Added empty-state recovery container (`.empty-state`, `.empty-state-btn`) with one-click filter reset across data tables (`fba6ebb`).
- **UI:** Added live row selection counter ("X of Y row(s) selected") and custom checkbox management to Admin portal tables (`fba6ebb`).
- **Docs:** Synchronized `DESIGN_SYSTEM.md` with living style guide `design-system.html`, adding comprehensive documentation for the 12 UI sections including Table Controls Toolbar, Skeleton Shimmers, Empty States, Docked Sidebar Navigation, Modals/Dialogs, and Workspace Frame (`3fe9e65`).
- **UI:** Converted the Register Student page into an accessible route-backed modal overlay on the Students roster.
- **UI:** Implemented Gmail/Outlook-style live visual formatting in the review editor with toolbar icons (bold, italic, bullet list, numbered list).
- **UI:** Added toolbar paperclip attachment trigger with removable file chips and batch clear support in reviews.
- **UI:** Implemented autocomplete suggestions and removable chips for review tags.
- **UI:** Added live word and character counters to the review editor.
- **UI:** Added route-backed approval queue modals for student, faculty, program, and department proposals with deep-link support (`1aa9cf7`).
- **UI:** Added inline row rejection and bulk rejection flows with accessible close, Escape, and confirmation behavior (`2bf5185`, `07d6cf5`).
- **UI:** Added Shadcn-style "Rows per page" dropdown pill to table pagination.
- **UI:** Added client-side static JavaScript pagination engine to `design-system.html` for interactive mockups.
- **UI:** Row click selection for data tables (`242e95c`).
- **UI:** Custom Shadcn-style checkboxes with indeterminate states (`fc2408e`).
- **UI:** Enter-to-send and Shift+Enter logic in chat inputs (`fc2408e`).
- **UI:** Dual-image logo toggle for robust dark/light mode switching (`b71a1a1`).
- **UI:** Fully adaptive light mode styling to brand card (`953b810`).
- **UI:** Sign-in UI layout and animated background migrated into design system (`c7c60ac`).
- **UI:** Redesigned sign-in experience (`3fa8ee2`).
- **Docs:** Comprehensive badge and tag references added to design system docs (`55b4d3c`).
- **Docs:** Missing review attachments specification added to README (`420709a`).
- **Docs:** Project context and AI rule configuration (`99ca7f1`).
- **Docs:** Workspace footer documentation added to design system (`0d6f3cf`).
- **UI:** Added Terms & Conditions acceptance step to the sign-up flow, requiring explicit agreement before account creation (`d95578d`).
- **UI:** Added "see/unsee" password visibility toggle on password and confirm-password inputs in the sign-up form (`d95578d`).
- **UI:** Added Tag Cluster & Overflow component (`.ui-tags-cluster`, `.ui-tags-more`, `.ui-tags-popover`) limiting visible badges to 2 with an interactive `+N` badge that reveals remaining tags on hover or click.

### Changed
- **Admin Departments/Programs/Faculty:** Removed the extra Add/Edit confirmation step per Team Lead clarification. Submitting a valid Add or Edit form now executes the operation immediately (no second dialog). The shared `admin-entity-confirm.js` module, the `#entityConfirmModal` markup and its script tag on all three pages, and the `.confirm-modal`/`.confirm-record` CSS were removed. Form validation, modal layouts/headings/button labels, and success toasts (shown only after a successful operation) are unchanged. The Remove/Delete confirmation modals remain fully intact and still require explicit confirmation.
- **Admin Departments/Programs/Faculty:** Renamed the Edit modal primary action button from "Confirm" to "Update" on all three pages. The label is set by the current operation in the shared modal logic, so Add still shows "Add Department"/"Add Program"/"Add Faculty" and Edit shows "Update"; switching between Add and Edit always displays the correct label.
- **Admin Departments/Programs/Faculty:** Updated the Remove modals to match the design system. Removed the top-right X button and restored a secondary "Cancel" button beside the primary "Confirm" button in a standard `.modal-actions` row (reusing `.ui-btn-outline`/`.modal-btn-cancel` and `.ui-btn-primary`/`.modal-submit`). Cancel dismisses the modal without removing the record; Confirm still performs the removal. The warning alert, icon, irreversible-action message, heading, and Outfit typography are unchanged. The obsolete `.remove-modal .modal-close` and full-width `.modal-submit` CSS rules were removed.
- **Admin Departments/Programs/Faculty:** Moved the confirmation notice from the removed "Confirm Edit" step into the existing Edit modal. Each Edit modal now shows an inline `.ui-alert ui-alert--info` notice ("Confirm Update") with the established icon, colors, typography, and spacing, informing the admin they are about to update the record (no irreversible-action warning). The notice is hidden by default and toggled by the current operation, so it appears only in Edit mode and never affects the Add modal's labels, fields, or behavior. The single-modal workflow, editable Name field, "Cancel"/"Update" buttons, unchanged/whitespace-only validation, and success toasts are preserved; Remove modals still require explicit confirmation.
- **Admin Departments/Programs/Faculty:** Refined the Edit modal confirmation notice to match the original "Confirm Edit" design (commit `bea6405b`). The notice was moved inside the `.modal-form` so it inherits the same 20px horizontal padding as the modal header and fields, aligning it with the rest of the modal instead of rendering full-bleed against the card edge. It now uses the form's natural 14px gap for spacing, so it reads as an integrated part of the modal rather than a separate oversized component. The `.ui-alert--info` container, circle-info icon, colors, and Outfit typography are unchanged, and no functional behavior was altered.
- **Admin Departments/Programs/Faculty:** Added the same confirmation notice to the Add modals. Each Add modal now shows an inline `.ui-alert ui-alert--info` notice ("Confirm Addition" / "You are about to add this … record. Review the details below before proceeding.") reusing the exact Edit notice component, colors, icon, typography, border, and spacing, positioned above the form fields. The notice is informational only — clicking the primary Add button still submits a valid form immediately with no extra dialog. Both notices are toggled by the current operation, so Add shows "Confirm Addition" and Edit shows "Confirm Update" with no incorrect messages when switching between modes. Modal headings, primary button labels, validation, success toasts, and cancellation are unchanged.
- **Admin students:** Renamed the add modal title from "Create Student" to "Add Student" (`79cbb2f`).
- **Admin students:** Aligned the student modal with the Faculty Register Student form by placing First Name and Last Name together and Middle Name below. The submit button now reads "Add Student" when adding and "Update Student" when editing (`9a7e39a`).
- **UI:** Standardized Portal Modals across `components.css`, `design-system.html`, and Admin application pages (`faculty-applications.html`, `student-applications.html`, `department-applications.html`, `program-applications.html`) to strictly follow the **Standard Card** container specification (`background: var(--card)`, `border: 1px solid var(--border)` with 16px radius and dark shadow), eliminating light `#444746` backgrounds and outer terracotta borders (`2c7ab3f`, `f52e935`).
- **UI:** Standardized modal form inputs, dropdowns, and textareas to use standard form controls with a thin lighter-shade border (`border: 1px solid var(--input)`), muted background (`var(--muted)`), and 10px radius (`2c7ab3f`, `f52e935`).
- **UI:** Upgraded the "Reason for rejection" field to support vertical manual resizing and dynamic auto-expansion on input, and enforced it as a mandatory field with required indicators (`*`) and client-side validation before confirmation (`2c7ab3f`, `f52e935`).
- **UI:** Updated modal "Confirm Rejection" submit buttons to use the primary terracotta CTA color (`background: var(--primary, #D97251)`, `#000000` text, bold font-weight) (`2c7ab3f`, `f52e935`).
- **UI:** Standardized all entity creation actions (`.add-button`) across Admin and Faculty portals (Add Student, Add Faculty, Add Department, Add Program, Register Student, Propose Program) with unified terracotta background (`#D97251`), bold black text (`#000000`), 38px height, and standard SVG plus icon (`96f3c46`, `f55cc9d`, `028c16b`).
- **UI:** Updated Portal Sidebar navigation dark mode palette to exact specifications: `#1F1E1D` sidebar background, `#181716` border, active item with `#D97251` terracotta background and bold black text/icon (`#000000`), and inactive items with `#98938D` text and `rgba(255,255,255,0.05)` hover background (`96f3c46`, `4e5e61b`).
- **UI:** Replaced circular avatar bubbles in data table rows with clean, accessible typography (`<strong>Name</strong>` + `<span class="muted">email</span>`) (`4e5e61b`).
- **UI:** Generalized design system badges and chips into 4 portal-agnostic semantic groups (Operational & Lifecycle, Entity Classification & Origin, Audit Activity & Mutation Events, Domain & Competency Assessment) (`4e5e61b`).
- **UI:** Merged Workspace Frame section in the design system to unify the top header status bar, toast feedback notifications, and pinned viewport footer (`.workspace-footer`) (`4e5e61b`).
- **UI:** Standardized dashboard and table action links with right arrows across Admin and Faculty portals to use `.ui-link-neutral` with smooth 4px animated glide (`96f3c46`, `f55cc9d`, `028c16b`).
- **UI:** Enforced strictly comma-separated inputs for review tags.
- **UI:** Replaced the markdown Write/Preview tabbed interface with inline live visual formatting.
- **UI:** Routed standalone register student links directly into the student table modal overlay.
- **UI:** Unified all four admin proposal tables with the design-system table layout, spacing, typography, action buttons, status chips, checked-row state, and responsive widths (`2e07cc7`).
- **UI** Aligned header and row widths across all four tables, centered Faculty Role/Status and Program/Department Request Type, and added matching right alignment and padding for Faculty Registered Date (`612f426`). Tightened the Proposed By column spacing in Program and Department proposals (`3f5dc97`).
- **UI:** Applied design-system chip styling to proposal registration, request-type, role, and status badges (`a36c2e7`).
- **UI:** Standardized approval and rejection controls, including side-by-side row actions and selection-aware bulk actions (`2bf5185`).
- **UI:** Aligned dashboard pending-queue counts with the proposal rows shown in each queue (`2e07cc7`).
- **UI:** Standardized data table pagination limits to 5, 10, and 20, defaulting to 5 rows per page globally.
- **UI:** Streamlined the Design System tables showcase by removing redundant Program and Department mockups.
- **UI:** Standardized interactive cards and extracted global arrow animations (`70da99c`).
- **UI:** Refactored faculty dashboard Quick Links to use standard `.ui-card-interactive` components (`70da99c`).
- **UI:** Optimized internal card spacing and layout gaps for a tighter dashboard UI (`70da99c`).
- **UI:** Introduced `.ui-link-neutral` utility class for text links transitioning to primary color on hover (`70da99c`).
- **UI:** Overhauled chat interface for exact mockup parity and dynamic resizing (`e09f61d`, `66ac09c`).
- **UI:** Refined user chat message styling using adaptive color-mix() blending (`c9a39a0`).
- **UI:** Aligned design system pagination with faculty implementation pill layout (`0292ad3`).
- **UI:** Upgraded hardcoded tags to dynamic design system badges globally (`f2f6d2c`).
- **UI:** Implemented design system chat interface and dynamic message generation (`85df957`).
- **Docs:** Renamed project context file to `ai-context.md` (`1460e62`).
- **Docs:** Updated action item assignees in minutes of meeting 05 (`6082a87`).
- **Docs:** Updated project team table with designated UI/UX roles in README (`9d232d9`).
- **Docs:** Incorporated feedback, amendments A & B, and PM rule into README (`7686481`).
- **UI:** Merged `dev` into `mockup-public/auth-signin`, reconciling sign-in and sign-up page changes and removing the unused `SPMIS_LM.png` icon (`0e0658a`).
- **UI:** Replaced the sign-in form T&C checkbox with an inline legal notice ("By signing in, you agree to our Terms of Service") linking to the full terms (`f8e83f4`).
- **UI:** Enhanced sign-up Terms & Conditions step with scroll-to-bottom detection, keeping the acceptance checkbox disabled until the user scrolls completely through the terms content (`f8e83f4`).
- **UI:** Removed the terracotta orange border (`#D97251`) on the top and left viewport edges across all pages (`body` in `global.css` and `.app-canvas` in Admin pages), establishing a clean borderless full-screen layout (`2c7ab3f`, `f52e935`).
- **UI:** Removed orange borders in the Living Style Guide (`design-system.html`), eliminating terracotta borders on the modal preview, the sidebar user profile divider, and setting explicit borderless styling on `body` (`2c7ab3f`).
- **UI:** Updated "View all applications →" on the Faculty dashboard to render in white/foreground by default and hover to terracotta orange (`#D97251`) with smooth rightward arrow translation, matching the Admin portal action affordance (`37defc8`).
- **UI:** Upgraded Faculty portal Students roster table (`mockup/pages/faculty/students.html`) to display at most 2 review tags per student row with an accessible, keyboard-friendly `+N` popover counter to eliminate column crowding (`37defc8`, `2c7ab3f`).
- **UI:** Updated the logout confirmation dialog across Admin and Faculty portals and the Living Design System (`admin-sidebar.js`, `faculty-sidebar.js`, `design-system.html`, `DESIGN_SYSTEM.md`) to use the outline action button (`.ui-btn ui-btn-outline`) for the "Cancel" action instead of the secondary button style (`f52e935`, `2c7ab3f`).
- **Docs:** Documented the Tag Cluster & Overflow Counter pattern and uniform tag borders in `docs/DESIGN_SYSTEM.md` and `mockup/pages/design-system.html` (`2c7ab3f`).

### Fixed
- **A11y:** Named 61 previously unlabeled controls across admin and faculty pages, the living style guide, and the generated queue rejection panel. Added descriptive search/filter/chat names, application-specific checkbox names, and a valid label association for the editable review field and rejection textareas.
- **UI:** Restored the interactive hover effect on Faculty Chat prompt cards (`mockup/pages/faculty/chat.html`, `mockup/pages/design-system.html`, and `mockup/assets/css/components.css`) with terracotta orange border (`#D97251`), subtle warm background tint, `-2px` vertical lift, and soft elevation shadow; clicking any card (or pressing Enter/Space) automatically sends the prompt into the conversation and triggers automated AI evaluation synthesis. Fixed an uncaught TypeError on non-existent `#retry` that previously blocked script execution and event registration (`c439f2b`, `2c7ab3f`).
- **UI:** Excluded `#chat-form` from generic form submission success toasts to prevent toast clutter on chat messages (`c439f2b`).
- **UI:** Updated the "View Full Profile →" button (`.view-profile-btn` / `.ui-chat-context-card .ui-btn-outline`) across `chat.html`, `design-system.html`, and `components.css` to transition its text, border, and trailing animated arrow (`&rarr;`) to terracotta orange (`var(--primary, #D97251)`) on hover (`c439f2b`, `2c7ab3f`).
- **UI:** Removed redundant "Track your proposals" secondary links from Faculty portal Programs and Departments pages (`mockup/pages/faculty/programs.html`, `mockup/pages/faculty/departments.html`) to declutter the interface and rely on standard sidebar navigation (`37defc8`).
- **UI:** Restored missing footer on Admin Faculty Applications page (`mockup/pages/admin/faculty-applications.html`) by removing a stray closing `</div>` tag that prematurely ended `<main class="section-container">`, keeping `.admin-footer` neatly docked at the bottom of the viewport (`f52e935`).
- **UI:** Standardized Admin Dashboard layout (`mockup/pages/admin/dashboard.html`) to use `.app-canvas`, `#sidebar-menu.sidebar.sidebar-frame`, `<main class="section-container">`, standard `.admin-top-header`, and pinned `.admin-footer`, verifying all 10 admin portal pages have consistent top headers and bottom footers (`f52e935`).
- **UI:** Changed the sidebar horizontal divider line (`.sidebar-divider`) above the user account card from orange (`rgba(217, 114, 81, 0.35)`) to `#42423F` in `mockup/assets/css/components.css`, matching the exact color tone of the top header and bottom footer borders (`f52e935`, `2c7ab3f`).
- **UI:** Fixed broken SVG icon for Faculty Applications in `mockup/assets/js/admin-sidebar.js` and across all admin static HTML files by repairing the missing clipboard arc and line path (`H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2`), and polished the Student Applications inbox flap polyline (`f52e935`).
- **UI:** Eliminated button jumping and vertical shifting during navigation by locking all sidebar navigation buttons (both active and inactive) to an identical `min-h-[40px] h-[40px] px-3.5 rounded-2xl` height across CSS and markup (`f52e935`, `2c7ab3f`).
- **UI:** Standardized page controls vertical alignment across all admin pages by removing custom `padding: 14px 0 0;` on `student-applications.html`, enforcing global 52px height for `.controls-container`, 60px height for `.heading-wrapper`, and 38px height for `.add-button` (`.btn-add`) in `components.css` (`f52e935`, `2c7ab3f`).
- **UI:** Standardized contextual breadcrumb text in the top header bar across all admin pages (`Overview`, `Faculty Proposals`, `Student Proposals`, `Program Proposals`, `Department Proposals`, `Student Roster`, `Departments`, `Programs`, `Faculty`, `Audit Log`) (`f52e935`).
- **UI:** Enhanced table checkbox behavior across Admin portal tables (`admin-table.js`, `faculty-applications.html`, `student-applications.html`, `department-applications.html`, `program-applications.html`): clicking any table row triggers and toggles its own checkbox; when some (not all) rows are selected, the top "select all" checkbox retains its white checkmark without turning terracotta orange, and turns solid terracotta orange with a white checkmark only when all visible rows are selected (`f52e935`, `2c7ab3f`).
- **UI:** Enforced global uniform typography across all components in `global.css` and `components.css`, guaranteeing `var(--font-sans, 'Outfit', sans-serif)` applies uniformly across modals, alert messages, confirmation dialogs, toast notifications, form controls, and data tables (`2c7ab3f`).
- **UI:** Unified all badge and tag borders in `mockup/assets/css/components.css`, applying explicit 1px tinted borders to `.ui-badge--amber`, `.ui-badge--rose`, and `.ui-badge--neutral` to ensure uniform border consistency across all Domain & Competency Assessment tags (`2c7ab3f`).
- **UI:** Fixed broken data tables on mobile viewports (<768px) across Admin and Faculty portals by ensuring wrapper containers scroll horizontally (`overflow-x: auto !important`, `-webkit-overflow-scrolling: touch`) and data tables maintain a stable `min-width: 680px` (`2c7ab3f`).
- **UI:** Removed breaking `min-width: 880px` constraint on `.app-canvas` in Admin portal pages (`audit-log.html`, `departments.html`, `faculty.html`, `programs.html`, `students.html`), allowing layouts to adapt cleanly to mobile viewports (`f52e935`).
- **UI:** Fixed text truncation on Department filter dropdowns by expanding width to `195px` so "Department of..." displays fully without clipping ("Departmen...") (`f55cc9d`, `028c16b`).
- **UI:** Fixed page switching blink and flickering in the Admin portal by pre-rendering persistent sidebar markup and integrating client-side prefetching (`bd915b5`, `f55cc9d`).
- **UI:** Fixed `.nav-btn-active` font and icon color overrides in `components.css` to enforce high-contrast black text (`#000000 !important`) (`96f3c46`).
- **UI:** Fixed review editor placeholder text persisting over newly inserted bulleted or numbered list items.
- **Bug:** Fixed inline rejection panels so they span the full queue table, remain unique, close correctly, and clear when the queue modal closes (`b342595`, `2e07cc7`).
- **Bug:** Fixed proposal search, row selection highlighting, duplicate rejection panels, and horizontal table overflow (`2e07cc7`).
- **Bug:** Fixed queue table alignment and missing faculty status cells across the four proposal views (`2e07cc7`).
- **UI:** Fixed table pagination chevron vertical alignment by enforcing `min-width: 4rem` and restoring flexbox positioning.
- **Bug:** Resolved severe Javascript `SyntaxError` in the Faculty portal rendering engine caused by string literal newlines, restoring all tables.
- **UI:** Removed outdated quick action buttons from the Faculty Applications page.
- **UI:** Reverted experimental fixed-height constraints on chat containers to restore natural dynamic scaling (`242e95c`).
- **UI:** Fixed aggressive CSS wildcard overrides causing dark backgrounds and overlapping borders on dashboard panels (`70da99c`).
- **UI:** Fixed chat message text wrapping and reduced internal padding (`fc2408e`).
- **UI:** Resolved chat light mode styling overrides (`b71a1a1`).
- **UI:** Wrapped all remaining sections in the styleguide container to prevent full-screen spill (`b7daf54`).
- **UI:** Enforced light mode color overrides on nested auth elements (`847465b`).
- **UI:** Resolved encoding artifacts and ensured dark background fallback for auth card (`22cd0c3`).
- **UI:** Enabled native scrolling on main container to prevent footer overlap and hide visual scrollbars (`4c1d697`).
- **UI:** Resolved character encoding corruption in style guide footer, copyright symbols, and arrows (`715459d`, `da3d3f5`).
- **UI:** Corrected corrupted characters in password placeholder (`b61f807`).
- **UI:** Corrected javascript syntax error in generate function (`a0ca4b3`).
- **UI:** Removed hardcoded legacy orange borders and corrected component focus states (`9fbc3c9`, `567aa26`).
- **UI:** Removed stray text beside the closing `</html>` tag in the sign-up page markup (`f84144f`).

## [Milestone 1] - YYYY-MM-DD
<!-- Milestone release updates -->

### Added
- <!-- New additions -->

### Changed
- <!-- Modifications -->

### Fixed
- <!-- Bug fixes -->
