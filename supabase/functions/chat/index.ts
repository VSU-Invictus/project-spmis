import { assertAllowedKeys, errorResponse, FunctionError, handleOptions, jsonResponse, mapDatabaseError, readJson } from '../_shared/errors.ts';
import { deidentifyText, reidentifyText, type StudentNameRecord } from '../_shared/deidentify.ts';
import { embedText, generateAnswer } from '../_shared/gemini.ts';
import { getProfile, adminClient } from '../_shared/supabase.ts';
import { enforceChatRateLimit } from '../_shared/chat-rate-limit.ts';

function validateHistory(value: unknown): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) {
    throw new FunctionError(422, 'INVALID_HISTORY', 'Chat history must contain at most 20 turns.');
  }
  return value.map((turn) => {
    if (!turn || typeof turn !== 'object' || Array.isArray(turn)) throw new FunctionError(422, 'INVALID_HISTORY', 'Chat history is invalid.');
    const item = turn as Record<string, unknown>;
    assertAllowedKeys(item, ['role', 'content']);
    if (!['user', 'assistant'].includes(item.role as string) ||
      typeof item.content !== 'string' || !item.content.trim() || item.content.length > 10000) {
      throw new FunctionError(422, 'INVALID_HISTORY', 'Chat history is invalid.');
    }
    return { role: item.role as 'user' | 'assistant', content: item.content };
  });
}

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return handleOptions();
  try {
    if (request.method !== 'POST') {
      throw new FunctionError(405, 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported.');
    }
    // getProfile verifies authentication and an active faculty/admin profile.
    const { id } = await getProfile(request);
    const db = adminClient();
    await enforceChatRateLimit(id, (actorId) =>
      db.rpc('consume_chat_rate_limit', { p_actor_id: actorId }));
    const body = await readJson(request, ['message', 'history']);
    if (typeof body.message !== 'string' || body.message.length > 2000 || !/\S/u.test(body.message)) {
      throw new FunctionError(422, 'INVALID_MESSAGE', 'A nonblank message of at most 2,000 characters is required.');
    }
    const history = validateHistory(body.history);
    const { data: students, error: studentsError } = await db.from('student_profiles')
      .select('id,first_name,middle_name,last_name,student_id_number,program:program_id(name)');
    if (studentsError) throw new FunctionError(500, 'DATABASE_ERROR', 'Student names could not be loaded.');
    const records = (students ?? []) as StudentNameRecord[];
    // Chat has no review target: match full names and IDs, never partial names.
    const deidentify = (text: string) => deidentifyText(text, records).text;
    const safeMessage = deidentify(body.message);
    const safeHistory = history.map((turn) => ({ ...turn, content: deidentify(turn.content) }));
    const queryText = [safeMessage, ...safeHistory.map((turn) => turn.content)].join('\n');
    const embedding = await embedText(queryText);
    const { data: matches, error: matchError } = await db.rpc('match_review_embeddings', {
      p_actor_id: id,
      p_embedding: embedding,
      p_limit: 8,
    });
    if (matchError) mapDatabaseError(matchError);

    const context = (matches ?? []).map((match: { deidentified_text: string; distance: number }, index: number) =>
      `[Review ${index + 1}]\n${match.deidentified_text}`).join('\n\n');
    const prompt = [
      'You are the SPMIS AI Chat Assistant. Answer only from the de-identified review context below.',
      'Do not invent facts. Student tokens such as {{STUDENT:<uuid>}} may be used in your answer.',
      `Review context:\n${context || '(No matching active reviews were found.)'}`,
      'Conversation:',
      ...safeHistory.map((turn) => `${turn.role}: ${turn.content}`),
      `user: ${safeMessage}`,
    ].join('\n');
    const answer = reidentifyText(await generateAnswer(prompt), records);
    return jsonResponse({ message: answer });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
