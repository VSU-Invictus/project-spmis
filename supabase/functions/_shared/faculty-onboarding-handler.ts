import { errorResponse, FunctionError, handleOptions, jsonResponse } from './errors.ts';
import { type FacultyOnboardingInput, parseFacultyOnboardingInput } from './faculty-onboarding.ts';

interface OnboardingDependencies {
  requireUser(request: Request): Promise<{ id: string }>;
  complete(userId: string, input: FacultyOnboardingInput): Promise<{
    data: Record<string, unknown> | null;
    error: { code?: string } | null;
  }>;
}

export function createFacultyOnboardingHandler(dependencies: OnboardingDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return handleOptions();
    try {
      if (request.method !== 'POST') {
        throw new FunctionError(405, 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported.');
      }
      // New Google users do not have a faculty profile yet. Do not use getProfile here.
      const { id } = await dependencies.requireUser(request);
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new FunctionError(400, 'INVALID_REQUEST', 'The request body must contain valid JSON.');
      }
      const input = parseFacultyOnboardingInput(body);
      const { data, error } = await dependencies.complete(id, input);
      if (error?.code === '23505') {
        throw new FunctionError(409, 'CONFLICT', 'A faculty profile already exists for this account.');
      }
      if (error?.code === '42501') {
        throw new FunctionError(403, 'FORBIDDEN', 'A verified Google account is required for faculty onboarding.');
      }
      if (error && ['23514', '22023', '22P02', '23502'].includes(error.code ?? '')) {
        throw new FunctionError(422, 'VALIDATION_ERROR', 'The faculty name or department is invalid.');
      }
      if (error || !data) {
        throw new FunctionError(500, 'DATABASE_ERROR', 'Faculty onboarding could not be completed.');
      }
      return jsonResponse(data, 201);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
