import type { ReviewDocument, RichTextRun, ReviewBlock } from './ReviewDocumentView';

function parseInlineRuns(text: string): RichTextRun[] {
  if (!text) return [{ text: '' }];

  const runs: RichTextRun[] = [];
  // Match ***bold italic***, **bold**, or *italic*
  const tokenRegex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*\n]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[2] !== undefined) {
      runs.push({ text: match[2], bold: true, italic: true });
    } else if (match[3] !== undefined) {
      runs.push({ text: match[3], bold: true });
    } else if (match[4] !== undefined) {
      runs.push({ text: match[4], italic: true });
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  return runs.length > 0 ? runs : [{ text }];
}

export function serializeEditorTextToDocument(rawText: string): ReviewDocument {
  const normalized = rawText.replace(/\r\n/g, '\n');
  if (!normalized.trim()) {
    return {
      blocks: [
        {
          type: 'paragraph',
          content: [{ text: '' }],
        },
      ],
    };
  }

  const lines = normalized.split('\n');
  const blocks: ReviewBlock[] = [];
  let paragraphLines: string[] = [];
  let bulletItems: RichTextRun[][] = [];
  let orderedItems: RichTextRun[][] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const joined = paragraphLines.join('\n');
      blocks.push({
        type: 'paragraph',
        content: parseInlineRuns(joined),
      });
      paragraphLines = [];
    }
  };

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      blocks.push({
        type: 'bullet_list',
        items: bulletItems,
      });
      bulletItems = [];
    }
  };

  const flushOrdered = () => {
    if (orderedItems.length > 0) {
      blocks.push({
        type: 'ordered_list',
        items: orderedItems,
      });
      orderedItems = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[-*•]\s+(.*)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();
      flushOrdered();
      bulletItems.push(parseInlineRuns(bulletMatch[1] || ' '));
    } else if (orderedMatch) {
      flushParagraph();
      flushBullets();
      orderedItems.push(parseInlineRuns(orderedMatch[1] || ' '));
    } else if (line.trim() === '') {
      flushParagraph();
      flushBullets();
      flushOrdered();
    } else {
      flushBullets();
      flushOrdered();
      paragraphLines.push(line);
    }
  }

  flushParagraph();
  flushBullets();
  flushOrdered();

  if (blocks.length === 0) {
    return {
      blocks: [
        {
          type: 'paragraph',
          content: [{ text: normalized.trim() }],
        },
      ],
    };
  }

  return { blocks };
}

function serializeRunsToText(runs: readonly RichTextRun[]): string {
  return runs
    .map((run) => {
      const text = run.text ?? '';
      if (!text) return '';
      if (run.bold && run.italic) return `***${text}***`;
      if (run.bold) return `**${text}**`;
      if (run.italic) return `*${text}*`;
      return text;
    })
    .join('');
}

export function deserializeDocumentToEditorText(
  document?: ReviewDocument | null,
  fallbackText?: string | null
): string {
  const blocks = document?.blocks ?? [];
  if (blocks.length === 0) {
    return fallbackText ?? '';
  }

  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        return serializeRunsToText(block.content);
      }
      if (block.type === 'bullet_list') {
        return block.items.map((item) => `- ${serializeRunsToText(item)}`).join('\n');
      }
      if (block.type === 'ordered_list') {
        return block.items.map((item, idx) => `${idx + 1}. ${serializeRunsToText(item)}`).join('\n');
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] ?? c
  );
}

function serializeRunsToHtml(runs: readonly RichTextRun[]): string {
  return runs
    .map((run) => {
      const escaped = escapeHtml(run.text ?? '').replace(/\n/g, '<br>');
      if (!escaped) return '';
      if (run.bold && run.italic) return `<strong><em>${escaped}</em></strong>`;
      if (run.bold) return `<strong>${escaped}</strong>`;
      if (run.italic) return `<em>${escaped}</em>`;
      return escaped;
    })
    .join('');
}

export function deserializeDocumentToEditorHtml(
  document?: ReviewDocument | null,
  fallbackText?: string | null
): string {
  const blocks = document?.blocks ?? [];
  if (blocks.length === 0) {
    if (!fallbackText) return '';
    return escapeHtml(fallbackText).replace(/\n/g, '<br>');
  }

  const parts = blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        const inner = serializeRunsToHtml(block.content);
        return inner ? `<p>${inner}</p>` : '';
      }
      if (block.type === 'bullet_list') {
        const items = block.items
          .map((item) => `<li>${serializeRunsToHtml(item)}</li>`)
          .join('');
        return items ? `<ul>${items}</ul>` : '';
      }
      if (block.type === 'ordered_list') {
        const items = block.items
          .map((item) => `<li>${serializeRunsToHtml(item)}</li>`)
          .join('');
        return items ? `<ol>${items}</ol>` : '';
      }
      return '';
    })
    .filter(Boolean);

  return parts.join('');
}

