import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { extractReviewText, normalizeTags } from './review-document.ts';
import { deidentifyText } from './deidentify.ts';

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
    'Review text is required.',
  );
  assertThrows(
    () => extractReviewText({
      blocks: [{ type: 'paragraph', content: [{ text: Array(501).fill('word').join(' ') }] }],
    }),
    Error,
    'Review text cannot exceed 500 words.',
  );
});

Deno.test('plain-text extraction removes markup before de-identification', () => {
  const extracted = extractReviewText({
    blocks: [
      {
        type: 'paragraph',
        content: [
          { text: 'Maria ', bold: true },
          { text: 'Santos', italic: true },
          { text: ' showed progress.' },
        ],
      },
    ],
  });
  const student = [{
    id: '40000000-0000-4000-8000-000000000001',
    first_name: 'Maria',
    middle_name: null,
    last_name: 'Santos',
  }];

  assertEquals(extracted.text, 'Maria Santos showed progress.');
  assertEquals(
    deidentifyText(extracted.text, student).text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} showed progress.',
  );
});
