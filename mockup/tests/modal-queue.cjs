// Run: node mockup/tests/modal-queue.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const queueCss = fs.readFileSync(path.join(__dirname, "../assets/css/queue-modal.css"), "utf8");
const adminCommonCss = fs.readFileSync(path.join(__dirname, "../assets/css/pages/admin/admin-common.css"), "utf8");
const componentsCss = fs.readFileSync(path.join(__dirname, "../assets/css/components.css"), "utf8");
const queueJs = fs.readFileSync(path.join(__dirname, "../assets/js/queue-modal.js"), "utf8");

// 1. Verify modal container width is NOT clamped to 480px
assert.match(queueCss, /\.queue-modal-container[\s\S]*?max-width:\s*min\(1120px/, "queue-modal.css must set wide max-width on .queue-modal-container");
assert.match(componentsCss, /\.queue-modal-container[\s\S]*?max-width:\s*min\(1120px/, "components.css must override .modal-container 480px limit for queue-modal-container");

// 2. Verify table overflow-x is auto (not hidden)
assert.match(queueCss, /html\.queue-embedded\s+\.table-container[\s\S]*?overflow-x:\s*auto\s*!important/, ".table-container in queue-embedded must have overflow-x: auto !important");

// 3. Verify sidebar and headers are hidden in embedded mode across CSS
assert.match(queueCss, /html\.queue-embedded\s+\.sidebar-frame[\s\S]*?display:\s*none\s*!important/, "queue-modal.css must hide sidebar-frame in queue-embedded");
assert.match(adminCommonCss, /html\.queue-embedded\s+\.sidebar-frame[\s\S]*?display:\s*none\s*!important/, "admin-common.css must hide sidebar-frame in queue-embedded");
assert.match(adminCommonCss, /html\.queue-embedded\s+\.section-container[\s\S]*?width:\s*100%\s*!important/, "admin-common.css must expand section-container to 100% in queue-embedded");

// 4. Verify queue-modal.js has resilient close and postMessage logic
assert.match(queueJs, /postMessage\(['"]queue-modal-reset['"],\s*['"]\*['"]\)/, "postMessage must use wildcard '*' targetOrigin to support local file:// and sandboxed origins");
assert.match(queueJs, /modal\.style\.display\s*=\s*['"]none['"]/, "closeQueueModal must clear inline display");
assert.match(queueJs, /document\.addEventListener\(['"]click['"],[\s\S]*?true\)/, "queue-modal.js must use capture phase listener for close button clicks");

// 5. Verify embedded queue pages contain early queue-embedded head script
const queuePages = [
  "../pages/admin/department-applications.html",
  "../pages/admin/faculty-applications.html",
  "../pages/admin/program-applications.html",
  "../pages/admin/student-applications.html",
  "../pages/faculty/applications.html"
];

for (const relPath of queuePages) {
  const content = fs.readFileSync(path.join(__dirname, relPath), "utf8");
  assert.match(content, /document\.documentElement\.classList\.add\(['"]queue-embedded['"]\)/, `${relPath} must have early queue-embedded script in head`);
}

// 6. Verify faculty proposal dialogs have X close buttons with SVG icons
const facultyDept = fs.readFileSync(path.join(__dirname, "../pages/faculty/departments.html"), "utf8");
const facultyProg = fs.readFileSync(path.join(__dirname, "../pages/faculty/programs.html"), "utf8");
const facultyStudents = fs.readFileSync(path.join(__dirname, "../pages/faculty/students.html"), "utf8");
const designSystemHtml = fs.readFileSync(path.join(__dirname, "../pages/design-system.html"), "utf8");
const designSystemCss = fs.readFileSync(path.join(__dirname, "../assets/css/design-system.css"), "utf8");

assert.match(facultyDept, /<dialog id="proposal-dialog"[\s\S]*?<button[^>]*class="modal-close ui-modal-close"[\s\S]*?<line x1="18"/, "departments.html proposal-dialog must have SVG ui-modal-close button");
assert.match(facultyProg, /<dialog id="proposal-dialog"[\s\S]*?<button[^>]*class="modal-close ui-modal-close"[\s\S]*?<line x1="18"/, "programs.html proposal-dialog must have SVG ui-modal-close button");
assert.match(facultyStudents, /id="close-register-modal"[\s\S]*?class="modal-close ui-modal-close"/, "students.html register modal must have SVG ui-modal-close button");
assert.match(designSystemCss, /\.ui-modal-close,\s*\n?\.modal-close\s*\{[\s\S]*?border-radius:\s*var\(--radius-md,\s*8px\)/, "design-system.css must define .ui-modal-close standard squircle styling");

// 7. Verify select-all button is removed from the 4 admin applications pages
const adminAppPages = [
  "../pages/admin/department-applications.html",
  "../pages/admin/faculty-applications.html",
  "../pages/admin/program-applications.html",
  "../pages/admin/student-applications.html"
];

for (const relPath of adminAppPages) {
  const content = fs.readFileSync(path.join(__dirname, relPath), "utf8");
  assert.equal(
    /<button[^>]*class="[^"]*select-all[^"]*"[^>]*>/i.test(content),
    false,
    `${relPath} must not have a bulk select-all button in the action group`
  );
  assert.match(content, /class="[^"]*select-all-checkbox[^"]*"/, `${relPath} must still preserve the header select-all-checkbox`);
}

// 8. Verify faculty portal Add/Propose/Register buttons use .add-button and design system SVG +
const addSvgPathRegex = /<svg width="14" height="14" viewBox="0 0 14 14" fill="none">\s*<path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"\/>\s*<\/svg>/;

assert.match(facultyDept, /<button[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*\bid="add-entity"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"|<button[^>]*\bid="add-entity"[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"/, "departments.html add-entity must use .add-button and SVG plus icon");
assert.match(facultyProg, /<button[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*\bid="add-entity"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"|<button[^>]*\bid="add-entity"[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"/, "programs.html add-entity must use .add-button and SVG plus icon");
assert.match(facultyStudents, /<button[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*\bid="open-register-modal"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"|<button[^>]*\bid="open-register-modal"[^>]*\bclass="[^"]*\badd-button\b[^"]*"[^>]*>[\s\S]*?<path d="M7 1V13M1 7H13"/, "students.html open-register-modal must use .add-button and SVG plus icon");

// 9. Verify approve and reject button styling specs in queue-modal.css & design-system.css
assert.match(queueCss, /\.pill-btn\.approve[\s\S]*?border:\s*1px solid #10B981[\s\S]*?color:\s*#10B981/, "queue-modal.css approve button must use #10B981 outlined border and text");
assert.match(queueCss, /\.pill-btn\.reject[\s\S]*?border:\s*1px solid #EF4444[\s\S]*?color:\s*#EF4444/, "queue-modal.css reject button must use #EF4444 outlined border and text");
assert.match(designSystemCss, /\.pill-btn\.approve[\s\S]*?border:\s*1px solid #10B981[\s\S]*?color:\s*#10B981/, "design-system.css approve button must use #10B981 outlined border and text");
assert.match(designSystemCss, /\.pill-btn\.reject[\s\S]*?border:\s*1px solid #EF4444[\s\S]*?color:\s*#EF4444/, "design-system.css reject button must use #EF4444 outlined border and text");

console.log("All modal queue, sidebar removal, table sizing, select-all removal, SVG + icons, and X button tests passed successfully!");


