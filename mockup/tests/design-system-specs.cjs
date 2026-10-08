// Run: node mockup/tests/design-system-specs.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const designSystemHtml = fs.readFileSync(path.join(__dirname, "../pages/design-system.html"), "utf8");
const designSystemCss = fs.readFileSync(path.join(__dirname, "../assets/css/design-system.css"), "utf8");
const designSystemPageCss = fs.readFileSync(path.join(__dirname, "../assets/css/pages/design-system.css"), "utf8");
const designSystemJs = fs.readFileSync(path.join(__dirname, "../assets/js/pages/design-system.js"), "utf8");

// 1. Verify Authentication & Account Cards section checkbox and "Keep me signed in"
assert.match(
  designSystemHtml,
  /<label[^>]*class="[^"]*keep-signed-in[^"]*"[\s\S]*?<input[^>]*class="[^"]*custom-checkbox[^"]*"[\s\S]*?<span[^>]*class="[^"]*keep-signed-in-text[^"]*"[^>]*>Keep me signed in on this device<\/span>/,
  "Auth card must have .custom-checkbox and .keep-signed-in-text for 'Keep me signed in on this device'"
);
assert.match(
  designSystemCss,
  /\.keep-signed-in[\s\S]*?color:\s*var\(--color-text-muted,\s*#A0988E\)/,
  "design-system.css must style keep-signed-in label text with soft muted color #A0988E"
);

// 2. Verify Portal Sidebar Navigation colors and interactivity
assert.match(
  designSystemHtml,
  /<div[^>]*id="demo-sidebar-container"[\s\S]*?<nav[^>]*id="demo-sidebar-nav"[\s\S]*?class="nav-btn-active"/,
  "demo-sidebar-container must contain demo-sidebar-nav with nav-btn-active"
);
assert.match(
  designSystemCss,
  /#demo-sidebar-container\s+\.nav-btn-active[\s\S]*?background-color:\s*#D97251\s*!important[\s\S]*?color:\s*#000000\s*!important/,
  "Active sidebar nav link must have background #D97251 and color #000000 matching faculty/admin sidebar"
);
assert.match(
  designSystemCss,
  /#demo-sidebar-container\s+\.nav-btn-inactive:hover[\s\S]*?background-color:\s*rgba\(255,\s*255,\s*255,\s*0\.05\)[\s\S]*?color:\s*#FFFFFF/,
  "Inactive sidebar nav link hover must use rgba(255, 255, 255, 0.05) and #FFFFFF"
);
assert.match(
  designSystemJs,
  /demoSidebarNav\.addEventListener\(['"]click['"]/,
  "design-system.js must provide interactive active state switcher for demo-sidebar-nav"
);

// 3. Verify Data Tables checkboxes are equal size (aspect-ratio 1/1, 20px by 20px squircle)
assert.match(
  designSystemHtml,
  /<th class="checkbox-cell[^"]*"><input type="checkbox" class="[^"]*custom-checkbox[^"]*select-all-checkbox[^"]*"\s*checked/,
  "Data table header must use .checkbox-cell and .custom-checkbox .select-all-checkbox with checked attribute"
);
assert.match(
  designSystemHtml,
  /<tr class="checked">\s*<td class="checkbox-cell"><input type="checkbox" class="[^"]*custom-checkbox[^"]*row-checkbox[^"]*"\s*checked/,
  "Data table rows must have checked row state matching design photo"
);
assert.match(
  designSystemCss,
  /\.custom-checkbox,[\s\S]*?width:\s*20px\s*!important;[\s\S]*?height:\s*20px\s*!important;[\s\S]*?aspect-ratio:\s*1\s*\/\s*1\s*!important;[\s\S]*?border-radius:\s*6px\s*!important;/,
  "custom-checkbox must strictly enforce 20px by 20px squircle equal width and height with aspect-ratio: 1 / 1 and border-radius: 6px"
);
assert.match(
  designSystemCss,
  /\.select-all-checkbox:indeterminate[\s\S]*?background-color:\s*#30302E\s*!important;[\s\S]*?background-color:\s*#FFFFFF\s*!important;/,
  "Header select-all checkbox when partially selected must have dark charcoal squircle #30302E with white checkmark #FFFFFF"
);
assert.match(
  designSystemCss,
  /\.select-all-checkbox:checked:not\(:indeterminate\)[\s\S]*?background-color:\s*var\(--primary,\s*#D97251\)\s*!important;[\s\S]*?background-color:\s*#000000\s*!important;/,
  "Header select-all checkbox when all rows are selected must be color orange (#D97251) with black checkmark"
);
assert.match(
  designSystemCss,
  /\.row-checkbox:checked[\s\S]*?background-color:\s*var\(--primary,\s*#D97251\)\s*!important;[\s\S]*?background-color:\s*#000000\s*!important;/,
  "Table row checkboxes must have terracotta #D97251 background with black checkmark #000000"
);

// 4. Verify Light Mode Standard Portal Sidebar Navigation readability
assert.match(
  designSystemCss,
  /html:not\(\.dark\)\s+#demo-sidebar-container\s+\.brand-title[\s\S]*?color:\s*#141413\s*!important;/,
  "Light mode sidebar title must be high-contrast dark #141413"
);
assert.match(
  designSystemCss,
  /html:not\(\.dark\)\s+#demo-sidebar-container\s+\.nav-btn-inactive[\s\S]*?color:\s*#4A4740\s*!important;/,
  "Light mode inactive navigation items must have readable dark text #4A4740"
);
assert.match(
  designSystemCss,
  /html:not\(\.dark\)\s+#demo-sidebar-container\s+\.nav-btn-active[\s\S]*?background-color:\s*#D97251\s*!important[\s\S]*?color:\s*#FFFFFF\s*!important;/,
  "Light mode active sidebar item must have terracotta background #D97251 with white text #FFFFFF"
);

// 5. Verify Portal Status Header Bar has transparent background
assert.match(
  designSystemCss,
  /\.admin-top-header\s*\{[\s\S]*?background:\s*transparent\s*!important;/,
  "Portal status header bar must have transparent background to seamlessly blend into container surface"
);

console.log("All design system specs (auth checkbox, sidebar navigation colors, table checkbox sizing, lightmode sidebar readability, and header bar surface) passed successfully!");

