import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { extractReviewText, normalizeTags } from './review-document.ts';

Deno.test('extracts rich text with whitespace between blocks and normalizes tags', () => {
  const result = extractReviewText({
    blocks: [
      { type: 'paragraph', content: [{ text: 'Strong ' }, { text: 'research', bold: true }] },
      { type: 'bullet_list', items: [[{ text: 'Clear communication' }]] },
    ],
  });
  assertEquals(result.text, 'Strong research\nClear communication');
  assertEquals(normalizeTags([' Research teamwork', 'research']), ['research', 'teamwork']);
});

Deno.test('rejects empty and over-limit reviews', () => {
  assertThrows(
    () => extractReviewText({ blocks: [{ type: 'paragraph', content: [{ text: ' ' }] }] }),
    Error,
    'REVIEW_BODY_REQUIRED',
  );
  assertThrows(
    () => extractReviewText({
      blocks: [{ type: 'paragraph', content: [{ text: Array(501).fill('word').join(' ') }] }],
    }),
    Error,
    'REVIEW_WORD_LIMIT',
  );
});
