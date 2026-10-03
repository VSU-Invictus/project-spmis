// Run: node mockup/tests/admin-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const adminPagesDir = path.join(__dirname, "../pages/admin");
const adminPages = fs.readdirSync(adminPagesDir)
  .filter((file) => file.endsWith(".html"))
  .sort();
const sidebarScript = fs.readFileSync(
  path.join(__dirname, "../assets/js/admin-sidebar.js"),
  "utf8",
);

assert.equal(adminPages.length, 10, "All admin pages must be covered");

for (const page of adminPages) {
  const html = fs.readFileSync(path.join(adminPagesDir, page), "utf8");
  assert.equal(
    (html.match(/id="sidebar-menu"/g) || []).length,
    1,
    `${page} must have one admin sidebar host`,
  );
  assert.match(
    html,
    /assets\/js\/admin-sidebar\.js/,
    `${page} must load the admin sidebar script`,
  );
  assert.doesNotMatch(
    html,
    /<iframe[^>]*sidebar/i,
    `${page} must not reload the sidebar in an iframe`,
  );
}

const expectedTargets = [
  "dashboard.html",
  "faculty-applications.html",
  "student-applications.html",
  "program-applications.html",
  "department-applications.html",
  "students.html",
  "departments.html",
  "programs.html",
  "faculty.html",
  "audit-log.html",
];

for (const target of expectedTargets) {
  assert.match(sidebarScript, new RegExp(`pages/admin/${target}`));
}

assert.match(sidebarScript, /data-admin-sidebar/);
assert.match(sidebarScript, /nav-btn-active/);
assert.match(sidebarScript, /window\.location\.pathname/);
assert.match(sidebarScript, /sidebar-account-card/);

// Verify header, footer, fixed icon and button heights across all admin pages
const componentsCss = fs.readFileSync(path.join(__dirname, "../assets/css/components.css"), "utf8");
assert.match(componentsCss, /\.sidebar-divider\s*\{[^}]*#42423F/i, "Sidebar divider must use #42423F to match header and footer border");

const validFacultyIconPath = 'H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2';

for (const page of adminPages) {
  const html = fs.readFileSync(path.join(adminPagesDir, page), "utf8");
  assert.match(html, /class="[^"]*admin-top-header[^"]*"/, `${page} must contain .admin-top-header`);
  assert.match(html, /class="[^"]*admin-footer[^"]*"/, `${page} must contain .admin-footer`);
  assert.match(html, /<main[\s\S]*?<footer class="admin-footer"[\s\S]*?<\/main>/, `${page} must place .admin-footer inside <main>`);
  assert.doesNotMatch(html, /min-h-\[42px\]/, `${page} must not have 42px nav button height (must be 40px locked)`);
  assert.match(html, new RegExp(validFacultyIconPath), `${page} must have unbroken faculty applications icon`);
}

console.log("Admin sidebar, header, footer, and navigation button checks passed.");
