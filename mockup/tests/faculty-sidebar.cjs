// Run: node mockup/tests/faculty-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const classes = new Set();
const rootClasses = new Set();
const nav = { id: "" };
let button;
let logout;
let logoutDialog;
let profileWrapped = false;
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
  querySelector(selector) {
    if (selector === ".nav") return nav;
    if (selector === ".sidebar-toggle") return button;
    if (selector === ".logout-button") return logout;
    if (selector === ".profile-link") return profile;
  },
  prepend: (element) => { button = element; },
};
const profile = {
  before: () => { profileWrapped = true; },
};
const document = {
  readyState: "complete",
  body: {
    append(element) { logoutDialog = element; },
  },
  documentElement: {
    classList: {
      toggle(name, enabled) {
        enabled ? rootClasses.add(name) : rootClasses.delete(name);
      },
    },
  },
  querySelector: () => sidebar,
  createElement(tag) {
    return {
      attributes: {},
      handlers: {},
      returnValue: "",
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) {
        this.handlers[name] = handler;
        if (name === "click") this.click = handler;
      },
      append(element) {
        if (tag === "div" && element !== profile) logout = element;
      },
      showModal() { this.open = true; },
      close() {
        this.open = false;
        this.handlers.close?.();
      },
    };
  },
};
const sessionStorage = {
  getItem: (key) => stored[key] ?? null,
  setItem: (key, value) => { stored[key] = value; },
  removeItem: (key) => { delete stored[key]; },
};
const location = { href: "faculty/dashboard.html" };
class MutationObserver { observe() {} }

vm.runInNewContext(
  fs.readFileSync("mockup/assets/js/faculty-sidebar.js", "utf8"),
  { document, location, MutationObserver, sessionStorage },
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
assert(profileWrapped);
assert.equal(logout.attributes["aria-label"], "Log out");
logout.click();
assert(logoutDialog.open, "Logout dialog must open");
logoutDialog.returnValue = "cancel";
logoutDialog.close();
assert.equal(location.href, "faculty/dashboard.html", "Cancel must keep the session");
logout.click();
logoutDialog.returnValue = "confirm";
logoutDialog.close();
assert.equal(location.href, "../auth/signup.html");
assert.equal(stored["faculty-demo-v1"], undefined);
assert.equal(stored["faculty-sidebar-collapsed"], undefined);
console.log("Faculty sidebar toggle checks passed.");
