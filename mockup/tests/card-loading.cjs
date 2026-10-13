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
    this.classList = {
      contains: name => this.className.split(' ').includes(name),
      add: name => { this.className += ` ${name}`; },
      remove: name => { this.className = this.className.split(' ').filter(value => value !== name).join(' '); }
    };
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  remove() { this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
  contains(element) { return this === element || this.children.some(child => child.contains(element)); }
  matches(selector) {
    return selector.split(',').some(part => {
      const value = part.trim();
      if (value.startsWith('.')) return this.classList.contains(value.slice(1));
      if (value === '[role="dialog"]') return this.getAttribute('role') === 'dialog';
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
}

function fixture(readyState = 'interactive') {
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
  const window = { setTimeout: (handler, delay) => timers.push({ handler, delay }) };
  const context = vm.createContext({ document, window, queueMicrotask: handler => microtasks.push(handler) });
  return {
    body, document, timers, listeners,
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

let routes = 0;
for (const group of ['admin', 'faculty', 'auth']) {
  const directory = path.join(__dirname, '../pages', group);
  for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.equal((html.match(/src="\.\.\/\.\.\/assets\/js\/card-loading\.js" defer/g) || []).length, 1, `${group}/${file} must include the shared loader exactly once`);
    routes++;
  }
}
assert.equal(routes, 26);
const css = fs.readFileSync(path.join(__dirname, '../assets/css/components.css'), 'utf8');
assert.match(css, /:is\(\.ui-card--loading, \.ui-loading-active\) > \.ui-loading-placeholder\s*\{[^}]*position:\s*absolute;/,
  'The overlay must stay out of layout even when auth styles position all direct card children relatively');
console.log('Card loading lifecycle, accessibility, exclusions, preserved content, and all 26 route integrations passed.');
