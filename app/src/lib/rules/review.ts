export const REVIEW_WORD_LIMIT = 500;

export type ReviewWordLimitErrorCode =
  | 'REVIEW_BODY_REQUIRED'
  | 'REVIEW_WORD_LIMIT';

export type ReviewWordLimitResult =
  | { valid: true; wordCount: number }
  | { valid: false; code: ReviewWordLimitErrorCode; wordCount: number };

type ReviewTextRun = { text: string };
type ReviewDocumentBlock =
  | { type: 'paragraph'; content: readonly ReviewTextRun[] }
  | { type: 'bullet_list' | 'ordered_list'; items: readonly (readonly ReviewTextRun[])[] };

export function extractPlainText(document: { blocks: readonly ReviewDocumentBlock[] }): string {
  return document.blocks
    .map((block) => block.type === 'paragraph'
      ? block.content.map((run) => run.text).join('')
      : block.items.map((item) => item.map((run) => run.text).join('')).join(' '))
    .join(' ')
    .trim();
}

export function countReviewWords(text: string): number {
  const trimmedText = text.trim();
  return trimmedText === '' ? 0 : trimmedText.split(/\s+/u).length;
}

export function validateReviewWordLimit(text: string): ReviewWordLimitResult {
  const wordCount = countReviewWords(text);

  if (wordCount === 0) {
    return { valid: false, code: 'REVIEW_BODY_REQUIRED', wordCount };
  }

  if (wordCount > REVIEW_WORD_LIMIT) {
    return { valid: false, code: 'REVIEW_WORD_LIMIT', wordCount };
  }

  return { valid: true, wordCount };
}
