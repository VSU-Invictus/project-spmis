import { describe, expect, it } from 'vitest';
import { countReviewWords, validateReviewWordLimit } from './review';

describe('review word-count rule', () => {
  it('counts nonempty whitespace-separated words', () => {
    expect(countReviewWords('  one\t two\nthree  ')).toBe(3);
    expect(countReviewWords(' \t\n ')).toBe(0);
  });

  it('accepts 500 words and rejects 501', () => {
    expect(validateReviewWordLimit(Array(500).fill('word').join(' '))).toEqual({
      valid: true,
      wordCount: 500,
    });
    expect(validateReviewWordLimit(Array(501).fill('word').join(' '))).toEqual({
      valid: false,
      code: 'REVIEW_WORD_LIMIT',
      wordCount: 501,
    });
  });

  it('rejects empty and whitespace-only reviews', () => {
    for (const text of ['', ' \t\n ']) {
      expect(validateReviewWordLimit(text)).toEqual({
        valid: false,
        code: 'REVIEW_BODY_REQUIRED',
        wordCount: 0,
      });
    }
  });
});
