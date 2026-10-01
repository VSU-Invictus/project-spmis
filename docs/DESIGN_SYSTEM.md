# SPMIS Design System

SPMIS uses the **Claude+** theme from tweakcn as its shared visual foundation. The system is implemented as raw CSS so every HTML page can consume the same tokens and primitives without any build step, bundler, or external framework.

Theme source: [Claude+ registry item](https://tweakcn.com/themes/cmdght103000n04lh3e2ae93r)  
Living style guide: [`mockup/pages/design-system.html`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/pages/design-system.html)  
Component Stylesheet: [`mockup/assets/css/components.css`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/assets/css/components.css)  
Global Stylesheet: [`mockup/assets/css/global.css`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/assets/css/global.css)

---

## Core Principles

- **Calm and legible:** Warm neutrals keep dense academic workflows easy to scan without visual fatigue.
- **Terracotta for action:** Reserve `--primary` (`#D97251`) for the main action, active navigation, and meaningful emphasis.
- **Surfaces create hierarchy:** Use `--background`, `--card`, `--muted`, and `--sidebar` instead of inventing page-specific colors.
- **Tokens before literals:** Use a custom property for color, spacing, radius, typography, and shadow decisions.
- **Accessible interaction:** Preserve visible focus rings, sufficient contrast, semantic HTML, keyboard trapping, and reduced-motion behavior.
- **Dual theme agility:** Support both **Light Mode** (warm paper canvas) and **Dark Mode** (charcoal canvas) seamlessly via CSS custom properties.
- **Consistent density:** Use the spacing scale and shared component classes for repeated UI patterns.
- **Blink-free navigation:** Persistent layout elements (like docked sidebars) leverage the View Transitions API and hover prefetching for zero-flicker transitions.

---

## Dashboard Visual Guide

Use the supplied reference as the default direction for admin and faculty dashboards.

### Composition & Full-Screen Architecture

- **Unified Full-Screen Viewport:** Both Admin and Faculty portals share the same full-screen layout (`100vw` × `100vh`).
- **Terracotta Orange Outer Border:** Outer containers (`.app`, `.app-canvas`, `.dashboard-container`) are bordered with a 1px solid terracotta orange border (`border: 1px solid #D97251; box-sizing: border-box;`), giving both portals the exact same unified framing.
- **Zero Outer Scroll Policy:** Neither portal has an outer page, body, or window scrollbar (`overflow: hidden` on `body`, `.app`, and `main`). The layout fits completely within the screen (`100vh`), and any data-dense tables or logs scroll internally inside `.table-wrap`, `.ui-table-wrap`, or specific list containers.
- **Docked Sidebar:** Fixed non-collapsible left navigation (`260px`, full `100%` height) with persistent navigation and user account actions.
- **Fluid Main Content Workspace:** `main` fills the remaining width (`flex: 1; min-width: 0; height: 100%; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 24px;`), allowing metrics, tables, and panels to span comfortably.
- **Content Alignment:** Keep content aligned to a consistent page gutter with `10px` to `16px` gaps between cards.
- **Mobile Responsiveness:** At `≤ 700px`, the sidebar collapses to a top bar or drawer, while the main workspace adapts to a single-column layout.

### Metric Cards Standard (Faculty & Admin)

- **Flat, Stationary Design (No Hover Lift):** Cards remain stationary without `transform: translateY(-2px)` or shadow lifts (`.card-hover` disabled/removed).
- **Faculty 4-Card Summary:** 4 cards across in `.stats` using a clean 3-tier vertical stack:
  1. Top label: `<span class="muted">Label</span>` (e.g., `Students`, `Your reviews`, `Pending applications`, `Programs`).
  2. Large numerical value: `<strong id="...">Value</strong>` (`28px` font-weight 600, mono font).
  3. Description subtitle: `<small>Context description</small>` (muted text).
- **Side-by-Side Dashboard Panels:** `Quick links` and `Your pending applications` sit side-by-side in a 2-column `.dashboard-panels` grid, keeping vertical height compact and eliminating page scrollbars.
- **Admin Metric Cards:** Compact 96px cards with 12px-14px padding, uppercase tracking label, large bold metric value, and status pill badge. Flat and stationary without hover lift.

---

## Light Mode & Dark Mode System

SPMIS implements a dual-theme architecture based on the Claude+ theme from tweakcn. All tokens are expressed in `oklch()` color space for perceptually uniform gradients and high-contrast accessibility.

### Theme Strategy

- **Default State:** Standalone admin, faculty, and auth portals declare `<html lang="en" class="dark">` to render the default dark workspace.
- **Light Mode State:** When the `dark` class is removed from `<html>`, `:root` tokens take effect immediately, transforming all containers, borders, and text into the warm paper Claude+ light theme.
- **Theme Switcher Pattern:** An interactive toggle can switch themes on the fly:
  ```javascript
  document.documentElement.classList.toggle('dark');
  ```

### Color Token Reference Table

| Role / Property | Light Mode Token (`:root`) | Dark Mode Token (`.dark`) | Semantic Role |
| --- | --- | --- | --- |
| `--background` | `oklch(0.9818 0.0054 95.0986)` (~#FAF9F5) | `oklch(0.2679 0.0036 106.6427)` (~#232220) | App canvas & main workspace |
| `--foreground` | `oklch(0.3438 0.0269 95.7226)` (~#3A3935) | `oklch(0.9576 0.0027 106.4494)` (~#FAF9F5) | Primary headings & high-contrast text |
| `--card` | `oklch(0.9665 0.0067 97.3521)` (~#F3F1EB) | `oklch(0.2928 0.0018 106.5092)` (~#2B2A27) | Card, modal & table panel surface |
| `--card-foreground` | `oklch(0.1908 0.0020 106.5859)` (~#141413) | `oklch(0.9818 0.0054 95.0986)` (~#FAF9F5) | Card body text & titles |
| `--primary` | `oklch(0.6171 0.1375 39.0427)` (~#D97251) | `oklch(0.6724 0.1308 38.7559)` (~#D97251) | Terracotta primary CTA & active nav |
| `--primary-foreground` | `oklch(0.1908 0.0020 106.5859)` (#000000) | `oklch(0.1908 0.0020 106.5859)` (#000000) | Bold black text on primary buttons & active nav |
| `--secondary` | `oklch(0.9245 0.0138 92.9892)` (~#E5E2DA) | `oklch(0.2213 0.0038 106.7070)` (~#383734) | Secondary buttons & quiet actions |
| `--secondary-foreground` | `oklch(0.4334 0.0177 98.6048)` (~#4A4843) | `oklch(0.9818 0.0054 95.0986)` (~#FAF9F5) | Text on secondary controls |
| `--muted` | `oklch(0.9341 0.0153 90.2390)` (~#E9E6DF) | `oklch(0.2213 0.0038 106.7070)` (~#21201E) | Table headers, inputs & recessed wells |
| `--muted-foreground` | `oklch(0.5341 0.0078 97.4503)` (~#7E7A72) | `oklch(0.7713 0.0169 99.0657)` (~#A0988E) | Captions, subtitles & helper text |
| `--accent` | `oklch(0.9245 0.0138 92.9892)` (~#E5E2DA) | `oklch(0.2130 0.0078 95.4245)` (~#33322E) | Hover & active row highlights |
| `--accent-foreground` | `oklch(0.2671 0.0196 98.9390)` (~#262523) | `oklch(0.9663 0.0080 98.8792)` (~#FAF9F5) | Text on hovered items |
| `--destructive` | `oklch(0.1908 0.0020 106.5859)` (~#DC2626) | `oklch(0.6368 0.2078 25.3313)` (~#DC2626) | Delete actions & critical alerts |
| `--destructive-foreground` | `oklch(1.0000 0 0)` (#FFFFFF) | `oklch(1.0000 0 0)` (#FFFFFF) | Text on destructive buttons |
| `--border` | `oklch(0.8847 0.0069 97.3627)` (~#DFDCD5) | `oklch(0.3618 0.0101 106.8928)` (~#43362B) | Card outlines, table lines & dividers |
| `--input` | `oklch(0.7621 0.0156 98.3528)` (~#C2BEB5) | `oklch(0.4336 0.0113 100.2195)` (~#4F4E4A) | Form field outlines |
| `--ring` | `oklch(0.6171 0.1375 39.0427)` (~#D97251) | `oklch(0.6724 0.1308 38.7559)` (~#D97251) | Keyboard focus indicator |
| `--sidebar` | `oklch(0.9663 0.0080 98.8792)` (~#F3F0EA) | `oklch(0.2357 0.0024 67.7077)` (~#1F1E1D) | Fixed sidebar background (RGB: 31, 30, 29) |
| `--sidebar-foreground` | `oklch(0.3590 0.0051 106.6524)` (~#3E3C38) | `oklch(0.8074 0.0142 93.0137)` (~#98938D) | Inactive sidebar nav text & icons |
| `--sidebar-border` | `oklch(0.9401 0 0)` (~#E8E5DF) | `oklch(0.3618 0.0101 106.8928)` (~#181716) | Vertical sidebar separator |

### Dynamic Surface Aliases

To maintain backward compatibility with legacy markup while enabling full theme responsiveness, `global.css` defines these semantic aliases that resolve automatically in both Light and Dark modes:

```css
--ui-surface: var(--card);
--ui-surface-muted: var(--muted);
--ui-surface-text: var(--foreground);
--ui-surface-muted-text: var(--muted-foreground);
--ui-surface-border: var(--border);
```

---

## Typography, Spacing, and Radius

### Typography Tokens

- `--font-sans`: `Outfit, sans-serif` for interface text, headings, and controls.
- `--font-mono`: `Geist Mono, monospace` for IDs, codes, numerical metrics, and audit timestamps.
- `--tracking-normal`: Default letter spacing (`0em`).

### Spacing Scale

The base spacing unit is `--spacing: 0.25rem` (4px):
- `0.25rem` (4px): Icon / text gap
- `0.5rem` (8px): Compact padding and badge padding
- `0.75rem` (12px): Field padding and card item gaps
- `1rem` (16px): Standard component gap & table cell padding
- `1.5rem` (24px): Card padding and layout margins
- `2rem` (32px): Major section separation

### Corner Radius Scale

- Base radius: `--radius: 1rem` (16px).
- Small (`--radius-sm`): `calc(var(--radius) - 4px)` (12px) for inputs, tags, and small controls.
- Medium (`--radius-md`): `calc(var(--radius) - 2px)` (14px) for buttons and prompt chips.
- Large (`--radius-lg`): `var(--radius)` (16px) for cards, dialogs, and table containers.
- Pill (`9999px`): For status badges, decision buttons, avatars, and live indicators.

---

## Reusable Component Primitives

Load `global.css` before `components.css`. All components follow the unified `.ui-*` naming convention and are demonstrated live in [`mockup/pages/design-system.html`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/pages/design-system.html).

### 1. Cards & KPI Metrics

Standard card containers, compact metric tiles, and interactive navigation cards. All metric cards are stationary and flat (no hover translation).

```html
<!-- Standard Content Card -->
<article class="ui-card">
  <div class="ui-card-header">
    <h3 class="ui-card-title">Pending applications</h3>
    <p class="ui-card-description">Applications waiting for academic review.</p>
  </div>
  <div class="ui-card-content">
    <p class="ui-text">Card content body goes here.</p>
  </div>
  <div class="ui-card-footer">
    <span class="ui-text-muted">Updated 10m ago</span>
  </div>
</article>

<!-- Compact KPI Metric Card (Flat, Stationary) -->
<div class="ui-card ui-card-sm metric-card">
  <div class="ui-card-header">
    <p class="metric-card-label">Active Students</p>
  </div>
  <div class="metric-card-row">
    <strong class="metric-card-value">2,850</strong>
    <span class="metric-card-trend">↗ +12.5%</span>
  </div>
  <p class="metric-card-status">AY 2026-2027</p>
</div>

<!-- Interactive Card Link -->
<div class="ui-card-interactive">
  <a href="students.html" class="ui-card">
    <div class="ui-card-header">
      <h3 class="ui-card-title">Student Roster</h3>
      <p class="ui-card-description">Review enrolled student records.</p>
    </div>
  </a>
</div>
```

---

### 2. Buttons & Action Triggers

Interactive button primitives conforming to the unified `.ui-btn` specification, including the standardized Primary Entity Creation (`.add-button`), decision pills, and animated links.

```html
<!-- Standard Button Variants -->
<button class="ui-btn" type="button">Primary Action</button>
<button class="ui-btn ui-btn-secondary" type="button">Secondary Action</button>
<button class="ui-btn ui-btn-outline" type="button">Outline Action</button>
<button class="ui-btn ui-btn-destructive" type="button">Delete Record</button>
<button class="ui-btn" type="button" disabled>Disabled Action</button>

<!-- Primary Entity Creation Button (.add-button) -->
<!-- Standard across Add Student, Add Faculty, Add Department, Add Program, etc. -->
<button type="button" class="ui-btn add-button">
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <span>Add Record</span>
</button>

<!-- Proposal Decision Pill Buttons (.pill-btn) -->
<button type="button" class="pill-btn accept">Accept Application</button>
<button type="button" class="pill-btn reject">Reject Application</button>

<!-- Interactive Neutral Action Link with Sliding Arrow -->
<a href="#" class="ui-link-neutral">
  Review <span class="arrow">&rarr;</span>
</a>
```

#### Specifications:
- **Primary Entity Add (`.add-button`):** Terracotta background (`#D97251`), bold black text (`#000000`, `font-weight: 700`), 38px height (`height: 38px`), consistent SVG plus icon (`14x14`, `stroke-width="2"`, `stroke-linecap="round"`), and 12px border radius.
- **Action Link (`.ui-link-neutral`):** High-contrast neutral text (`#FAF9F5`) transitioning to terracotta (`#D97251`) on hover, with the `.arrow` smoothly gliding 4px rightward via `transform: translateX(4px)`.
- **Decision Pills (`.pill-btn`):** Full 9999px radius; Accept uses forest green (`#2c7e39`), Reject uses crimson (`#f9464a`).

---

### 3. Status Badges, System Origin & Domain Chips

Unified, portal-agnostic semantic pill tags and status indicators used across tables, directory views, and audit trails.

```html
<!-- 1. Operational & Lifecycle Statuses -->
<span class="ui-badge ui-badge--success">
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
  Approved / Active
</span>
<span class="ui-badge ui-badge--warning">
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  Pending Review
</span>
<span class="ui-badge ui-badge--destructive">
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  Rejected / Deficient
</span>
<span class="ui-badge ui-badge--info">
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  In Progress
</span>
<span class="ui-badge ui-badge--neutral">
  Archived / Draft
</span>

<!-- 2. Entity Classification & Origin Tags -->
<span class="ui-badge ui-badge--purple">Department</span>
<span class="ui-badge ui-badge--cyan">Program</span>
<span class="ui-badge ui-badge--warning">Student Origin</span>
<span class="ui-badge ui-badge--info">Faculty Origin</span>
<span class="ui-badge ui-badge--destructive">System / Direct</span>

<!-- 3. Audit Activity & Mutation Events -->
<span class="ui-badge ui-badge--success">Created / Addition</span>
<span class="ui-badge ui-badge--info">Updated / Edit</span>
<span class="ui-badge ui-badge--destructive">Removed / Deleted</span>
<span class="ui-badge ui-badge--purple">Evaluation Review</span>

<!-- 4. Domain & Competency Assessment Tags -->
<span class="ui-badge ui-badge--purple">Research</span>
<span class="ui-badge ui-badge--cyan">Algorithms</span>
<span class="ui-badge ui-badge--amber">Leadership</span>
<span class="ui-badge ui-badge--rose">Robotics</span>
<span class="ui-badge ui-badge--neutral">General Academic</span>
```

---

### 4. Form Controls & Table Controls Toolbar

Standard inputs, selects, textareas, and the unified Table Controls Toolbar pattern.

```html
<!-- Table Controls Toolbar (Search & Filter Bar) -->
<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; width: 100%;">
  
  <!-- Search Input Wrapper (280px) -->
  <div class="search-wrapper" style="position: relative; width: 280px; max-width: 100%;">
    <svg class="search-icon" viewBox="0 0 16 16" fill="none" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; pointer-events: none;">
      <circle cx="7" cy="7" r="4.5" stroke="#6C655D" stroke-width="1.3"/>
      <path d="M10.5 10.5L14 14" stroke="#6C655D" stroke-width="1.3" stroke-linecap="round"/>
    </svg>
    <input class="search-input" type="search" placeholder="Search by student, faculty, or proposal..." style="width: 100%; height: 38px; padding-left: 36px; padding-right: 12px; background: var(--muted); border: 1px solid var(--border); border-radius: 12px; color: var(--foreground); font-size: 12px; outline: none;">
  </div>

  <!-- Filter Dropdowns & Add Button Group -->
  <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
    
    <!-- Department Filter Dropdown (195px prevents text clipping) -->
    <div class="dropdown-container department" style="position: relative; width: 195px; height: 38px;">
      <select class="dropdown-select" style="width: 100%; height: 38px; padding: 0 30px 0 14px; background: var(--muted); border: 1px solid var(--input, #43362B); border-radius: 12px; color: var(--foreground); font-size: 12px; appearance: none; outline: none; cursor: pointer;">
        <option value="all">Department: All</option>
        <option>Department of Computer Science</option>
        <option>Department of Information Technology</option>
        <option>Department of Applied Mathematics</option>
      </select>
      <svg class="dropdown-chevron" viewBox="0 0 14 14" fill="none" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; width: 12px; height: 12px;">
        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#6C655D" stroke-width="1.17" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Status Filter Dropdown (130px) -->
    <div class="dropdown-container status" style="position: relative; width: 130px; height: 38px;">
      <select class="dropdown-select" style="width: 100%; height: 38px; padding: 0 30px 0 14px; background: var(--muted); border: 1px solid var(--input, #43362B); border-radius: 12px; color: var(--foreground); font-size: 12px; appearance: none; outline: none; cursor: pointer;">
        <option value="all">Status: All</option>
        <option>Active</option>
        <option>Under Review</option>
        <option>Archived</option>
      </select>
      <svg class="dropdown-chevron" viewBox="0 0 14 14" fill="none" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; width: 12px; height: 12px;">
        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#6C655D" stroke-width="1.17" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Primary Add Action Trigger -->
    <button type="button" class="ui-btn add-button">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <span>Add Record</span>
    </button>
  </div>
</div>
```

---

### 5. Modern Data Tables, Loading Shimmers & Empty States

Data tables support clean typography profiles (no circular avatars), live row selection counters, shimmer skeleton loading, and empty-state recovery.

```html
<div class="ui-table-wrap">
  <table class="ui-table">
    <thead>
      <tr>
        <th style="width: 40px;"><input type="checkbox" aria-label="Select all rows"></th>
        <th>Student</th>
        <th>Student ID</th>
        <th>Program</th>
        <th>Year Level</th>
        <th>Status</th>
        <th style="text-align: right;">Action</th>
      </tr>
    </thead>
    <tbody>
      <!-- Clean Typography Row (Non-circular profile) -->
      <tr>
        <td><input type="checkbox" aria-label="Select row"></td>
        <td>
          <div>
            <strong style="display: block; font-size: 0.875rem; color: var(--foreground);">Sam Lee Parker</strong>
            <span style="font-size: 0.75rem; color: var(--muted-foreground);">sam.parker@vsu.edu.ph</span>
          </div>
        </td>
        <td><code class="ui-text-mono">24-1-00001</code></td>
        <td>BS Computer Science</td>
        <td>3rd Year</td>
        <td><span class="ui-badge ui-badge--success">Approved</span></td>
        <td style="text-align: right;">
          <button type="button" class="ui-btn ui-btn-outline" style="min-height: 2rem; padding: 0.25rem 0.625rem; font-size: 0.75rem;">View</button>
        </td>
      </tr>

      <!-- Skeleton Loading Shimmer Row -->
      <tr class="skeleton-row" style="display: none;">
        <td><div class="skeleton-bar" style="width: 16px; height: 16px; border-radius: 4px;"></div></td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div class="skeleton-bar" style="width: 130px; height: 14px;"></div>
            <div class="skeleton-bar" style="width: 160px; height: 11px;"></div>
          </div>
        </td>
        <td><div class="skeleton-bar" style="width: 80px; height: 14px;"></div></td>
        <td><div class="skeleton-bar" style="width: 140px; height: 14px;"></div></td>
        <td><div class="skeleton-bar" style="width: 60px; height: 14px;"></div></td>
        <td><div class="skeleton-bar" style="width: 75px; height: 20px; border-radius: 999px;"></div></td>
        <td style="text-align: right;"><div class="skeleton-bar" style="width: 50px; height: 26px; border-radius: 8px; margin-left: auto;"></div></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Table Pagination & Selection Status Bar -->
<div class="ui-table-pagination" style="border-top: none; padding: 1rem 0; display: flex; justify-content: space-between; background: transparent; align-items: center; flex-wrap: wrap; gap: 1rem;">
  <!-- Live Selection Counter -->
  <span style="color: var(--muted-foreground); font-size: 0.875rem;">2 of 10 row(s) selected.</span>
  
  <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
    <!-- Pill Rows-per-Page Dropdown -->
    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--muted-foreground); font-size: 0.875rem; font-weight: 500;">
      <span>Rows per page</span>
      <div style="position: relative; display: flex; align-items: center;">
        <select class="ui-select-pill" style="min-width: 4rem;">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="20">20</option>
        </select>
        <svg style="position: absolute; right: 0.6rem; pointer-events: none; opacity: 0.6;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <span>Page 1 of 2</span>
    </div>
    
    <!-- Previous / Next Navigation Buttons -->
    <div class="ui-table-pagination-nav" style="gap: 0.5rem; display: flex;">
      <button type="button" class="ui-btn ui-btn-outline" style="min-height: 2rem; padding: 0 1rem; border-radius: var(--radius-md); font-size: 0.8125rem;" disabled>Previous</button>
      <button type="button" class="ui-btn ui-btn-outline" style="min-height: 2rem; padding: 0 1rem; border-radius: var(--radius-md); font-size: 0.8125rem;">Next</button>
    </div>
  </div>
</div>

<!-- Empty State Recovery Container -->
<div class="empty-state" style="display: none; padding: 36px 16px; text-align: center; border-top: 1px solid var(--border); margin-top: 12px; border-radius: var(--radius-lg); background: var(--muted);">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--muted-foreground); margin: 0 auto 8px; display: block;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  <p style="margin: 0; font-size: 13px; font-weight: 600; color: var(--foreground);">No records matching your search or filters found.</p>
  <p style="margin: 4px 0 12px; font-size: 11px; color: var(--muted-foreground);">Try adjusting your query or resetting the active filters.</p>
  <button type="button" class="empty-state-btn">Clear all filters</button>
</div>
```

---

### 6. Portal Sidebar Navigation & Persistent View Transitions

Docked 260px navigation sidebar with active state highlights, user account card, and zero-blink view transitions.

```html
<!-- Docked Sidebar Layout (260px) -->
<aside id="sidebar-menu" class="sidebar sidebar-frame" style="width: 260px; height: 100%; background: #1F1E1D; border-right: 1px solid #181716; padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; view-transition-name: portal-sidebar;">
  
  <div>
    <!-- Brand Header -->
    <div class="brand-header" style="padding: 4px 10px; margin-bottom: 8px;">
      <h1 class="brand-title" style="font-size: 16px; font-weight: 700; color: #FAF9F5; margin: 0;">Academic Portal</h1>
    </div>

    <!-- Navigation Items List -->
    <nav class="nav" style="display: flex; flex-direction: column; gap: 4px;">
      <!-- Active Navigation Item -->
      <a href="dashboard.html" class="nav-btn-active" style="text-decoration: none; min-height: 42px; padding: 0 14px; border-radius: 16px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 700; background: #D97251 !important; color: #000000 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" aria-current="page">
        <svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; color: #000000;">
          <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5"/>
          <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="11" width="6.5" height="6.5" rx="1.5"/>
        </svg>
        <span>Dashboard</span>
      </a>

      <!-- Inactive Navigation Item -->
      <a href="faculty.html" class="nav-btn-inactive" style="text-decoration: none; min-height: 40px; padding: 0 14px; border-radius: 14px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; color: #98938D; transition: all 150ms ease;">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; color: #98938D;">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
        </svg>
        <span>Faculty Applications</span>
      </a>
    </nav>
  </div>

  <!-- Docked User Account Card -->
  <div style="margin-top: 1rem; border-top: 1px solid rgba(217, 114, 81, 0.35); padding-top: 10px;">
    <div class="sidebar-account-card" style="display: flex; align-items: center; justify-content: space-between; padding: 0 14px; height: 58px; border-radius: 18px; background: #2B2A27; border: 1px solid #383734;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="sidebar-avatar" style="width: 34px; height: 34px; border-radius: 50%; background-color: #F7E2D6; color: #A35233; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">U</div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 13px; font-weight: 700; color: #FFFFFF; line-height: 1.2;">Portal User</span>
          <span style="font-size: 11px; font-weight: 500; color: #929292; line-height: 1.2;">Academic Staff</span>
        </div>
      </div>
      <button type="button" class="sidebar-logout-btn" aria-label="Log out" style="background: transparent; border: none; color: #929292; cursor: pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 18px; height: 18px;"><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>
      </button>
    </div>
  </div>

</aside>
```

#### Color and Behavior Standard:
- **Sidebar Background:** `#1F1E1D` (RGB: 31, 30, 29) with `border-right: 1px solid #181716`.
- **Active Navigation Item:** Primary terracotta background (`#D97251`), bold black text (`#000000`, `font-weight: 700`), black SVG icon (`color: #000000`), 16px border-radius, 42px min-height, and `box-shadow: 0 1px 3px rgba(0,0,0,0.2)`.
- **Inactive Navigation Items:** Text and SVG icons styled in `#98938D`, 14px border-radius, 40px min-height. On hover: `background: rgba(255,255,255,0.05); color: #FFFFFF;`.
- **Persistent View Transitions:** Hardcoded static DOM structure combined with CSS declaration `view-transition-name: portal-sidebar;` prevents sidebar flickering and layout jumps when navigating between pages.

---

### 7. Portal Modals & Confirmation Dialogs

Backdrop-blurred modals for application rejections, entity edits, and destructive logout confirmations.

```html
<!-- Modal Overlay Backdrop & Container -->
<div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;">
  
  <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title" style="background: #444746; border: 1px solid #D97251; border-radius: 15px; padding: 20px 24px; max-width: 480px; width: 90%; box-shadow: 0 12px 32px rgba(0,0,0,0.3); color: #fff;">
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h4 id="modal-title" style="margin: 0; font-size: 16px; font-weight: 700; color: #fff;">Reject Application Proposal</h4>
      <button type="button" class="modal-close-btn" aria-label="Close modal" style="background: transparent; border: none; color: #fff; font-size: 18px; cursor: pointer; opacity: 0.7;">&times;</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div>
        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #fff;">Selected Application</label>
        <div style="padding: 8px 12px; background: var(--muted); border: 1px solid var(--input); border-radius: 10px; font-size: 13px; color: #fff;">
          Dr. Eleanor Vance (Faculty Application)
        </div>
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #fff;">Reason for Rejection</label>
        <textarea style="width: 100%; min-height: 70px; padding: 8px 12px; background: var(--muted); border: 1px solid var(--input); border-radius: 10px; font-size: 12px; color: var(--foreground); box-sizing: border-box; outline: none;" placeholder="Provide justification for proposal rejection..."></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;">
        <button type="button" class="ui-btn ui-btn-outline" style="height: 36px; font-size: 13px;">Cancel</button>
        <button type="button" class="modal-submit" style="height: 36px; font-size: 13px; background: #D97251; color: #000000; font-weight: 700; border: none; border-radius: 10px; padding: 0 16px; cursor: pointer;">Confirm Rejection</button>
      </div>
    </div>

  </div>
</div>
```

#### Behavioral & Accessibility Contract:
- **Escape Key Dismissal:** Pressing `Esc` immediately closes active modals without executing destructive mutations.
- **Backdrop Click:** Clicking the darkened background outside `.modal-container` safely dismisses the modal.
- **Surface Specifications:** Background is warm charcoal `#444746`, border is terracotta `#D97251`, and radius is 15px.

---

### 8. Chats & Conversational AI Assistant

Two-column conversational workspace designed for faculty student review evaluations.

```html
<div class="ui-chat-prompts">
  <button type="button" class="ui-chat-prompt-btn" data-prompt="...">
    <span>Research experience</span>
    <small>Explore faculty assessments &rarr;</small>
  </button>
</div>

<!-- Two-Column Chat Workspace -->
<div class="ui-chat-columns">
  
  <!-- Left: Chat Thread Card -->
  <div class="ui-card" style="display: flex; flex-direction: column; resize: vertical; overflow: hidden; align-self: flex-start;">
    <div class="ui-card-header">
      <h3 class="ui-card-title">Ask across student reviews</h3>
      <p class="ui-card-description">Faculty conversational assistant for student evaluations.</p>
    </div>
    
    <!-- Chat Container -->
    <div class="ui-chat-container" style="display: flex; flex-direction: column; flex: 1; min-height: 0;">
      <!-- Conversation Log -->
      <div class="ui-chat-log custom-scrollbar" style="display: flex; flex-direction: column; gap: 1.25rem; flex: 1; overflow-y: auto; min-height: 0;">
        
        <!-- AI Message -->
        <div class="ui-chat-msg ui-chat-msg--ai">
          <div class="ui-chat-avatar ui-chat-avatar--text">SP</div>
          <div class="ui-chat-msg-content">
            <div class="ui-chat-msg-header">
              <span class="ui-chat-msg-sender">AI Assistant</span>
              <span class="ui-chat-msg-time">10:42 AM</span>
            </div>
            <div class="ui-chat-bubble ui-chat-bubble--ai">
              What would you like to explore across the student records?
            </div>
          </div>
        </div>
        
        <!-- User Message -->
        <div class="ui-chat-msg ui-chat-msg--user">
          <div class="ui-chat-msg-content">
            <div class="ui-chat-msg-header">
              <span class="ui-chat-msg-sender">Prof. Morgan</span>
              <span class="ui-chat-msg-time">10:43 AM</span>
            </div>
            <div class="ui-chat-bubble ui-chat-bubble--user">
              Which students demonstrate outstanding research contributions?
            </div>
          </div>
        </div>
        
      </div>

      <!-- Chat Input Area -->
      <div class="ui-chat-input-wrapper" style="flex-shrink: 0; margin-top: 0.5rem;">
        <form class="chat-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <textarea class="ui-chat-textarea" placeholder="Type a question..."></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="ui-chat-input-hint">Press Enter to send</span>
            <button type="submit" class="ui-chat-send-btn">Send query</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Right: Student Quick File Context Card -->
  <div class="ui-chat-context-card">
    <div class="ui-chat-context-avatar">SP</div>
    <h3 class="ui-heading-3">Sam Lee Parker</h3>
    <p class="ui-text-muted">ID: 24-1-00001</p>
    
    <div class="ui-chat-context-meta">
      <span class="ui-chat-context-dt">Status</span>
      <span class="ui-chat-context-dd">Good Standing</span>
    </div>
    
    <a href="#" class="ui-btn ui-btn-outline" style="width: 100%; justify-content: center;">View Full Profile</a>
  </div>
</div>
```

---

### 9. Authentication & Account Gateways

Unified box, color, and typography specification for Sign In and Sign Up portals.

```html
<main class="ui-auth-wrapper">
  <section class="ui-auth-card" aria-labelledby="auth-title">
    <div class="ui-auth-header">
      <h1 id="auth-title" class="ui-auth-title">Sign In</h1>
      <p class="ui-auth-description">Access your SPMIS academic workspace</p>
    </div>

    <!-- Social Continue Button -->
    <button type="button" class="auth-social-btn">
      <svg viewBox="0 0 24 24">...</svg>
      <span>Continue with Google</span>
    </button>

    <div class="ui-auth-divider"><span>or continue with email</span></div>

    <!-- Credential Form -->
    <form class="ui-auth-form">
      <div class="ui-auth-field">
        <label class="ui-auth-field-label" for="email">Academic Email</label>
        <input type="email" id="email" class="ui-input" placeholder="faculty@vsu.edu.ph" required>
      </div>
      <div class="ui-auth-field">
        <label class="ui-auth-field-label" for="password">Password</label>
        <input type="password" id="password" class="ui-input" placeholder="••••••••••••" required>
      </div>
      <button type="submit" class="ui-auth-btn-submit">Sign In</button>
    </form>

    <div class="ui-auth-footer">
      <span>New to SPMIS? </span>
      <a href="signup.html">Create an Account</a>
    </div>
  </section>
</main>
```

---

### 10. Workspace Frame (Header, Status, Toast Feedback & Pinned Footer)

Unified layout primitives anchoring the full-screen portal viewport: the persistent top status header bar, floating toast feedback, and the docked workspace footer.

```html
<!-- 1. Top Header Status Bar -->
<div class="admin-top-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #42423F; padding-bottom: 0.75rem; margin-bottom: 0.75rem; width: 100%;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <!-- Terracotta dot for workspace context -->
    <div class="red-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #D97251;"></div>
    <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9C948B;">Workspace / Overview</span>
  </div>
  <div style="display: flex; align-items: center; gap: 12px;">
    <!-- Pulsing green dot status pill -->
    <span class="status-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; background: #3d3d3a; border: 1px solid #484844; font-size: 11px; color: #9C948B;">
      <span class="green-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
      System Live
    </span>
    <span style="font-size: 11px; color: #9C948B;">AY 2026-2027</span>
  </div>
</div>

<!-- 2. Toast Notification Feedback (.ui-toast) -->
<div class="ui-toast ui-toast--success" role="status" aria-live="polite" style="position: fixed; bottom: 20px; right: 24px; padding: 12px 18px; border-radius: 12px; background: #21201E; border: 1px solid #43362B; backdrop-filter: blur(8px); display: flex; align-items: center; gap: 10px; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97251" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
  <span style="font-size: 13px; font-weight: 500; color: #FAF9F5;">Record updated successfully</span>
</div>

<!-- 3. Pinned Viewport Workspace Footer (.workspace-footer) -->
<footer class="workspace-footer" style="flex: none !important; height: auto !important; padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #42423F; font-size: 11px; color: #9C948B; background: #141413;">
  <span>&copy; 2026 Academic Management System. All rights reserved.</span>
  <span>System Version 2.4.0 &middot; AY 2026-2027</span>
</footer>
```

#### Workspace Frame Architecture:
- **Top Header Bar:** Anchored at the top of the main content column. The terracotta dot anchors the workspace context while the pulsing green indicator confirms live operational health.
- **Floating Toast System:** Fixed bottom-right notification element with subtle blur, auto-dismissing after 3 seconds, accessible via `aria-live="polite"`.
- **Pinned Workspace Footer:** Uses `flex: none` inside the outer vertical flex column, ensuring it stays neatly pinned at the bottom of the viewport without pushing the page into outer scrolling.

---

## Integration Guidelines

For any standalone page under `mockup/pages/`, include the stylesheets in the `<head>` in this exact order:

```html
<link rel="stylesheet" href="../../assets/css/global.css">
<link rel="stylesheet" href="../../assets/css/components.css">
```

### Rules of Engagement

1. **Never use ad hoc hex color literals** in page markup or inline styles. Always reference `var(--...)` custom properties or documented tokens.
2. **Preserve full-screen framing:** The outer container must be bordered with `1px solid #D97251` and never produce outer viewport scrollbars (`overflow: hidden` on viewport roots).
3. **Primary Action Consistency:** All primary Add buttons (`.add-button`) must use the terracotta background (`#D97251`), bold black text (`#000000`, `font-weight: 700`), 38px height, and the standard SVG plus icon.
4. **Sidebar Palette Conformity:** Docked sidebars must use `#1F1E1D` background with `#181716` right border, terracotta `#D97251` active navigation items with `#000000` text/icon, and `#98938D` inactive items with `rgba(255,255,255,0.05)` hover background.
5. **Zero-Blink Transitions:** Include `view-transition-name: portal-sidebar;` on persistent layout elements and leverage link hover prefetching.
6. **Respect contrast in both modes:** Ensure text uses `var(--foreground)`, `var(--card-foreground)`, or `var(--muted-foreground)` so content remains completely legible in both Light and Dark modes.
7. **Inspect with Living Style Guide:** Always check new primitives against [`mockup/pages/design-system.html`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/pages/design-system.html) before deploying to production.
