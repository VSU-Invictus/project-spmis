import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { prepareReviewForEmbedding } from '../_shared/review-document.ts';

const student = {
  id: '40000000-0000-4000-8000-000000000001',
  first_name: 'Maria',
  middle_name: 'Dela Cruz',
  last_name: 'Santos',
  student_id_number: 'TEST-001',
};

Deno.test('createReview and updateReview send only deidentified text to embeddings', () => {
  const created = prepareReviewForEmbedding({
    blocks: [{
      type: 'paragraph',
      content: [{ text: 'Maria Dela Cruz Santos (TEST-001) demonstrated strong teamwork.' }],
    }],
  }, [student], student.id);
  assertEquals(
    created.deidentifiedText,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} ({{STUDENT:40000000-0000-4000-8000-000000000001}}) demonstrated strong teamwork.',
  );
  assertEquals(created.text.includes(student.student_id_number), true);
  assertEquals(created.deidentifiedText.includes(student.student_id_number), false);

  const updated = prepareReviewForEmbedding({
    blocks: [{
      type: 'bullet_list',
      items: [[{ text: 'Santos, Maria leads consistently.' }]],
    }],
  }, [student], student.id);
  assertEquals(
    updated.deidentifiedText,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} leads consistently.',
  );
});

Deno.test('createReview and updateReview reject reviews over 500 words', () => {
  const document = {
    blocks: [{
      type: 'paragraph',
      content: [{ text: Array(501).fill('word').join(' ') }],
    }],
  };
  assertThrows(
    () => prepareReviewForEmbedding(document, [student]),
    Error,
    'Review text cannot exceed 500 words.',
  );
});