interface InlineFormat {
  bold?: boolean;
  italic?: boolean;
}

function appendTextRun(runs: RichTextRun[], rawText: string, format: InlineFormat): void {
  const text = rawText.replace(/\u200B/g, '');
  if (!text) return;

  const bold = format.bold || undefined;
  const italic = format.italic || undefined;
  const previous = runs[runs.length - 1];
  if (previous && Boolean(previous.bold) === Boolean(bold) && Boolean(previous.italic) === Boolean(italic)) {
    previous.text = `${previous.text ?? ''}${text}`;
    return;
  }
  runs.push({ text, ...(bold ? { bold: true } : {}), ...(italic ? { italic: true } : {}) });
}

function appendInlineNode(node: Node, runs: RichTextRun[], format: InlineFormat): void {
  if (node.nodeType === Node.TEXT_NODE) {
    appendTextRun(runs, node.nodeValue ?? '', format);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  if (tag === 'br') {
    appendTextRun(runs, '\n', format);
    return;
  }

  const childFormat: InlineFormat = {
    bold: format.bold || tag === 'strong' || tag === 'b',
    italic: format.italic || tag === 'em' || tag === 'i',
  };
  for (const child of Array.from(element.childNodes)) {
    appendInlineNode(child, runs, childFormat);
  }

  if ((tag === 'p' || tag === 'div') && runs.length > 0 && !runs[runs.length - 1].text?.endsWith('\n')) {
    appendTextRun(runs, '\n', format);
  }
}

function serializeInlineNodes(nodes: Iterable<Node>): RichTextRun[] {
  const runs: RichTextRun[] = [];
  for (const node of nodes) appendInlineNode(node, runs, {});
  return runs.length > 0 ? runs : [{ text: '' }];
}

function runsHaveContent(runs: readonly RichTextRun[]): boolean {
  return runs.some((run) => Boolean(run.text?.trim()));
}

function isStructuralElement(node: Node): node is HTMLElement {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = (node as HTMLElement).tagName.toLowerCase();
  return tag === 'p' || tag === 'div' || tag === 'ul' || tag === 'ol';
}

/** Build the review contract document from editor nodes without parsing user text as markup. */
export function serializeEditorDomToDocument(root: HTMLElement): ReviewDocument {
  const blocks: ReviewBlock[] = [];

  const appendListBlock = (element: HTMLElement) => {
    const tag = element.tagName.toLowerCase();
    const items = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === 'li')
      .map((item) => serializeInlineNodes(Array.from(item.childNodes)))
      .filter(runsHaveContent);
    if (items.length > 0) {
      blocks.push(tag === 'ul' ? { type: 'bullet_list', items } : { type: 'ordered_list', items });
    }
  };

  const appendNodes = (nodes: readonly Node[]) => {
    let inlineNodes: Node[] = [];
    const flushInlineParagraph = () => {
      if (inlineNodes.length === 0) return;
      const content = serializeInlineNodes(inlineNodes);
      inlineNodes = [];
      if (runsHaveContent(content)) blocks.push({ type: 'paragraph', content });
    };

    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        inlineNodes.push(node);
        continue;
      }

      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        flushInlineParagraph();
        appendListBlock(element);
      } else if (tag === 'p' || tag === 'div') {
        flushInlineParagraph();
        const children = Array.from(element.childNodes);
        if (children.some(isStructuralElement)) {
          appendNodes(children);
        } else {
          blocks.push({ type: 'paragraph', content: serializeInlineNodes(children) });
        }
      } else {
        inlineNodes.push(node);
      }
    }
    flushInlineParagraph();
  };

  appendNodes(Array.from(root.childNodes));

  return blocks.length > 0
    ? { blocks }
    : { blocks: [{ type: 'paragraph', content: [{ text: '' }] }] };
}

/** Remove empty list rows when the editor loses focus, but keep empty paragraphs editable. */
export function removeEmptyListItemsFromEditorDom(root: HTMLElement): boolean {
  let removedAny = false;
  const lists = Array.from(root.querySelectorAll('ul, ol')).reverse();

  for (const list of lists) {
    for (const item of Array.from(list.children)) {
      if (item.tagName.toLowerCase() !== 'li') continue;
      const hasNestedList = item.querySelector('ul, ol') !== null;
      const hasText = (item.textContent ?? '').replace(/\u200B/g, '').trim().length > 0;
      if (!hasText && !hasNestedList) {
        item.remove();
        removedAny = true;
      }
    }

    if (!Array.from(list.children).some((item) => item.tagName.toLowerCase() === 'li')) {
      list.remove();
      removedAny = true;
    }
  }

  return removedAny;
}
