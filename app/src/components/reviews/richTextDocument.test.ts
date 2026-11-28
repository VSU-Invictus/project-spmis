// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { extractPlainText } from '../../lib/rules/review';
import { serializeEditorDomToDocument } from './richTextDocument';

describe('serializeEditorDomToDocument', () => {
  it('preserves literal asterisks in text and plain search text', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p>5*4*3</p><p>Earned A* in Calculus and A* in Physics</p>';

    const documentValue = serializeEditorDomToDocument(editor);

    expect(documentValue.blocks).toEqual([
      { type: 'paragraph', content: [{ text: '5*4*3' }] },
      { type: 'paragraph', content: [{ text: 'Earned A* in Calculus and A* in Physics' }] },
    ]);
    expect(extractPlainText(documentValue)).toBe('5*4*3 Earned A* in Calculus and A* in Physics');
  });

  it('does not reinterpret paragraph text that starts with list markers', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p>2026. Graduated top of class</p><p>- </p>';

    const documentValue = serializeEditorDomToDocument(editor);

    expect(documentValue.blocks).toEqual([
      { type: 'paragraph', content: [{ text: '2026. Graduated top of class' }] },
      { type: 'paragraph', content: [{ text: '- ' }] },
    ]);
  });

  it('preserves actual formatting and list structure from editor nodes', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<p><strong>Bold</strong> and <em>italic</em></p><ul><li>One</li><li><b>Two</b></li></ul><ol><li>First</li></ol>';

    const documentValue = serializeEditorDomToDocument(editor);

    expect(documentValue.blocks).toEqual([
      {
        type: 'paragraph',
        content: [
          { text: 'Bold', bold: true },
          { text: ' and ' },
          { text: 'italic', italic: true },
        ],
      },
      { type: 'bullet_list', items: [[{ text: 'One' }], [{ text: 'Two', bold: true }]] },
      { type: 'ordered_list', items: [[{ text: 'First' }]] },
    ]);
  });
});
