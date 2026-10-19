// Run: node mockup/tests/admin-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const adminPagesDir = path.join(__dirname, "../pages/admin");
const adminPages = fs.readdirSync(adminPagesDir)
  .filter((file) => file.endsWith(".html"))
  .sort();

const sidebarPath = path.join(__dirname, "../components/navigation/sidebar-admin.html");
const sidebarHtml = fs.readFileSync(sidebarPath, "utf8");

assert.equal(adminPages.length, 10, "All admin pages must be covered");

// Verify that all admin pages embed the sidebar iframe, top header, and footer inside main
for (const page of adminPages) {
  const html = fs.readFileSync(path.join(adminPagesDir, page), "utf8");
  assert.match(
    html,
    /<iframe[^>]*sidebar-admin\.html/i,
    `${page} must embed the sidebar iframe`,
  );
  assert.match(
    html,
    /class="[^"]*admin-top-header[^"]*"/,
    `${page} must contain .admin-top-header`,
  );
  assert.match(
    html,
    /class="[^"]*admin-footer[^"]*"/,
    `${page} must contain .admin-footer`,
  );
  assert.match(
    html,
    /<main[\s\S]*?<footer class="[^"]*\badmin-footer\b[^"]*"[\s\S]*?<\/main>/,
    `${page} must place .admin-footer inside <main>`,
  );
}

// Verify that sidebar-admin.html contains strictly the 6 core navigation items
const coreNavKeys = [
  "dashboard",
  "students",
  "departments",
  "programs",
  "faculty",
  "audit-log",
];

for (const key of coreNavKeys) {
  assert.match(
    sidebarHtml,
    new RegExp(`data-nav-key="${key}"`),
    `sidebar-admin.html must have nav link for ${key}`,
  );
}

const navLinks = sidebarHtml.match(/data-nav-key="[^"]+"/g) || [];
assert.equal(navLinks.length, 6, "Sidebar must contain strictly 6 navigation items");

// Verify styling rules in sidebar-admin.html and components.css
assert.match(sidebarHtml, /\.nav-btn-active/, "sidebar-admin.html must style active nav state");
assert.match(sidebarHtml, /#D97251/, "sidebar-admin.html must use terracotta #D97251 for active nav");
assert.match(sidebarHtml, /#000000/, "sidebar-admin.html must use #000000 for active nav text/icon");

const componentsCss = fs.readFileSync(path.join(__dirname, "../assets/css/components.css"), "utf8");
assert.match(componentsCss, /\.nav-btn-active/, "components.css must define .nav-btn-active styles");

console.log("Admin sidebar, header, footer, and navigation button checks passed.");
