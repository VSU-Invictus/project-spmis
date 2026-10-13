// Run: node mockup/tests/chat-enter.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "../pages/faculty/chat.html"), "utf8");
const start = html.indexOf('        $("#chat-prompt").onkeydown');
const end = html.indexOf('        if ($("#retry"))', start);
assert.ok(start >= 0 && end > start, "Chat handlers must exist");
const input = { value: "", style: {} }, send = {}, messages = [];
let submissions = 0;
const form = {
  requestSubmit(button) {
    assert.equal(button, send);
    submissions++;
    // Model the textarea's native required validation.
    if (input.value) this.onsubmit({ preventDefault() {} });
  },
};
const context = vm.createContext({
  $: (selector) => ({ "#chat-prompt": input, "#chat-form": form, "#send": send })[selector],
  busy: false,
  lastPrompt: "",
  message: (role, text) => messages.push([role, text]),
  generate: () => { context.busy = true; },
});
vm.runInContext(html.slice(start, end), context);
function key(overrides = {}) {
  let prevented = false;
  input.onkeydown({ key: "Enter", preventDefault() { prevented = true; }, ...overrides });
  return prevented;
}

input.value = "  Research experience?  ";
assert.equal(key(), true);
assert.deepEqual(messages, [["You", "Research experience?"]]);
assert.equal(input.value, "");
assert.equal(submissions, 1);
input.value = "Keep this draft";
key();
assert.equal(messages.length, 1, "Busy submissions must be ignored");
assert.equal(input.value, "Keep this draft");
context.busy = false;
const before = submissions;
assert.equal(key({ repeat: true }), true);
assert.equal(key({ shiftKey: true }), false);
assert.equal(key({ isComposing: true }), false);
assert.equal(key({ key: "a" }), false);
assert.equal(submissions, before);
for (const blank of ["", " \n\t "]) {
  input.value = blank;
  key();
}
assert.equal(messages.length, 1, "Blank messages must be ignored");
input.value = "Button still works";
form.requestSubmit(send);
assert.deepEqual(messages[1], ["You", "Button still works"]);
console.log("Chat Enter checks passed.");

// Test prompt card automatic chat submission
const cardsSection = html.indexOf('        function sendCardPrompt(prompt) {');
assert.ok(cardsSection > 0, "Prompt card click handler must exist in chat.html");

const mockCard = {
  dataset: { prompt: "Which students have research experience?" },
  onclick: null,
  onkeydown: null,
};
let docClickListener = null;
const queryContext = vm.createContext({
  $: (selector) => ({ "#chat-prompt": input, "#chat-form": form, "#send": send })[selector],
  document: {
    querySelectorAll: (sel) => sel === '.ui-chat-prompt-card[data-prompt]' ? [mockCard] : [],
    addEventListener: (evt, fn) => { if (evt === 'click') docClickListener = fn; },
  },
  busy: false,
  lastPrompt: "",
  message: (role, text) => messages.push([role, text]),
  generate: () => { queryContext.busy = true; },
});
const addEventStart = html.indexOf('document.addEventListener("click"', cardsSection);
const cardBlockEnd = html.indexOf('});', addEventStart) + 3;
vm.runInContext(html.slice(cardsSection, cardBlockEnd), queryContext);
assert.equal(typeof mockCard.onclick, "function");
mockCard.onclick({ preventDefault() {} });
assert.deepEqual(messages[messages.length - 1], ["You", "Which students have research experience?"]);
assert.equal(queryContext.busy, true);
assert.equal(queryContext.lastPrompt, "Which students have research experience?");

// Test event delegation
queryContext.busy = false;
mockCard.closest = (sel) => sel === ".ui-chat-prompt-card[data-prompt]" ? mockCard : null;
assert.equal(typeof docClickListener, "function");
docClickListener({ target: mockCard });
assert.deepEqual(messages[messages.length - 1], ["You", "Which students have research experience?"]);
assert.equal(queryContext.busy, true);

// Check CSS styling
const css = fs.readFileSync(path.join(__dirname, "../assets/css/components.css"), "utf8");
assert.ok(css.includes(".view-profile-btn:hover") && css.includes("var(--primary"), "View Full Profile hover styling must be orange");
assert.ok(css.includes(".ui-chat-prompt-card") && css.includes("cursor: pointer !important"), "Prompt cards must have cursor pointer");
assert.ok(css.includes(".ui-chat-prompt-card:hover") && css.includes("border-color: var(--primary"), "Prompt cards must have terracotta hover effect");

console.log("Chat prompt card and View Full Profile hover checks passed.");

