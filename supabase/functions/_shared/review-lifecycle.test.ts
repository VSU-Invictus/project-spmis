import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { embeddingAfterStatusChange, nextReviewStatus } from './review-lifecycle.ts';

Deno.test('setReviewStatus lifecycle removes embeddings when hiding or deleting', () => {
  assertEquals(nextReviewStatus('hide', 'active'), 'hidden');
  assertEquals(embeddingAfterStatusChange('hide'), 'remove');

  assertEquals(nextReviewStatus('delete', 'hidden'), 'deleted');
  assertEquals(embeddingAfterStatusChange('delete'), 'remove');

  assertEquals(nextReviewStatus('delete', 'deleted'), null);
});

Deno.test('setReviewStatus lifecycle embeds deidentified text when unhiding', () => {
  assertEquals(nextReviewStatus('unhide', 'hidden'), 'active');
  assertEquals(embeddingAfterStatusChange('unhide'), 'embed');

  assertEquals(nextReviewStatus('unhide', 'active'), null);
});
