// Run: node mockup/tests/card-loading.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/card-loading.js'), 'utf8');

class Element {
  constructor(tag = 'div', classes = '') {
    this.tagName = tag;
    this.className = classes;
    this.children = [];
    this.attributes = new Map();
    this.dataset = {};
    this.inert = false;
    this.textContent = '';
    this.visible = true;
    this.height = 24;
    this.classList = {
      contains: name => this.className.split(' ').includes(name),
      add: name => { this.className += ` ${name}`; },
      remove: name => { this.className = this.className.split(' ').filter(value => value !== name).join(' '); }
    };
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  get parentNode() { return this.parentElement; }
  get childNodes() { return this.children; }
  get firstChild() { return this.children[0]; }
  appendChild(child) {
    if (child.parentElement) child.remove();
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child, reference) {
    if (child.parentElement) child.remove();
    child.parentElement = this;
    this.children.splice(this.children.indexOf(reference), 0, child);
  }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }
  contains(element) { return this === element || this.children.some(child => child.contains(element)); }
  matches(selector) {
    return selector.split(',').some(part => {
      const value = part.trim();
      if (value.startsWith('.')) return this.classList.contains(value.slice(1));
      const attribute = value.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attribute) return attribute[2] === undefined ? this.attributes.has(attribute[1]) : this.getAttribute(attribute[1]) === attribute[2];
      if (value.startsWith('[')) return this.attributes.has(value.slice(1, -1));
      return this.tagName === value;
    });
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector); }
  querySelector(selector) {
    for (const child of this.children) {
      if (child.matches(selector)) return child;
      const match = child.querySelector(selector);
      if (match) return match;
    }
    return null;
  }
  getClientRects() { return this.visible ? [{}] : []; }
  getBoundingClientRect() { return { height: this.height }; }
}

function fixture(readyState = 'interactive', options = {}) {
  const body = new Element('body');
  const listeners = {}, microtasks = [], timers = [];
  const document = {
    readyState, body, activeElement: body,
    createElement: tag => new Element(tag),
    addEventListener: (name, handler) => { listeners[name] = handler; },
    querySelectorAll(selector) {
      const matches = [];
      function visit(element) {
        if (element.matches(selector)) matches.push(element);
        element.children.forEach(visit);
      }
      visit(body);
      return matches;
    }
  };
  const sessionStorage = options.sessionStorage || (options.storage ? {
    getItem: key => options.storage[key] ?? null,
    setItem: (key, val) => { options.storage[key] = String(val); },
    removeItem: key => { delete options.storage[key]; },
    clear: () => { Object.keys(options.storage).forEach(k => delete options.storage[k]); }
  } : undefined);
  const location = options.location || (options.pathname ? {
    pathname: options.pathname,
    href: `http://localhost/mockup/pages/${options.pathname}`
  } : undefined);
  const window = {
    setTimeout: (handler, delay) => timers.push({ handler, delay }),
    getComputedStyle: () => ({ fontSize: '16px', lineHeight: '24px' }),
    ...(sessionStorage ? { sessionStorage } : {}),
    ...(location ? { location } : {}),
    ...(options.window || {})
  };
  const context = vm.createContext({
    document,
    window,
    ...(sessionStorage ? { sessionStorage } : {}),
    queueMicrotask: handler => microtasks.push(handler)
  });
  return {
    body, document, window, timers, listeners,
    run: () => vm.runInContext(source, context),
    flush: () => { while (microtasks.length) microtasks.shift()(); }
  };
}

const app = fixture();
const metric = app.body.appendChild(new Element('a', 'ui-card ui-dashboard-metric'));
const original = metric.appendChild(new Element('strong'));
original.textContent = '24';
const interactive = app.body.appendChild(new Element('section', 'ui-card'));
const nested = interactive.appendChild(new Element('a', 'ui-card-interactive'));
const form = app.body.appendChild(new Element('form', 'ui-card'));
const field = form.appendChild(new Element('input'));
field.value = 'Unsaved draft';
const retained = app.body.appendChild(new Element('section', 'ui-card'));
retained.setAttribute('aria-busy', 'false');
retained.inert = true;
const information = app.body.appendChild(new Element('main', 'content-box'));
information.setAttribute('data-card-loading', '');
const hidden = app.body.appendChild(new Element('section', 'ui-card'));
hidden.setAttribute('hidden', '');
const dialog = app.body.appendChild(new Element('dialog'));
const modalCard = dialog.appendChild(new Element('section', 'ui-card'));
const nav = app.body.appendChild(new Element('nav'));
const account = nav.appendChild(new Element('div', 'ui-card'));
const focused = app.body.appendChild(new Element('form', 'ui-card'));
app.document.activeElement = focused.appendChild(new Element('input'));
const invisible = app.body.appendChild(new Element('div', 'ui-card'));
invisible.visible = false;
const table = app.body.appendChild(new Element('div', 'ui-table-wrap'));

