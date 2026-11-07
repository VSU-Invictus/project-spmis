export const REVIEW_TAG_LIMIT = 30;
export const REVIEW_TAG_LENGTH_LIMIT = 50;

export type TagNormalizationResult =
  | { valid: true; tags: string[] }
  | { valid: false; reason: 'too_many_tags' | 'tag_too_long'; tags: string[] };

export function normalizeTags(inputTags: readonly string[]): TagNormalizationResult {
  const tags = [...new Set(
    inputTags
      .flatMap((tag) => tag.trim().split(/\s+/u))
      .filter(Boolean)
      .map((tag) => tag.toLowerCase()),
  )];

  if (tags.some((tag) => [...tag].length > REVIEW_TAG_LENGTH_LIMIT)) {
    return { valid: false, reason: 'tag_too_long', tags };
  }

  if (tags.length > REVIEW_TAG_LIMIT) {
    return { valid: false, reason: 'too_many_tags', tags };
  }

  return { valid: true, tags };
}
