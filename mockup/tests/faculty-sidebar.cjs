// Run: node mockup/tests/faculty-sidebar.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sidebarSource = fs.readFileSync('mockup/assets/js/faculty-sidebar.js', 'utf8');
const logoutSource = fs.readFileSync('mockup/assets/js/logout-confirmation.js', 'utf8');

function fixture(role, query = '', scheme = 'https:') {
  const stored = { 'faculty-demo-v1': 'data', 'faculty-sidebar-collapsed': 'true' };
  const rootClasses = new Set(['sidebar-collapsed']);
  const windowHandlers = {};
  const dialogs = [], dialogOwners = [], styles = [], scripts = [], toasts = [], frames = [];
  let blocker = false, focused = false;
  const trigger = { focus() { focused = true; } };
  const siteRoot = scheme === 'file:' ? 'file:///D:/SPMIS' : 'https://spmis.test';
  const location = { href: `${siteRoot}/mockup/pages/${role}/dashboard.html${query}`, pathname: `/mockup/pages/${role}/dashboard.html` };
  const originalUrl = location.href;
  const history = {
    state: { existing: true }, entries: [location.href], index: 0,
    pushState(state, _, url) {
      this.state = state;
      location.href = String(url);
      this.entries = this.entries.slice(0, this.index + 1);
      this.entries.push(location.href);
      this.index++;
    },
    replaceState(state, _, url) {
      this.state = state;
      location.href = String(url);
      this.entries[this.index] = location.href;
    },
    back() { location.href = this.entries[--this.index]; windowHandlers.popstate(); },
    forward() { location.href = this.entries[++this.index]; windowHandlers.popstate(); }
  };
  function makeDocument() {
    const docHandlers = {};
    const doc = {
      currentScript: { src: `${siteRoot}/mockup/assets/js/logout-confirmation.js` },
      readyState: 'complete',
      documentElement: { classList: { remove: name => rootClasses.delete(name) } },
      head: { appendChild(el) { (el.tagName === 'script' ? scripts : styles).push(el); } },
      body: { appendChild(el) { dialogs.push(el); dialogOwners.push(doc); } },
      addEventListener(name, fn) { (docHandlers[name] ||= []).push(fn); },
      getElementById() { return null; },
      querySelector() { return trigger; },
      querySelectorAll(selector) {
        if (selector === 'iframe.sidebar-frame, iframe#sidebar-frame') return frames;
        return blocker ? [{ getClientRects: () => [1] }] : [];
      },
      createElement(tag) {
        const listeners = {};
        return {
          tagName: tag, open: false, returnValue: '',
          attributes: {}, setAttribute(name, value) { this.attributes[name] = value; },
          addEventListener: (name, fn) => listeners[name] = fn,
          showModal() { this.open = true; },
          close(value) { this.open = false; if (value !== undefined) this.returnValue = value; listeners.close(); },
          getBoundingClientRect: () => ({ left: 100, right: 500, top: 100, bottom: 300 }),
          dispatch(name, event) { listeners[name](event); }
        };
      },
      click() {
        for (const fn of docHandlers.click || []) fn({ target: { closest: () => trigger }, preventDefault() {} });
      }
    };
    return doc;
  }
  const document = makeDocument();
  const sessionStorage = { removeItem: key => delete stored[key] };
  const window = {
    document, location, history, sessionStorage,
    getComputedStyle: () => ({ display: 'flex', visibility: 'visible', opacity: '1' }),
    addEventListener: (name, fn) => windowHandlers[name] = fn,
    showSuccessToast: text => toasts.push(text), setTimeout: fn => fn()
  };
  window.parent = window;
  const run = (doc = document, win = window, source = logoutSource) =>
    vm.runInNewContext(source, { document: doc, window: win, sessionStorage, URL, WeakSet });
  if (role === 'faculty') {
    document.currentScript.src = `${siteRoot}/mockup/assets/js/faculty-sidebar.js`;
    run(document, window, sidebarSource);
    assert.equal(stored['faculty-sidebar-collapsed'], undefined);
    assert(!rootClasses.has('sidebar-collapsed'));
    assert.equal(scripts[0].src, `${siteRoot}/mockup/assets/js/logout-confirmation.js`);
    document.currentScript.src = `${siteRoot}/mockup/assets/js/logout-confirmation.js`;
  }
  run();
  const frameDocument = makeDocument();
  const frameHandlers = {};
  const frameParent = {
    get document() { throw new Error('Sidebar cannot access the parent DOM'); },
    postMessage(data) { windowHandlers.message({ data, source: frameWindow }); }
  };
  const frameWindow = {
    document: frameDocument, parent: frameParent,
    addEventListener: (name, fn) => frameHandlers[name] = fn,
    postMessage(data) { frameHandlers.message({ data, source: frameParent }); }
  };
  frames.push({ contentWindow: frameWindow, focus() {} });
  run(frameDocument, frameWindow);
  run(frameDocument, frameWindow);
  assert.deepEqual(dialogOwners, [document], 'Only the main document may own the modal');
  return {
    dialog: dialogs[0], location, history, stored, toasts, styles, originalUrl,
    get focused() { return focused; },
    get dialogCount() { return dialogs.length; },
    block(value) { blocker = value; }, click: () => frameDocument.click(),
    spoof() { windowHandlers.message({ data: { type: 'spmis:logout:request' }, source: {} }); },
    submit(value) {
      let prevented = false, stopped = false;
      dialogs[0].dispatch('submit', {
        submitter: { value }, preventDefault() { prevented = true; },
        stopImmediatePropagation() { stopped = true; }
      });
      assert(prevented && stopped, 'Logout must bypass generic form submission handlers');
    }
  };
}

