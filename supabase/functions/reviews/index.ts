import { errorResponse, FunctionError, handleOptions, isUuid, jsonResponse, mapDatabaseError, readJson, requireMethod } from '../_shared/errors.ts';
import { embedText } from '../_shared/gemini.ts';
import { normalizeTags, prepareReviewForEmbedding } from '../_shared/review-document.ts';
import { embeddingAfterStatusChange, nextReviewStatus } from '../_shared/review-lifecycle.ts';
import { adminClient, getProfile } from '../_shared/supabase.ts';

async function readReview(reviewId: string): Promise<Record<string, unknown>> {
  const client = adminClient();
  const { data: review, error } = await client.from('reviews').select('*').eq('id', reviewId).single();
  if (error || !review) throw new FunctionError(500, 'DATABASE_ERROR', 'The review could not be loaded.');
  const [{ data: tags }, { data: author }] = await Promise.all([
    client.from('review_tags').select('tag').eq('review_id', reviewId).order('tag'),
    client.from('faculty_profiles').select('full_name,department_id').eq('id', review.owner_id).single(),
  ]);
  const { data: attachments } = await client.from('review_attachments')
    .select('id,review_id,mime_type,size_bytes,created_at')
    .eq('review_id', reviewId)
    .order('created_at')
    .order('id');
  const { data: department } = await client.from('departments')
    .select('name').eq('id', author?.department_id ?? '').maybeSingle();
  const { deidentified_text: _deidentifiedText, ...publicReview } = review;
  return {
    ...publicReview,
    tags: (tags ?? []).map((tag) => tag.tag),
    author_name: author?.full_name ?? '',
    author_department_name: department?.name ?? '',
    attachments: attachments ?? [],
  };
}

async function create(request: Request): Promise<Response> {
  const { id, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can create reviews.');
  const body = await readJson(request);
  if (!isUuid(body.student_id)) throw new FunctionError(422, 'INVALID_STUDENT_ID', 'student_id must be a UUID.');
  const tags = normalizeTags(body.tags);
  const db = adminClient();
  const { data: students, error: studentError } = await db.from('student_profiles')
    .select('id,first_name,middle_name,last_name,student_id_number');
  if (studentError) throw new FunctionError(500, 'DATABASE_ERROR', 'Student profiles could not be loaded.');
  const allStudents = students ?? [];
  if (!allStudents.some((student) => student.id === body.student_id)) {
    throw new FunctionError(404, 'NOT_FOUND', 'Student was not found.');
  }
  const { document, text, deidentifiedText: deidentified } = prepareReviewForEmbedding(
    body.body_document,
    allStudents,
  );
  const embedding = await embedText(deidentified);
  const { data: reviewId, error } = await db.rpc('create_review_transaction', {
    p_actor_id: id,
    p_student_id: body.student_id,
    p_body_text: text,
    p_body_document: document,
    p_deidentified_text: deidentified,
    p_tags: tags,
    p_embedding: embedding,
  });
  if (error) mapDatabaseError(error);
  return jsonResponse(await readReview(reviewId), 201);
}

async function update(request: Request, reviewId: string): Promise<Response> {
  const { id, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can edit reviews.');
  if (!isUuid(reviewId)) throw new FunctionError(422, 'INVALID_REVIEW_ID', 'The review id must be a UUID.');
  const body = await readJson(request);
  const tagsProvided = Object.prototype.hasOwnProperty.call(body, 'tags');
  const tags = tagsProvided ? normalizeTags(body.tags) : [];
  const db = adminClient();
  const { data: existing, error: existingError } = await db.from('reviews')
    .select('student_id,status,owner_id').eq('id', reviewId).single();
  if (existingError || !existing) throw new FunctionError(404, 'NOT_FOUND', 'Review was not found.');
  if (existing.owner_id !== id) {
    throw new FunctionError(403, 'FORBIDDEN', 'The caller does not own this review.');
  }
  if (existing.status === 'deleted') {
    throw new FunctionError(409, 'CONFLICT', 'Deleted reviews cannot be edited.');
  }
  const { data: students, error: studentError } = await db.from('student_profiles')
    .select('id,first_name,middle_name,last_name,student_id_number');
  if (studentError) throw new FunctionError(500, 'DATABASE_ERROR', 'Student profiles could not be loaded.');
  const allStudents = students ?? [];
  if (!allStudents.some((student) => student.id === existing.student_id)) {
    throw new FunctionError(404, 'NOT_FOUND', 'Student was not found.');
  }
  const { document, text, deidentifiedText: deidentified } = prepareReviewForEmbedding(
    body.body_document,
    allStudents,
  );
  const embedding = existing.status === 'active' ? await embedText(deidentified) : null;
  const { data: updatedId, error } = await db.rpc('update_review_transaction', {
    p_actor_id: id,
    p_review_id: reviewId,
    p_body_text: text,
    p_body_document: document,
    p_deidentified_text: deidentified,
    p_tags: tags,
    p_replace_tags: tagsProvided,
    p_embedding: embedding,
  });
  if (error) mapDatabaseError(error);
  return jsonResponse(await readReview(updatedId));
}

async function setStatus(request: Request, reviewId: string): Promise<Response> {
  const { id, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can change review status.');
  if (!isUuid(reviewId)) throw new FunctionError(422, 'INVALID_REVIEW_ID', 'The review id must be a UUID.');
  const body = await readJson(request);
  const action = body.action;
  if (action !== 'hide' && action !== 'unhide' && action !== 'delete') {
    throw new FunctionError(422, 'INVALID_ACTION', 'action must be hide, unhide, or delete.');
  }
  const db = adminClient();
  const { data: review, error: reviewError } = await db.from('reviews')
    .select('owner_id,status,deidentified_text').eq('id', reviewId).single();
  if (reviewError || !review) throw new FunctionError(404, 'NOT_FOUND', 'Review was not found.');
  if (review.owner_id !== id) {
    throw new FunctionError(403, 'FORBIDDEN', 'The caller does not own this review.');
  }
  const nextStatus = nextReviewStatus(action, review.status);
  if (nextStatus === null) {
    throw new FunctionError(409, 'CONFLICT', 'The requested review status transition is invalid.');
  }
  let embedding: string | null = null;
  if (embeddingAfterStatusChange(action) === 'embed') {
    embedding = await embedText(review.deidentified_text);
  }
  const { data: status, error } = await db.rpc('set_review_status_transaction', {
    p_actor_id: id,
    p_review_id: reviewId,
    p_action: action,
    p_embedding: embedding,
  });
  if (error) mapDatabaseError(error);
  return jsonResponse({ id: reviewId, status });
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return handleOptions();
  try {
    if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/reviews')) return await create(request);
    if (request.method === 'PATCH') {
      const match = new URL(request.url).pathname.match(/\/reviews\/([^/]+)$/);
      if (match) return await update(request, match[1]);
    }
    if (request.method === 'POST') {
      const match = new URL(request.url).pathname.match(/\/reviews\/([^/]+)\/status$/);
      if (match) return await setStatus(request, match[1]);
    }
    requireMethod(request, 'POST');
    throw new FunctionError(404, 'NOT_FOUND', 'The endpoint was not found.');
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
