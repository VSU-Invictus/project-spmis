# Changelog

All notable changes to the SPMIS project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
<!-- Active development updates -->

### Added
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