for (const role of ['faculty', 'admin']) for (const scheme of ['https:', 'file:']) {
  const f = fixture(role, '?filter=active#results', scheme);
  assert.equal(f.dialogCount, 1, 'Page and repeated iframe loads must share one modal');
  assert.match(f.styles[0].href, /assets\/css\/logout-confirmation\.css$/);
  assert.match(f.dialog.innerHTML, new RegExp(`end your ${role} session`));
  assert.match(f.dialog.innerHTML, /ui-btn ui-btn-outline/);
  assert.match(f.dialog.innerHTML, /ui-btn ui-btn-primary/);
  assert.equal(f.dialog.attributes['aria-describedby'], 'ui-logout-description');
  f.spoof();
  assert.equal(f.dialog.open, false, 'Messages from unrelated windows must be ignored');
  f.click();
  assert.equal(f.dialog.open, true);
  assert.equal(f.history.entries.length, 2, 'Duplicate handlers must not add history entries');
  assert.equal(new URL(f.location.href).searchParams.get('logout'), 'true');
  assert.equal(new URL(f.location.href).searchParams.get('filter'), 'active');
  assert.equal(new URL(f.location.href).hash, '#results');
  assert.equal(f.history.state.existing, true);
  f.history.back();
  assert.equal(f.dialog.open, false, 'Back dismisses safely');
  assert.equal(f.stored['faculty-demo-v1'], 'data');
  f.history.forward();
  assert.equal(f.dialog.open, true, 'Forward restores confirmation');
  f.submit('cancel');
  assert.equal(new URL(f.location.href).searchParams.has('logout'), false);
  assert.equal(f.stored['faculty-demo-v1'], 'data');
  assert.equal(f.focused, true, 'Cancel returns focus to the sidebar trigger');
  f.click();
  let prevented = false;
  f.dialog.dispatch('cancel', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(f.dialog.open, false, 'Escape dismisses safely');
  f.click();
  f.dialog.dispatch('click', { target: f.dialog, clientX: 200, clientY: 200 });
  assert.equal(f.dialog.open, true, 'Clicking modal padding must not dismiss');
  f.dialog.dispatch('click', { target: f.dialog, clientX: 10, clientY: 10 });
  assert.equal(f.dialog.open, false, 'Backdrop dismisses safely');
  f.block(true);
  f.click();
  assert.equal(f.dialog.open, false, 'Logout must not stack over another modal');
  assert.equal(new URL(f.location.href).searchParams.has('logout'), false);
  assert.equal(f.toasts.length, 0, 'Dismissal must not show a success toast');
  f.block(false);
  f.click();
  f.submit('confirm');
  assert.equal(f.location.href, new URL('../auth/signin.html', f.originalUrl).href);
  assert.equal(f.stored['faculty-demo-v1'], role === 'faculty' ? undefined : 'data');
  assert.deepEqual(f.toasts, ['Logged out successfully']);
  const direct = fixture(role, '?logout=true&filter=active', scheme);
  assert.equal(direct.dialog.open, true, 'Deep links open confirmation');
  direct.submit('cancel');
  assert.equal(direct.stored['faculty-demo-v1'], 'data');
  assert.equal(new URL(direct.location.href).searchParams.get('filter'), 'active');
}

for (const role of ['faculty', 'admin']) {
  const html = fs.readFileSync(`mockup/components/navigation/sidebar-${role}.html`, 'utf8');
  assert.doesNotMatch(html, /\bconfirm\(|handleLogout/);
  assert.match(html, /assets\/js\/logout-confirmation\.js/);
}
assert.doesNotMatch(logoutSource, /\bconfirm\(/, 'No browser confirmation fallback');
for (const file of fs.readdirSync('mockup/pages/admin').filter(file => file.endsWith('.html'))) {
  const html = fs.readFileSync(`mockup/pages/admin/${file}`, 'utf8');
  assert.match(html, /<script[^>]+src="\.\.\/\.\.\/assets\/js\/logout-confirmation\.js"[^>]*defer/, `${file} must load logout in the main page`);
}
console.log('Main-page logout checks passed for both portals over HTTPS and file URLs with isolated sidebar frames.');