app.run();
app.flush();
assert.equal(app.timers.length, 0, 'Deferred scripts must wait for DOMContentLoaded while readyState is interactive');
app.listeners.DOMContentLoaded();
// A page listener populates review cards before the queued loading initialization.
const review = app.body.appendChild(new Element('article', 'ui-card review'));
app.flush();
assert.equal(app.timers.length, 1);
assert.equal(app.timers[0].delay, 280);
for (const card of [metric, interactive, form, retained, information, review]) {
  assert.equal(card.getAttribute('aria-busy'), 'true');
  assert.equal(card.inert, true);
  assert.equal(card.children.at(-1).getAttribute('aria-hidden'), 'true');
}
assert.equal(metric.children[0], original, 'Retain the actual content for stable layout and existing event handlers');
assert.ok(metric.querySelector('.ui-skeleton--metric'), 'KPI values use metric skeletons');
assert.equal(field.value, 'Unsaved draft', 'Loading must preserve form state');
assert.ok(!information.className.includes('card'), 'Information panels must avoid the legacy card layout selector');
for (const card of [nested, hidden, modalCard, account, focused, invisible, table]) {
  assert.equal(card.getAttribute('aria-busy'), null, 'Nested links, navigation, dialogs, hidden panels, focus, and table loading stay untouched');
}
app.run();
app.flush();
assert.equal(app.timers.length, 1, 'Duplicate script inclusion must not start another loading cycle');
app.timers[0].handler();
for (const card of [metric, interactive, form, information, review]) {
  assert.equal(card.inert, false);
  assert.equal(card.getAttribute('aria-busy'), null, 'Restore absent aria-busy attributes');
  assert.equal(card.querySelector('.ui-loading-placeholder'), null);
}
assert.equal(retained.inert, true, 'Preserve a pre-existing inert state');
assert.equal(retained.getAttribute('aria-busy'), 'false');
assert.deepEqual(metric.children, [original]);
assert.equal(app.body.querySelector('.ui-loading-status').textContent, 'Card details loaded.');

const empty = fixture('complete');
empty.body.appendChild(new Element('div', 'ui-table-wrap'));
empty.run();
empty.flush();
assert.equal(empty.timers.length, 0, 'Table-only routes must leave their existing loader in control');
assert.equal(empty.body.querySelector('.ui-loading-status'), null);

const page = fixture();
function addText(parent, tag = 'p', classes = '') {
  const text = parent.appendChild(new Element(tag, classes));
  text.textContent = 'Original page text';
  text.appendChild(new Element('code')).textContent = '24-1-00001';
  return text;
}
const heading = addText(page.body, 'h1');
const inlineCode = heading.children[0];
const paragraph = addText(page.body);
paragraph.height = 72;
paragraph.setAttribute('aria-busy', 'false');
const nestedCaption = addText(paragraph, 'small');
const cardText = addText(page.body.appendChild(new Element('section', 'ui-card')));
const tableText = addText(page.body.appendChild(new Element('div', 'ui-table-wrap')));
const navText = addText(page.body.appendChild(new Element('nav')));
const formText = addText(page.body.appendChild(new Element('form')));
const modalText = addText(page.body.appendChild(new Element('div', 'modal-backdrop')));
const liveText = addText(page.body);
liveText.setAttribute('role', 'status');
const hiddenText = addText(page.body);
hiddenText.setAttribute('aria-hidden', 'true');
const linkText = addText(page.body);
linkText.appendChild(new Element('a'));
const focusedText = addText(page.body);
page.document.activeElement = focusedText.children[0];
page.run();
page.listeners.DOMContentLoaded();
page.flush();
assert.equal(page.timers.length, 1, 'Cards and typography must share one 280ms loading phase');
assert.equal(page.timers[0].delay, 280);
assert.equal(heading.getAttribute('aria-busy'), 'true');
assert.equal(heading.children[0].children[0], inlineCode, 'Loading must retain the original inline nodes');
assert.equal(paragraph.children[1].children.length, 3, 'Match the rendered paragraph line count');
assert.equal(paragraph.children[1].getAttribute('aria-hidden'), 'true');
assert.equal(nestedCaption.getAttribute('aria-busy'), null, 'Nested captions must not receive duplicate overlays');
for (const text of [cardText, tableText, navText, formText, modalText, liveText, hiddenText, linkText, focusedText]) {
  assert.equal(text.getAttribute('aria-busy'), null, 'Other loaders, controls, navigation, dialogs, live status, and focus stay untouched');
}
page.timers[0].handler();
assert.deepEqual(heading.children, [inlineCode], 'Restore the original DOM structure without cloning or replacing inline nodes');
assert.equal(heading.getAttribute('aria-busy'), null);
assert.equal(paragraph.getAttribute('aria-busy'), 'false');
assert.equal(paragraph.querySelector('.ui-text-loading-content'), null);
assert.equal(paragraph.querySelector('.ui-text-loading-placeholder'), null);
assert.equal(page.body.querySelector('.ui-loading-status').textContent, 'Page details loaded.');

