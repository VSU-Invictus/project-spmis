// Source-level accessible-name gate, not a replacement for a browser/screen-reader audit.
// Run: node mockup/tests/input-accessibility.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2] || '';
const text = html => html.replace(/<[^>]*>/g, '').trim();
function audit(source) {
  const html = source.replace(/<!--[\s\S]*?-->/g, '');
  const labels = [...html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)];
  const controls = [...html.matchAll(/<(?:input|select|textarea)\b[^>]*>|<\w+\b[^>]*contenteditable=["']true["'][^>]*>/gi)];
  return controls.filter(control => {
    const tag = control[0];
    if (['hidden', 'submit', 'reset', 'button'].includes(attr(tag, 'type'))) return false;
    if (attr(tag, 'aria-label').trim()) return false;
    const labelledBy = attr(tag, 'aria-labelledby').trim();
    if (labelledBy && labelledBy.split(/\s+/).every(id => {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const target = html.match(new RegExp(`<([\\w-]+)\\b[^>]*\\bid=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/\\1>`));
      return target && text(target[2]);
    })) return false;
    // Native labels name form controls; contenteditable requires ARIA.
    if (/contenteditable=/i.test(tag)) return true;
    const id = attr(tag, 'id');
    return !labels.some(label => text(label[2]) && (
      (id && attr(label[1], 'for') === id) ||
      (!attr(label[1], 'for') && control.index > label.index && control.index < label.index + label[0].length)
    ));
  });
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(dir, entry.name);
    return entry.isDirectory() ? files(filename) : /\.(html|js)$/.test(filename) ? [filename] : [];
  });
}
if (require.main === module) {
  let missing = 0;
  for (const file of files(root)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const control of audit(source)) {
      console.error(`${path.relative(root, file)}: ${control[0].replace(/\s+/g, ' ')}`);
      missing++;
    }
  }
  if (missing) { console.error(`${missing} controls lack explicit accessible names.`); process.exitCode = 1; }
  else console.log('All source input, select, textarea, and editable-text controls have accessible names.');
}
module.exports = { audit, files, attr };
