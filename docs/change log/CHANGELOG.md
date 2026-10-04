# Changelog

All notable changes to the SPMIS project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
<!-- Active development updates -->

### Added
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

### Changed
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

### Fixed
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

## [Milestone 1] - YYYY-MM-DD
<!-- Milestone release updates -->

### Added
- <!-- New additions -->

### Changed
- <!-- Modifications -->

### Fixed
- <!-- Bug fixes -->