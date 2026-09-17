// Run: node mockup/tests/faculty-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const classes = new Set();
const nav = { id: "" };
let button;
const sidebar = {
  classList: {
    contains: (name) => classes.has(name),
    toggle(name) {
      classes.has(name) ? classes.delete(name) : classes.add(name);
    },
  },
  querySelector: (selector) => (selector === ".nav" ? nav : button),
  prepend: (element) => { button = element; },
};
const document = {
  querySelector: () => sidebar,
  createElement: () => ({
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this[name] = handler; },
  }),
};
class MutationObserver { observe() {} }

vm.runInNewContext(
  fs.readFileSync("mockup/assets/js/faculty-sidebar.js", "utf8"),
  { document, MutationObserver },
);
assert.equal(nav.id, "faculty-navigation");
assert.equal(button.attributes["aria-expanded"], "true");
button.click();
assert(classes.has("sidebar-collapsed"));
assert.equal(button.attributes["aria-label"], "Expand sidebar");
button.click();
assert(!classes.has("sidebar-collapsed"));
assert.equal(button.attributes["aria-label"], "Collapse sidebar");
console.log("Faculty sidebar toggle checks passed.");
