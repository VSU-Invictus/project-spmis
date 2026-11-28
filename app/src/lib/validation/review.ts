import { z } from 'zod';
import { extractPlainText, validateReviewWordLimit } from '../rules/review';
import { normalizeTags, REVIEW_TAG_LIMIT } from '../rules/tags';

const richTextRunSchema = z.object({
  text: z.string().max(10_000),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
}).strict();

const paragraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  content: z.array(richTextRunSchema).min(1).max(200),
}).strict();

const listBlockSchema = z.object({
  type: z.enum(['bullet_list', 'ordered_list']),
  items: z.array(z.array(richTextRunSchema).min(1).max(200)).min(1).max(100),
}).strict();

const reviewDocumentSchema = z.object({
  blocks: z.array(z.discriminatedUnion('type', [paragraphBlockSchema, listBlockSchema])).min(1).max(100),
}).strict();

const reviewTagsSchema = z.array(z.string()).max(REVIEW_TAG_LIMIT).optional().transform((tags, context) => {
  if (tags === undefined) return undefined;
  const normalized = normalizeTags(tags);
  if (!normalized.valid) {
    context.addIssue({
      code: 'custom',
      message: normalized.reason === 'too_many_tags'
        ? `A review can have no more than ${REVIEW_TAG_LIMIT} tags.`
        : 'Each tag must be 50 characters or fewer.',
    });
    return z.NEVER;
  }
  return normalized.tags;
});

export const reviewSchema = z.object({
  student_id: z.string().uuid(),
  body_document: reviewDocumentSchema,
  tags: reviewTagsSchema,
}).strict().superRefine((review, context) => {
  const validation = validateReviewWordLimit(extractPlainText(review.body_document));
  if (!validation.valid) {
    context.addIssue({
      code: 'custom',
      path: ['body_document'],
      message: validation.code === 'REVIEW_BODY_REQUIRED'
        ? 'Enter a review before saving.'
        : `A review can contain no more than 500 words (received ${validation.wordCount}).`,
    });
  }
});

export type ReviewFormValues = z.input<typeof reviewSchema>;
export type ValidReview = z.output<typeof reviewSchema>;
