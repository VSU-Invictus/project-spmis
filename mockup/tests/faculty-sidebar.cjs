// Run: node mockup/tests/faculty-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const classes = new Set();
const rootClasses = new Set();
const nav = { id: "" };
let button;
const stored = { "faculty-sidebar-collapsed": "true" };
const sidebar = {
  classList: {
    add: (name) => classes.add(name),
    contains: (name) => classes.has(name),
    toggle(name) {
      classes.has(name) ? classes.delete(name) : classes.add(name);
      return classes.has(name);
    },
  },
  querySelector: (selector) => (selector === ".nav" ? nav : button),
  prepend: (element) => { button = element; },
};
const document = {
  readyState: "complete",
  documentElement: {
    classList: {
      toggle(name, enabled) {
        enabled ? rootClasses.add(name) : rootClasses.delete(name);
      },
    },
  },
  querySelector: () => sidebar,
  createElement: () => ({
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this[name] = handler; },
  }),
};
const sessionStorage = {
  getItem: (key) => stored[key] ?? null,
  setItem: (key, value) => { stored[key] = value; },
};
class MutationObserver { observe() {} }

vm.runInNewContext(
  fs.readFileSync("mockup/assets/js/faculty-sidebar.js", "utf8"),
  { document, MutationObserver, sessionStorage },
);
assert.equal(nav.id, "faculty-navigation");
assert(classes.has("sidebar-collapsed"), "Saved collapsed state must be restored");
assert(rootClasses.has("sidebar-collapsed"), "Root state must prevent startup flicker");
assert(classes.has("sidebar-ready"), "Transitions must be enabled after restoration");
assert.equal(button.attributes["aria-expanded"], "false");
button.click();
assert(!classes.has("sidebar-collapsed"));
assert(!rootClasses.has("sidebar-collapsed"));
assert.equal(stored["faculty-sidebar-collapsed"], "false");
assert.equal(button.attributes["aria-label"], "Collapse sidebar");
button.click();
assert(classes.has("sidebar-collapsed"));
assert(rootClasses.has("sidebar-collapsed"));
assert.equal(stored["faculty-sidebar-collapsed"], "true");
assert.equal(button.attributes["aria-label"], "Expand sidebar");
console.log("Faculty sidebar toggle checks passed.");