const textOnly = fixture('complete');
const updated = addText(textOnly.body, 'h2');
textOnly.run();
textOnly.flush();
assert.equal(textOnly.timers.length, 1, 'Text-only pages also need skeleton loading');
updated.children.slice().forEach(child => child.remove());
const newer = updated.appendChild(new Element('span'));
newer.textContent = 'Newer page data';
textOnly.timers[0].handler();
assert.deepEqual(updated.children, [newer], 'Do not overwrite a newer page render with the original loading content');
assert.equal(updated.classList.contains('ui-text--loading'), false);

// Navigation Cache & Instant Page Revisit Verification (Issue #113)
const sharedStorage = {};

// 1. First visit to Faculty route: must show initial loading skeletons once and cache the route
const facultyDashboard1 = fixture('interactive', { storage: sharedStorage, pathname: 'faculty/dashboard.html' });
const facultyCard1 = facultyDashboard1.body.appendChild(new Element('section', 'ui-card'));
const facultyHeading1 = facultyDashboard1.body.appendChild(new Element('h1'));
facultyHeading1.textContent = 'Faculty Dashboard';
facultyDashboard1.run();
facultyDashboard1.listeners.DOMContentLoaded();
facultyDashboard1.flush();
assert.equal(facultyDashboard1.timers.length, 1, 'First visit to Faculty route must schedule initial loading phase');
assert.equal(facultyCard1.getAttribute('aria-busy'), 'true');
assert.ok(facultyCard1.querySelector('.ui-loading-placeholder'), 'First visit displays card skeleton');
assert.ok(facultyHeading1.classList.contains('ui-text--loading'), 'First visit displays text skeleton');

// Complete initial loading: saves to cache
facultyDashboard1.timers[0].handler();
assert.equal(facultyCard1.getAttribute('aria-busy'), null);
assert.equal(facultyCard1.querySelector('.ui-loading-placeholder'), null);
assert.ok(sharedStorage['spmis-navigation-cache'], 'Route must be written to navigation cache in sessionStorage');
assert.ok(sharedStorage['spmis-navigation-cache'].includes('faculty/dashboard.html'), 'Cache must include faculty/dashboard.html');

// 2. Navigate away to another page (Faculty Students): uncached, so it displays loading once
const facultyStudents = fixture('interactive', { storage: sharedStorage, pathname: 'faculty/students.html' });
const studentsCard = facultyStudents.body.appendChild(new Element('div', 'ui-card'));
facultyStudents.run();
facultyStudents.listeners.DOMContentLoaded();
facultyStudents.flush();
assert.equal(facultyStudents.timers.length, 1, 'First visit to another page must schedule loading once');
assert.equal(studentsCard.getAttribute('aria-busy'), 'true');
facultyStudents.timers[0].handler();
assert.ok(sharedStorage['spmis-navigation-cache'].includes('faculty/students.html'));

