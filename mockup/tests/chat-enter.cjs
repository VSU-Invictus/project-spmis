// Run: node mockup/tests/chat-enter.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "../pages/faculty/chat.html"), "utf8");
const start = html.indexOf('        $("#chat-prompt").onkeydown');
const end = html.indexOf('        $("#retry").onclick', start);
assert.ok(start >= 0 && end > start, "Chat handlers must exist");
const input = { value: "" }, send = {}, messages = [];
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
assert.equal(input.value, "");
console.log("Chat Enter checks passed.");
