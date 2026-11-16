import { errorResponse, FunctionError, handleOptions, isUuid, jsonResponse, mapDatabaseError, readJson } from '../_shared/errors.ts';
import { getProfile } from '../_shared/supabase.ts';

async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return handleOptions();
  try {
    if (request.method !== 'POST') {
      throw new FunctionError(405, 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported.');
    }
    const { client, role } = await getProfile(request);
    if (role !== 'admin') throw new FunctionError(403, 'FORBIDDEN', 'Only administrators can decide applications.');
    const body = await readJson(request);
    if (!Array.isArray(body.application_ids) || body.application_ids.length < 1 ||
      body.application_ids.length > 100 || body.application_ids.some((id) => !isUuid(id)) ||
      new Set(body.application_ids).size !== body.application_ids.length) {
      throw new FunctionError(422, 'INVALID_APPLICATION_IDS', 'application_ids must contain 1 to 100 UUIDs.');
    }
    if (body.decision !== 'approve' && body.decision !== 'reject') {
      throw new FunctionError(422, 'INVALID_DECISION', 'decision must be approve or reject.');
    }
    if (body.decision === 'reject' &&
      (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 1000)) {
      throw new FunctionError(422, 'REJECTION_REASON_REQUIRED', 'A nonblank rejection reason is required.');
    }
    if (body.department_assignments !== undefined) {
      if (body.decision === 'reject' || !Array.isArray(body.department_assignments) ||
        body.department_assignments.length > 100) {
        throw new FunctionError(422, 'INVALID_DEPARTMENT_ASSIGNMENTS', 'department_assignments are only valid for approvals.');
      }
      const assignmentIds = new Set<string>();
      for (const assignment of body.department_assignments) {
        if (!assignment || typeof assignment !== 'object' || Array.isArray(assignment)) {
          throw new FunctionError(422, 'INVALID_DEPARTMENT_ASSIGNMENTS', 'Each department assignment must target one selected application exactly once.');
        }
        const candidate = assignment as Record<string, unknown>;
        if (!isUuid(candidate.application_id) || !isUuid(candidate.department_id) ||
          assignmentIds.has(candidate.application_id) ||
          !body.application_ids.includes(candidate.application_id)) {
          throw new FunctionError(422, 'INVALID_DEPARTMENT_ASSIGNMENTS', 'Each department assignment must target one selected application exactly once.');
        }
        assignmentIds.add(candidate.application_id);
      }
    }
    const { data, error } = await client.rpc('decide_applications_transaction', {
      p_request: body,
    });
    if (error) mapDatabaseError(error);
    return jsonResponse(data ?? []);
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
