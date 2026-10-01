# Changelog

All notable changes to the SPMIS project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
<!-- Active development updates -->

### Added
- **UI:** Added zero-blink smooth page transitions across admin portal pages using the View Transitions API (`view-transition-name: portal-sidebar`) and link hover prefetching (`bd915b5`).
- **UI:** Added skeleton shimmer loading animation (`.skeleton-row`, `.skeleton-bar`) and interactive loading simulation across Admin and Faculty data tables (`fba6ebb`).
- **UI:** Added empty-state recovery container (`.empty-state`, `.empty-state-btn`) with one-click filter reset across data tables (`fba6ebb`).
- **UI:** Added live row selection counter ("X of Y row(s) selected") and custom checkbox management to Admin portal tables (`fba6ebb`).
- **Docs:** Synchronized `DESIGN_SYSTEM.md` with living style guide `design-system.html`, adding comprehensive documentation for the 12 UI sections including Table Controls Toolbar, Skeleton Shimmers, Empty States, Docked Sidebar Navigation, Modals/Dialogs, and Workspace Frame (`3fe9e65`).
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

### Changed
- **UI:** Standardized all entity creation actions (`.add-button`) across Admin and Faculty portals (Add Student, Add Faculty, Add Department, Add Program, Register Student, Propose Program) with unified terracotta background (`#D97251`), bold black text (`#000000`), 38px height, and standard SVG plus icon (`96f3c46`, `f55cc9d`, `028c16b`).
- **UI:** Updated Portal Sidebar navigation dark mode palette to exact specifications: `#1F1E1D` sidebar background, `#181716` border, active item with `#D97251` terracotta background and bold black text/icon (`#000000`), and inactive items with `#98938D` text and `rgba(255,255,255,0.05)` hover background (`96f3c46`, `4e5e61b`).
- **UI:** Replaced circular avatar bubbles in data table rows with clean, accessible typography (`<strong>Name</strong>` + `<span class="muted">email</span>`) (`4e5e61b`).
- **UI:** Generalized design system badges and chips into 4 portal-agnostic semantic groups (Operational & Lifecycle, Entity Classification & Origin, Audit Activity & Mutation Events, Domain & Competency Assessment) (`4e5e61b`).
- **UI:** Merged Workspace Frame section in the design system to unify the top header status bar, toast feedback notifications, and pinned viewport footer (`.workspace-footer`) (`4e5e61b`).
- **UI:** Standardized dashboard and table action links with right arrows across Admin and Faculty portals to use `.ui-link-neutral` with smooth 4px animated glide (`96f3c46`, `f55cc9d`, `028c16b`).
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

### Fixed
- **UI:** Fixed text truncation on Department filter dropdowns by expanding width to `195px` so "Department of..." displays fully without clipping ("Departmen...") (`f55cc9d`, `028c16b`).
- **UI:** Fixed page switching blink and flickering in the Admin portal by pre-rendering persistent sidebar markup and integrating client-side prefetching (`bd915b5`, `f55cc9d`).
- **UI:** Fixed `.nav-btn-active` font and icon color overrides in `components.css` to enforce high-contrast black text (`#000000 !important`) (`96f3c46`).
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