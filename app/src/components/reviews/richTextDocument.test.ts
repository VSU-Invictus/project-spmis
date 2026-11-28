// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { extractPlainText } from '../../lib/rules/review';
import { ReviewDocumentView } from './ReviewDocumentView';
import {
  deserializeDocumentToEditorHtml,
  removeEmptyListItemsFromEditorDom,
  serializeEditorDomToDocument,
} from './richTextDocument';
import type { ReviewDocument } from './ReviewDocumentView';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

function nodeSnapshot(node: Node): unknown {
  if (node.nodeType === Node.TEXT_NODE) return ['text', node.nodeValue];
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as Element;
  return [element.tagName.toLowerCase(), ...Array.from(element.childNodes).map(nodeSnapshot)];
}

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
    editor.innerHTML = '<p>2026. Graduated top of class</p><p>- literal dash</p>';

    const documentValue = serializeEditorDomToDocument(editor);

    expect(documentValue.blocks).toEqual([
      { type: 'paragraph', content: [{ text: '2026. Graduated top of class' }] },
      { type: 'paragraph', content: [{ text: '- literal dash' }] },
    ]);
    expect(extractPlainText(documentValue)).toBe('2026. Graduated top of class - literal dash');
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

  it('preserves lists nested in browser-generated div and paragraph wrappers', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<div><p>Lead text</p><div><ul><li><strong>Bullet One</strong></li><li>Bullet Two</li></ul></div><div><ol><li><em>Number One</em></li><li>Number Two</li></ol></div></div>';

    const documentValue = serializeEditorDomToDocument(editor);

    expect(documentValue.blocks).toEqual([
      { type: 'paragraph', content: [{ text: 'Lead text' }] },
      {
        type: 'bullet_list',
        items: [[{ text: 'Bullet One', bold: true }], [{ text: 'Bullet Two' }]],
      },
      {
        type: 'ordered_list',
        items: [[{ text: 'Number One', italic: true }], [{ text: 'Number Two' }]],
      },
    ]);
  });

  it('removes empty list rows on blur and excludes them from the saved document', () => {
    const editor = document.createElement('div');
    editor.innerHTML = '<ul><li>Bullet</li><li><br></li></ul><ol><li><br></li><li>Numbered</li></ol><ul><li></li></ul>';

    expect(serializeEditorDomToDocument(editor).blocks).toEqual([
      { type: 'bullet_list', items: [[{ text: 'Bullet' }]] },
      { type: 'ordered_list', items: [[{ text: 'Numbered' }]] },
    ]);

    expect(removeEmptyListItemsFromEditorDom(editor)).toBe(true);
    expect(Array.from(editor.querySelectorAll('li')).map((item) => item.textContent)).toEqual([
      'Bullet',
      'Numbered',
    ]);
    expect(editor.querySelectorAll('ul, ol')).toHaveLength(2);
  });

  it('renders saved documents identically in the editor and ReviewDocumentView', () => {
    const savedDocument: ReviewDocument = {
      blocks: [
        {
          type: 'paragraph',
          content: [
            { text: 'Rating 5*4*3 & <details>. ' },
            { text: 'Earned A* in Calculus', italic: true },
            { text: ' and A*', bold: true, italic: true },
            { text: '\nContinued line.' },
          ],
        },
        { type: 'bullet_list', items: [[{ text: 'First' }], [{ text: 'Second', bold: true }]] },
        { type: 'ordered_list', items: [[{ text: 'Third', italic: true }]] },
      ],
    };

    const editorRoot = document.createElement('div');
    editorRoot.innerHTML = deserializeDocumentToEditorHtml(savedDocument);
    const { container } = render(createElement(ReviewDocumentView, { document: savedDocument }));
    const viewRoot = container.querySelector('.review-body');

    expect(viewRoot).not.toBeNull();
    expect(Array.from(viewRoot!.childNodes).map(nodeSnapshot)).toEqual(
      Array.from(editorRoot.childNodes).map(nodeSnapshot)
    );
  });
});
