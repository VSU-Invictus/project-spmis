export const REVIEW_WORD_LIMIT = 500;

export type ReviewWordLimitErrorCode =
  | 'REVIEW_BODY_REQUIRED'
  | 'REVIEW_WORD_LIMIT';

export type ReviewWordLimitResult =
  | { valid: true; wordCount: number }
  | { valid: false; code: ReviewWordLimitErrorCode; wordCount: number };

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
