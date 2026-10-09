// Run: node mockup/tests/auth-routing.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const authDir = path.join(__dirname, '../pages/auth');
const signin = fs.readFileSync(path.join(authDir, 'signin.html'), 'utf8');

for (const file of ['signin.html', 'pending-verification.html']) {
  const html = fs.readFileSync(path.join(authDir, file), 'utf8');
  const links = [...html.matchAll(/<a\b([^>]*\bdata-dashboard-link[^>]*)>([^<]+)<\/a>/g)];
  assert.equal(links.length, file === 'signin.html' ? 4 : 2);
  for (const [, attributes, label] of links) {
    const href = attributes.match(/href="([^"]+)"/)[1];
    const role = label === 'Admin User' ? 'admin' : 'faculty';
    assert.equal(href, `../${role}/dashboard.html`);
    assert.ok(fs.existsSync(path.resolve(authDir, href)), `${file}: destination must exist`);
  }
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script);
  for (const [, href] of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.resolve(authDir, href)), `${file}: stylesheet must exist`);
  }
}

// Run the actual route and keyboard handlers against a small DOM harness.
const start = signin.indexOf('        const syncGoogleRoute =');
const end = signin.indexOf("        document.getElementById('use-another-account')", start);
assert.ok(start > 0 && end > start);
const code = signin.slice(start, end);
function harness(initialUrl) {
  const events = {};
  const viewport = { inert: false };
  const document = { activeElement: null, addEventListener: (name, fn) => { events[name] = fn; } };
  function control() {
    return { disabled: false, focus() { document.activeElement = this; },
      getClientRects: () => [1], addEventListener(name, fn) { this[name] = fn; } };
  }
  const trigger = control(), close = control(), last = control();
  const classes = new Set(['hidden']);
  const overlay = {
    classList: { contains: name => classes.has(name), toggle(name, enabled) {
      if (enabled) classes.add(name); else classes.delete(name);
    } },
    querySelectorAll: () => [close, last],
    addEventListener(name, fn) { this[name] = fn; },
  };
  document.getElementById = id => ({ 'trigger-google-btn': trigger, 'close-google': close })[id];
  document.querySelector = () => viewport;
  const window = { location: { href: initialUrl },
    history: { pushState(_, __, url) { window.location.href = String(url); },
      replaceState(_, __, url) { window.location.href = String(url); } },
    addEventListener: (name, fn) => { events[name] = fn; },
  };
  vm.runInNewContext(code, { document, window, overlay, URL, resetGoogleFlow() {} });
  const key = (name, shiftKey = false) => {
    let prevented = false;
    events.keydown({ key: name, shiftKey, preventDefault() { prevented = true; } });
    return prevented;
  };
  return { window, document, viewport, overlay, trigger, close, last, events, key };
}
const baseUrl = 'https://example.test/mockup/pages/auth/signin.html?source=preview#entry';
const page = harness(baseUrl);
page.trigger.click();
assert.equal(new URL(page.window.location.href).searchParams.get('account'), 'google');
assert.equal(new URL(page.window.location.href).searchParams.get('source'), 'preview');
assert.equal(new URL(page.window.location.href).hash, '#entry');
assert.equal(page.viewport.inert, true);
assert.equal(page.overlay.classList.contains('hidden'), false);
assert.equal(page.document.activeElement, page.close);
assert.equal(page.key('Tab', true), true);
assert.equal(page.document.activeElement, page.last);
assert.equal(page.key('Tab'), true);
assert.equal(page.document.activeElement, page.close);
assert.equal(page.key('Escape'), true);
assert.equal(page.window.location.href, baseUrl);
assert.equal(page.viewport.inert, false);
assert.equal(page.document.activeElement, page.trigger);
assert.equal(page.key('Tab'), false);

const deepLink = baseUrl.replace('?source=preview', '?source=preview&account=google');
const direct = harness(deepLink);
assert.equal(direct.overlay.classList.contains('hidden'), false);
direct.window.location.href = baseUrl;
direct.events.popstate();
assert.equal(direct.viewport.inert, false);
direct.window.location.href = deepLink;
direct.events.popstate();
assert.equal(direct.viewport.inert, true);
direct.overlay.click({ target: direct.overlay });
assert.equal(direct.overlay.classList.contains('hidden'), true);
assert.equal(direct.window.location.href, baseUrl);
console.log('Auth dashboard links, asset paths, script syntax, route state, and keyboard checks passed.');
