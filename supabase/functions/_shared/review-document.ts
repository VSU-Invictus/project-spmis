import { deidentifyText, type StudentNameRecord } from './deidentify.ts';
import { assertAllowedKeys, FunctionError } from './errors.ts';

type RichTextRun = { text: string; bold?: boolean; italic?: boolean };
type ReviewBlock =
  | { type: 'paragraph'; content: RichTextRun[] }
  | { type: 'bullet_list' | 'ordered_list'; items: RichTextRun[][] };

export interface ReviewDocument {
  blocks: ReviewBlock[];
}

function isRun(value: unknown): value is RichTextRun {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const run = value as Record<string, unknown>;
  return typeof run.text === 'string' &&
    run.text.length <= 10000 &&
    (run.bold === undefined || typeof run.bold === 'boolean') &&
    (run.italic === undefined || typeof run.italic === 'boolean') &&
    Object.keys(run).every((key) => ['text', 'bold', 'italic'].includes(key));
}

function isRuns(value: unknown): value is RichTextRun[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 200 && value.every(isRun);
}

export function extractReviewText(value: unknown): { document: ReviewDocument; text: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new FunctionError(422, 'REVIEW_BODY_REQUIRED', 'A valid review document is required.', null, 'Add review text before saving.');
  }
  const input = value as Record<string, unknown>;
  assertAllowedKeys(input, ['blocks']);
  if (!Array.isArray(input.blocks) || input.blocks.length < 1 || input.blocks.length > 100) {
    throw new FunctionError(422, 'REVIEW_BODY_REQUIRED', 'A review must contain at least one text block.', null, 'Add review text before saving.');
  }

  const blocks: ReviewBlock[] = [];
  const parts: string[] = [];
  for (const blockValue of input.blocks) {
    if (!blockValue || typeof blockValue !== 'object' || Array.isArray(blockValue)) {
      throw new FunctionError(422, 'INVALID_REVIEW_DOCUMENT', 'The review document contains an invalid block.');
    }
    const block = blockValue as Record<string, unknown>;
    assertAllowedKeys(block, block.type === 'paragraph' ? ['type', 'content'] : ['type', 'items']);
    if (block.type === 'paragraph' && isRuns(block.content)) {
      blocks.push({ type: 'paragraph', content: block.content });
      parts.push(block.content.map((run) => run.text).join(''));
    } else if ((block.type === 'bullet_list' || block.type === 'ordered_list') &&
      Array.isArray(block.items) && block.items.length > 0 && block.items.length <= 100 &&
      block.items.every(isRuns)) {
      blocks.push({ type: block.type, items: block.items });
      parts.push(...block.items.map((item) => item.map((run) => run.text).join('')));
    } else {
      throw new FunctionError(422, 'INVALID_REVIEW_DOCUMENT', 'The review document contains an invalid block.');
    }
  }

  const text = parts.join('\n').trim();
  const words = text ? text.split(/\s+/u).filter(Boolean).length : 0;
  if (!words) {
    throw new FunctionError(422, 'REVIEW_BODY_REQUIRED', 'Review text is required.', null, 'Add review text before saving.');
  }
  if (words > 500) {
    throw new FunctionError(422, 'REVIEW_WORD_LIMIT', 'Review text cannot exceed 500 words.', null, 'Shorten the review to 500 words or fewer.');
  }
  if (text.length > 10000) {
    throw new FunctionError(422, 'REVIEW_BODY_TOO_LONG', 'Review text cannot exceed 10,000 characters.');
  }
  return { document: { blocks }, text };
}

export function prepareReviewForEmbedding(
  value: unknown,
  students: StudentNameRecord[],
  targetStudentId?: string,
): { document: ReviewDocument; text: string; deidentifiedText: string } {
  const { document, text } = extractReviewText(value);
  return {
    document,
    text,
    deidentifiedText: deidentifyText(text, students, targetStudentId).text,
  };
}

export function normalizeTags(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 30 || value.some((tag) => typeof tag !== 'string')) {
    throw new FunctionError(422, 'INVALID_TAGS', 'Tags must be an array of at most 30 strings.');
  }
  const tags = value.flatMap((tag) => tag.trim().toLowerCase().split(/\s+/u)).filter(Boolean);
  if (tags.some((tag) => tag.length > 50)) {
    throw new FunctionError(422, 'INVALID_TAGS', 'Each tag must be 50 characters or fewer.');
  }
  const normalizedTags = [...new Set(tags)];
  if (normalizedTags.length > 30) {
    throw new FunctionError(422, 'INVALID_TAGS', 'Tags must contain at most 30 unique tags after normalization.');
  }
  return normalizedTags;
}
