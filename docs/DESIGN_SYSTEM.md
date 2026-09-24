# SPMIS Design System

SPMIS uses the **Claude+** theme from tweakcn as its shared visual foundation. The system is implemented as raw CSS so every HTML page can consume the same tokens and primitives without any build step, bundler, or external framework.

Theme source: [Claude+ registry item](https://tweakcn.com/themes/cmdght103000n04lh3e2ae93r)  
Living style guide: [`mockup/pages/design-system.html`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/pages/design-system.html)

---

## Core Principles

- **Calm and legible:** Warm neutrals keep dense academic workflows easy to scan without visual fatigue.
- **Terracotta for action:** Reserve `--primary` for the main action, active navigation, and meaningful emphasis.
- **Surfaces create hierarchy:** Use `--background`, `--card`, `--muted`, and `--sidebar` instead of inventing page-specific colors.
- **Tokens before literals:** Use a custom property for color, spacing, radius, typography, and shadow decisions.
- **Accessible interaction:** Preserve visible focus rings, sufficient contrast, semantic HTML, and reduced-motion behavior.
- **Dual theme agility:** Support both **Light Mode** (warm paper canvas) and **Dark Mode** (charcoal canvas) seamlessly via CSS custom properties.
- **Consistent density:** Use the spacing scale and shared component classes for repeated UI patterns.

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
| `--primary-foreground` | `oklch(1.0000 0 0)` (#FFFFFF) | `oklch(0.1908 0.0020 106.5859)` (~#141413) | Text on primary buttons |
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
| `--sidebar` | `oklch(0.9663 0.0080 98.8792)` (~#F3F0EA) | `oklch(0.2357 0.0024 67.7077)` (~#21201E) | Fixed sidebar background |
| `--sidebar-foreground` | `oklch(0.3590 0.0051 106.6524)` (~#3E3C38) | `oklch(0.8074 0.0142 93.0137)` (~#B5B0A6) | Inactive sidebar nav text |
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
- Pill (`9999px`): For status badges, avatars, and live indicators.

---

## Reusable Component Primitives

Load `global.css` before `components.css`. All components follow the unified `.ui-*` naming convention.

### 1. Cards

```html
<!-- Standard Content Card -->
<article class="ui-card">
  <div class="ui-card-header">
    <h3 class="ui-card-title">Pending applications</h3>
    <p class="ui-card-description">Applications waiting for faculty review.</p>
  </div>
  <div class="ui-card-content">
    <p class="ui-text">Card content body goes here.</p>
  </div>
  <div class="ui-card-footer">
    <span class="ui-text-muted">Updated 10m ago</span>
  </div>
</article>

<!-- Compact KPI Metric Card -->
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

### 2. Buttons

```html
<button class="ui-btn" type="button">Primary Action</button>
<button class="ui-btn ui-btn-secondary" type="button">Secondary Action</button>
<button class="ui-btn ui-btn-outline" type="button">Outline Action</button>
<button class="ui-btn ui-btn-destructive" type="button">Delete Record</button>
<button class="ui-btn" type="button" disabled>Disabled Action</button>
```

### 3. Status Badges & Chips

```html
<span class="ui-badge ui-badge--success">Approved</span>
<span class="ui-badge ui-badge--warning">Pending Review</span>
<span class="ui-badge ui-badge--destructive">Rejected</span>
<span class="ui-badge ui-badge--info">In Progress</span>
<span class="ui-badge ui-badge--neutral">Draft</span>
```

### 4. Data Tables & Pagination

Data tables provide clean cell padding, header styling, row hover highlights, and pagination controls.

```html
<div class="ui-table-wrap">
  <table class="ui-table">
    <thead>
      <tr>
        <th style="width: 40px;"><input type="checkbox" aria-label="Select all"></th>
        <th>Student</th>
        <th>Student ID</th>
        <th>Program</th>
        <th>Status</th>
        <th style="text-align: right;">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" aria-label="Select row"></td>
        <td><strong>Sam Lee Parker</strong></td>
        <td><code class="ui-text-mono">24-1-00001</code></td>
        <td>BS Computer Science</td>
        <td><span class="ui-badge ui-badge--success">Approved</span></td>
        <td style="text-align: right;">
          <button type="button" class="ui-btn ui-btn-outline">View</button>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="ui-table-pagination">
    <span>Showing <strong>1 to 10</strong> of <strong>48</strong> records</span>
    <div class="ui-table-pagination-nav">
      <button type="button" class="ui-table-page-btn" disabled>←</button>
      <button type="button" class="ui-table-page-btn active">1</button>
      <button type="button" class="ui-table-page-btn">2</button>
      <button type="button" class="ui-table-page-btn">→</button>
    </div>
  </div>
</div>
```

### 5. Chats & AI Assistant

Designed for faculty conversational reviews across student evaluations.

```html
<div class="ui-chat-container">
  <!-- Prompt Chips -->
  <div class="ui-chat-prompts">
    <button type="button" class="ui-chat-prompt-btn">
      <span>Research experience</span>
      <small>Explore faculty assessments →</small>
    </button>
    <button type="button" class="ui-chat-prompt-btn">
      <span>Teamwork &amp; Leadership</span>
      <small>Ask across student records →</small>
    </button>
  </div>

  <!-- Chat Columns Layout -->
  <div class="ui-chat-columns">
    <!-- Conversation Log Card -->
    <div class="ui-card">
      <div class="ui-chat-log">
        <!-- AI Assistant Bubble -->
        <div class="ui-chat-msg ui-chat-msg--ai">
          <div class="ui-chat-msg-header">
            <span class="ui-chat-msg-sender">AI Assistant</span>
            <span class="ui-chat-msg-time">10:42 AM</span>
          </div>
          <div>What would you like to explore across the student records?</div>
        </div>

        <!-- User Bubble -->
        <div class="ui-chat-msg ui-chat-msg--user">
          <div class="ui-chat-msg-header">
            <span class="ui-chat-msg-sender">Prof. Morgan</span>
            <span class="ui-chat-msg-time">10:43 AM</span>
          </div>
          <div>Which students demonstrate outstanding research contributions?</div>
        </div>
      </div>

      <!-- Input Bar -->
      <div class="ui-chat-input-box">
        <textarea class="ui-chat-textarea" placeholder="Ask across student records..."></textarea>
        <button type="button" class="ui-btn">Send query</button>
      </div>
    </div>

    <!-- Student Quick File Context Card -->
    <aside class="ui-chat-context-card">
      <div class="ui-chat-context-avatar">SP</div>
      <h3>Sam Lee Parker</h3>
      <p class="ui-text-muted">ID: 24-1-00001</p>
      <div class="ui-chat-context-meta">
        <span class="ui-chat-context-dt">Program</span>
        <span class="ui-chat-context-dd">BS Computer Science</span>
        <span class="ui-chat-context-dt">Status</span>
        <span class="ui-chat-context-dd"><span class="ui-badge ui-badge--success">Good Standing</span></span>
      </div>
      <button type="button" class="ui-btn ui-btn-outline" style="width: 100%;">View Full Profile</button>
    </aside>
  </div>
</div>
```

### 6. Authentication & Account Cards

The unified **Box**, **Color**, and **Text** specification for Sign In and Sign Up portals.

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

## Integration Guidelines

For any standalone page under `mockup/pages/`, include the stylesheets in the `<head>` in this exact order:

```html
<link rel="stylesheet" href="../../assets/css/global.css">
<link rel="stylesheet" href="../../assets/css/components.css">
```

### Rules of Engagement

1. **Never use ad hoc hex color literals** in page markup or inline styles. Always reference `var(--...)` custom properties.
2. **Preserve full-screen framing:** The outer container must be bordered with `1px solid #D97251` and never produce outer viewport scrollbars.
3. **Respect contrast in both modes:** When creating new components, ensure foreground text uses `var(--foreground)`, `var(--card-foreground)`, or `var(--muted-foreground)` so text remains completely legible in both Light and Dark modes.
4. **Inspect with Living Style Guide:** Always check new primitives against [`mockup/pages/design-system.html`](file:///c:/Users/monarch/Desktop/project-spmis/mockup/pages/design-system.html) before deploying to production.
