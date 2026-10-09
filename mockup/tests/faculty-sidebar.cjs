// Run: node mockup/tests/faculty-sidebar.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const rootClasses = new Set(["sidebar-collapsed"]);
const stored = { "faculty-sidebar-collapsed": "true", "faculty-demo-v1": "data" };

let logoutBtn;
let createdDialog = null;

const createEl = (tag) => {
  const el = {
    tagName: tag.toUpperCase(),
    attributes: {},
    className: "",
    innerHTML: "",
    returnValue: "",
    handlers: {},
    setAttribute(name, val) { this.attributes[name] = val; },
    getAttribute(name) { return this.attributes[name]; },
    addEventListener(evt, fn) {
      this.handlers[evt] = fn;
    },
    querySelector(sel) {
      if (sel === 'button[value="confirm"]') {
        return {
          addEventListener(evt, fn) { this.handlers = this.handlers || {}; this.handlers[evt] = fn; }
        };
      }
      if (sel === 'button[value="cancel"]') {
        return {
          addEventListener(evt, fn) { this.handlers = this.handlers || {}; this.handlers[evt] = fn; }
        };
      }
      if (sel === 'form') {
        return {
          addEventListener(evt, fn) { this.handlers = this.handlers || {}; this.handlers[evt] = fn; }
        };
      }
      return null;
    },
    showModal() { this.open = true; },
    close() {
      this.open = false;
      this.handlers.close?.();
    }
  };
  return el;
};

logoutBtn = {
  handlers: {},
  addEventListener(evt, fn) { this.handlers[evt] = fn; },
  click() { this.handlers.click?.({ preventDefault() {} }); }
};

const document = {
  readyState: "complete",
  documentElement: {
    classList: {
      remove(name) { rootClasses.delete(name); },
      add(name) { rootClasses.add(name); },
    },
  },
  body: {
    appendChild(el) { createdDialog = el; },
    append(el) { createdDialog = el; },
  },
  querySelector(sel) {
    if (sel === '.logout-dialog') return createdDialog;
    return null;
  },
  querySelectorAll(sel) {
    if (sel === '.sidebar-logout-btn, .logout-btn') return [logoutBtn];
    return [];
  },
  getElementById() { return null; },
  createElement(tag) {
    const el = createEl(tag);
    if (tag.toLowerCase() === "dialog") createdDialog = el;
    return el;
  }
};

const sessionStorage = {
  getItem: (key) => stored[key] ?? null,
  setItem: (key, value) => { stored[key] = value; },
  removeItem: (key) => { delete stored[key]; },
};

const location = { href: "faculty/dashboard.html" };
const window = {
  setTimeout: (fn) => fn(),
};

vm.runInNewContext(
  fs.readFileSync("mockup/assets/js/faculty-sidebar.js", "utf8"),
  { document, location, window, sessionStorage },
);

// 1. Check collapsed state removal
assert.equal(stored["faculty-sidebar-collapsed"], undefined, "Legacy collapsed storage must be removed");
assert(!rootClasses.has("sidebar-collapsed"), "Root element must not be collapsed");

// 2. Check logout dialog initialization
assert.ok(createdDialog, "Logout dialog should be created");
assert.ok(createdDialog.innerHTML.includes("ui-btn-outline"), "Cancel button must use outline style");
assert.ok(createdDialog.innerHTML.includes("ui-btn-primary"), "Log out button must use primary style");

// 3. Check trigger open
logoutBtn.click();
assert.equal(createdDialog.open, true, "Dialog must open when logout button is clicked");

// 4. Check cancel
createdDialog.returnValue = "cancel";
createdDialog.close();
assert.equal(location.href, "faculty/dashboard.html", "Cancel must not redirect");

// 5. Check confirm
logoutBtn.click();
createdDialog.returnValue = "confirm";
createdDialog.close();
assert.equal(stored["faculty-demo-v1"], undefined, "Confirming logout must clear session");
assert.equal(location.href, "../auth/signin.html", "Confirming logout must redirect to signin");

console.log("Faculty sidebar checks passed.");
