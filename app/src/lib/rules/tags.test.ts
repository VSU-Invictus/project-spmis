import { describe, expect, it } from 'vitest';
import { normalizeTags } from './tags';

describe('review tag rule', () => {
  it('tokenizes whitespace, lowercases, and deduplicates in order', () => {
    expect(normalizeTags([' Research  mentoring', 'research\tLEADERSHIP'])).toEqual({
      valid: true,
      tags: ['research', 'mentoring', 'leadership'],
    });
  });

  it('accepts 30 unique tags and rejects 31', () => {
    expect(normalizeTags(Array.from({ length: 30 }, (_, index) => `tag${index}`)).valid).toBe(true);
    expect(normalizeTags(Array.from({ length: 31 }, (_, index) => `tag${index}`))).toEqual({
      valid: false,
      reason: 'too_many_tags',
      tags: Array.from({ length: 31 }, (_, index) => `tag${index}`),
    });
  });

  it('accepts 50 characters per tag and rejects 51', () => {
    expect(normalizeTags(['a'.repeat(50)]).valid).toBe(true);
    expect(normalizeTags(['a'.repeat(51)])).toEqual({
      valid: false,
      reason: 'tag_too_long',
      tags: ['a'.repeat(51)],
    });
  });

  it('allows an empty tag list', () => {
    expect(normalizeTags([])).toEqual({ valid: true, tags: [] });
  });
});
