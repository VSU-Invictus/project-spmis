import { errorResponse, FunctionError, handleOptions, isUuid, jsonResponse, mapDatabaseError, readJson, requireMethod } from '../_shared/errors.ts';
import { deidentifyText } from '../_shared/deidentify.ts';
import { embedText } from '../_shared/gemini.ts';
import { extractReviewText, normalizeTags } from '../_shared/review-document.ts';
import { adminClient, getProfile } from '../_shared/supabase.ts';

async function readReview(reviewId: string): Promise<Record<string, unknown>> {
  const client = adminClient();
  const { data: review, error } = await client.from('reviews').select('*').eq('id', reviewId).single();
  if (error || !review) throw new FunctionError(500, 'DATABASE_ERROR', 'The created review could not be loaded.');
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
  const { client, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can create reviews.');
  const body = await readJson(request);
  if (!isUuid(body.student_id)) throw new FunctionError(422, 'INVALID_STUDENT_ID', 'student_id must be a UUID.');
  const { document, text } = extractReviewText(body.body_document);
  const tags = normalizeTags(body.tags);
  const db = adminClient();
  const { data: student, error: studentError } = await db.from('student_profiles')
    .select('id,first_name,middle_name,last_name').eq('id', body.student_id).single();
  if (studentError || !student) throw new FunctionError(404, 'NOT_FOUND', 'Student was not found.');
  const deidentified = deidentifyText(text, [student]).text;
  const embedding = await embedText(deidentified);
  const { data: reviewId, error } = await client.rpc('create_review_transaction', {
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
  const { client, id, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can edit reviews.');
  if (!isUuid(reviewId)) throw new FunctionError(422, 'INVALID_REVIEW_ID', 'The review id must be a UUID.');
  const body = await readJson(request);
  const { document, text } = extractReviewText(body.body_document);
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
  const { data: student, error: studentError } = await db.from('student_profiles')
    .select('id,first_name,middle_name,last_name').eq('id', existing.student_id).single();
  if (studentError || !student) throw new FunctionError(404, 'NOT_FOUND', 'Student was not found.');
  const deidentified = deidentifyText(text, [student]).text;
  const embedding = existing.status === 'active' ? await embedText(deidentified) : null;
  const { data: updatedId, error } = await client.rpc('update_review_transaction', {
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
  const { client, id, role } = await getProfile(request);
  if (role !== 'faculty') throw new FunctionError(403, 'FORBIDDEN', 'Only active faculty can change review status.');
  if (!isUuid(reviewId)) throw new FunctionError(422, 'INVALID_REVIEW_ID', 'The review id must be a UUID.');
  const body = await readJson(request);
  if (!['hide', 'unhide', 'delete'].includes(body.action as string)) {
    throw new FunctionError(422, 'INVALID_ACTION', 'action must be hide, unhide, or delete.');
  }
  const db = adminClient();
  const { data: review, error: reviewError } = await db.from('reviews')
    .select('owner_id,status,deidentified_text').eq('id', reviewId).single();
  if (reviewError || !review) throw new FunctionError(404, 'NOT_FOUND', 'Review was not found.');
  if (review.owner_id !== id) {
    throw new FunctionError(403, 'FORBIDDEN', 'The caller does not own this review.');
  }
  const validTransition =
    (body.action === 'hide' && review.status === 'active') ||
    (body.action === 'unhide' && review.status === 'hidden') ||
    (body.action === 'delete' && ['active', 'hidden'].includes(review.status));
  if (!validTransition) {
    throw new FunctionError(409, 'CONFLICT', 'The requested review status transition is invalid.');
  }
  let embedding: string | null = null;
  if (body.action === 'unhide') {
    embedding = await embedText(review.deidentified_text);
  }
  const { data: status, error } = await client.rpc('set_review_status_transaction', {
    p_review_id: reviewId,
    p_action: body.action,
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
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return errorResponse(new FunctionError(401, 'UNAUTHORIZED', 'Authentication is required.'));
    }
    return errorResponse(error);
  }
}

Deno.serve(handler);