// 3. Revisit previously loaded page (Faculty Dashboard): must render view instantly from cache with zero skeleton flashes or timers
const facultyDashboardRevisit = fixture('interactive', { storage: sharedStorage, pathname: 'faculty/dashboard.html' });
const revisitCard = facultyDashboardRevisit.body.appendChild(new Element('section', 'ui-card'));
const revisitHeading = facultyDashboardRevisit.body.appendChild(new Element('h1'));
revisitHeading.textContent = 'Faculty Dashboard';
facultyDashboardRevisit.run();
facultyDashboardRevisit.listeners.DOMContentLoaded();
facultyDashboardRevisit.flush();
assert.equal(facultyDashboardRevisit.timers.length, 0, 'Revisiting cached Faculty page must NOT schedule loading timers');
assert.equal(revisitCard.getAttribute('aria-busy'), null, 'Cached card must not have aria-busy set');
assert.equal(revisitCard.querySelector('.ui-loading-placeholder'), null, 'Cached card must render instantly without skeleton placeholder');
assert.equal(revisitHeading.classList.contains('ui-text--loading'), false, 'Cached heading must render instantly without text skeleton');
assert.equal(facultyDashboardRevisit.body.querySelector('.ui-loading-status'), null, 'No loading status element created on instant cached revisit');

// 4. First visit and revisit to every Admin route: must follow the same instant cache contract
const adminRoutes = [
  'admin/dashboard.html',
  'admin/students.html',
  'admin/departments.html',
  'admin/programs.html',
  'admin/faculty.html',
  'admin/audit-log.html',
  'admin/student-applications.html',
  'admin/department-applications.html',
  'admin/program-applications.html',
  'admin/faculty-applications.html'
];

adminRoutes.forEach(route => {
  // First uncached visit: preserve the existing initial loading skeleton and cache the route.
  const first = fixture('interactive', { storage: sharedStorage, pathname: route });
  const firstCard = first.body.appendChild(new Element('section', 'ui-card'));
  const firstHeading = first.body.appendChild(new Element('h1'));
  firstHeading.textContent = 'Admin page';
  first.run();
  first.listeners.DOMContentLoaded();
  first.flush();
  assert.equal(first.timers.length, 1, `First visit to ${route} must schedule initial loading once`);
  assert.equal(firstCard.getAttribute('aria-busy'), 'true', `First visit to ${route} must show the card skeleton`);
  assert.ok(firstCard.querySelector('.ui-loading-placeholder'), `First visit to ${route} must display a card skeleton`);
  assert.ok(firstHeading.classList.contains('ui-text--loading'), `First visit to ${route} must display a text skeleton`);
  first.timers[0].handler();
  assert.equal(firstCard.getAttribute('aria-busy'), null, `Completed load on ${route} must clear aria-busy`);
  assert.ok(sharedStorage['spmis-navigation-cache'].includes(route), `${route} must be written to the navigation cache`);

  // Revisit within the same session: instant render, no skeletons, no timers.
  const revisit = fixture('interactive', { storage: sharedStorage, pathname: route });
  const revisitCard = revisit.body.appendChild(new Element('section', 'ui-card'));
  const revisitHeading = revisit.body.appendChild(new Element('h1'));
  revisitHeading.textContent = 'Admin page';
  revisit.run();
  revisit.listeners.DOMContentLoaded();
  revisit.flush();
  assert.equal(revisit.timers.length, 0, `Revisiting cached ${route} must NOT schedule loading timers`);
  assert.equal(revisitCard.getAttribute('aria-busy'), null, `Cached ${route} card must not have aria-busy set`);
  assert.equal(revisitCard.querySelector('.ui-loading-placeholder'), null, `Cached ${route} must render instantly without a card skeleton`);
  assert.equal(revisitHeading.classList.contains('ui-text--loading'), false, `Cached ${route} must render instantly without a text skeleton`);
  assert.equal(revisit.body.querySelector('.ui-loading-status'), null, `No loading status element created on instant cached revisit of ${route}`);
});

let routes = 0;
for (const group of ['admin', 'faculty', 'auth']) {
  const directory = path.join(__dirname, '../pages', group);
  for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.equal((html.match(/src="\.\.\/\.\.\/assets\/js\/card-loading\.js" defer/g) || []).length, 1, `${group}/${file} must include the shared loader exactly once`);
    assert.match(html, /href="\.\.\/\.\.\/assets\/css\/components\.css(?:\?[^\"]*)?"/, `${group}/${file} must load the shared text skeleton styles`);
    routes++;
  }
}
assert.equal(routes, 26);
const css = fs.readFileSync(path.join(__dirname, '../assets/css/components.css'), 'utf8');
assert.match(css, /:is\(\.ui-card--loading, \.ui-loading-active\) > \.ui-loading-placeholder\s*\{[^}]*position:\s*absolute;/,
  'The overlay must stay out of layout even when auth styles position all direct card children relatively');
console.log('Card/text loading lifecycle, navigation cache, line counts, accessibility, exclusions, preserved nodes/newer content, and all 26 route integrations passed.');
