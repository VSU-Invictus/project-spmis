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
