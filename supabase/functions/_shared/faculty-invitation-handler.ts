import { errorResponse, FunctionError, handleOptions, jsonResponse } from './errors.ts';
import { type FacultyInviteInput, parseFacultyInviteInput } from './faculty-onboarding.ts';

interface InvitationDependencies {
  getProfile(request: Request): Promise<{ id: string; role: 'faculty' | 'admin' }>;
  validate(actorId: string, input: FacultyInviteInput): Promise<{ error: { code?: string } | null }>;
  invite(actorId: string, input: FacultyInviteInput): Promise<{
    userId: string | null;
    error: { code?: string; status?: number } | null;
  }>;
}

export function createFacultyInvitationHandler(dependencies: InvitationDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return handleOptions();
    try {
      if (request.method !== 'POST') {
        throw new FunctionError(405, 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported.');
      }
      const { id, role } = await dependencies.getProfile(request);
      if (role !== 'admin') {
        throw new FunctionError(403, 'FORBIDDEN', 'Only active administrators can invite faculty.');
      }
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new FunctionError(400, 'INVALID_REQUEST', 'The request body must contain valid JSON.');
      }
      const input = parseFacultyInviteInput(body);
      const { error: validationError } = await dependencies.validate(id, input);
      if (validationError?.code === '23505') {
        throw new FunctionError(409, 'CONFLICT', 'An account already exists for this email address.');
      }
      if (validationError?.code === '42501') {
        throw new FunctionError(403, 'FORBIDDEN', 'Only active administrators can invite faculty.');
      }
      if (validationError && ['23514', '22023', '22P02', '23502'].includes(validationError.code ?? '')) {
        throw new FunctionError(422, 'VALIDATION_ERROR', 'The faculty email or department is invalid.');
      }
      if (validationError) {
        throw new FunctionError(500, 'DATABASE_ERROR', 'The invitation could not be validated.');
      }
      const { userId, error } = await dependencies.invite(id, input);
      if (error && ['email_exists', 'user_already_exists'].includes(error.code ?? '')) {
        throw new FunctionError(409, 'CONFLICT', 'An account already exists for this email address.');
      }
      if (error?.status === 429 || (error && ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error.code ?? ''))) {
        throw new FunctionError(429, 'RATE_LIMITED', 'Faculty invitations are temporarily unavailable.', null, 'Try again later.');
      }
      if (error || !userId) {
        throw new FunctionError(502, 'INVITATION_FAILED', 'The Auth service could not complete the invitation.');
      }
      return jsonResponse({ id: userId, email: input.email, status: 'pending' }, 201);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
