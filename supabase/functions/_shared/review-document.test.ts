import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError } from './errors.ts';
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

Deno.test('tag normalization accepts exactly 30 distinct tags after whitespace splitting', () => {
  const expected = Array.from({ length: 30 }, (_, index) => `tag${index}`);
  const input = Array.from({ length: 15 }, (_, index) => `tag${index * 2}\tTAG${index * 2 + 1}`);
  assertEquals(normalizeTags(input), expected);
});

Deno.test('tag normalization rejects 31 distinct tags produced by fewer than 30 input strings', async () => {
  const input = Array.from({ length: 15 }, (_, index) => `tag${index * 2} tag${index * 2 + 1}`);
  input.push('tag30');
  const error = assertThrows(() => normalizeTags(input), FunctionError);
  const response = errorResponse(error);
  assertEquals(response.status, 422);
  assertEquals(await response.json(), {
    code: 'INVALID_TAGS',
    message: 'Tags must contain at most 30 unique tags after normalization.',
    details: null,
    hint: null,
  });
});

Deno.test('tag normalization counts unique normalized tags rather than split occurrences', () => {
  assertEquals(normalizeTags(Array(30).fill(' Research\tTEAMWORK ')), ['research', 'teamwork']);
  const expected = Array.from({ length: 30 }, (_, index) => `tag${index}`);
  const input = Array.from({ length: 15 }, (_, index) => `tag${index * 2} tag${index * 2 + 1}`);
  input.push('TAG0 tag1');
  assertEquals(normalizeTags(input), expected);
});

Deno.test('tag normalization retains input-shape, input-count and normalized-length validation', () => {
  assertEquals(normalizeTags(undefined), []);
  assertEquals(normalizeTags([]), []);
  for (const invalid of [null, 'research', [123], Array(31).fill('research'), ['x'.repeat(51)]]) {
    const error = assertThrows(() => normalizeTags(invalid), FunctionError);
    assertEquals(error.status, 422);
    assertEquals(error.code, 'INVALID_TAGS');
  }
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

Deno.test('review validation returns the expected 422 contract error envelopes', async () => {
  const invalidCases = [
    {
      input: { blocks: [{ type: 'paragraph', content: [{ text: ' ' }] }] },
      code: 'REVIEW_BODY_REQUIRED',
      message: 'Review text is required.',
    },
    {
      input: {
        blocks: [{
          type: 'paragraph',
          content: [{ text: Array(501).fill('word').join(' ') }],
        }],
      },
      code: 'REVIEW_WORD_LIMIT',
      message: 'Review text cannot exceed 500 words.',
    },
  ];

  for (const invalidCase of invalidCases) {
    let response: Response;
    try {
      extractReviewText(invalidCase.input);
      throw new Error('Expected review validation to fail.');
    } catch (error) {
      response = errorResponse(error);
    }

    assertEquals(response.status, 422);
    assertEquals(await response.json(), {
      code: invalidCase.code,
      message: invalidCase.message,
      details: null,
      hint: invalidCase.code === 'REVIEW_WORD_LIMIT'
        ? 'Shorten the review to 500 words or fewer.'
        : 'Add review text before saving.',
    });
  }
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
