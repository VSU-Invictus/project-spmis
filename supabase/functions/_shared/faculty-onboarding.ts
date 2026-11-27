import { FunctionError, isUuid } from './errors.ts';

export interface FacultyOnboardingInput {
  full_name: string;
  department_id: string;
}

export interface FacultyInviteInput extends FacultyOnboardingInput {
  email: string;
}

function requestObject(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
    Object.keys(value).some((key) => !keys.includes(key))) {
    throw new FunctionError(422, 'INVALID_REQUEST', 'The request must contain only the documented fields.');
  }
  return value as Record<string, unknown>;
}

function profileFields(body: Record<string, unknown>): FacultyOnboardingInput {
  if (typeof body.full_name !== 'string' || !body.full_name.trim() ||
    body.full_name.length > 200) {
    throw new FunctionError(422, 'INVALID_NAME', 'A nonblank name of at most 200 characters is required.');
  }
  if (!isUuid(body.department_id)) {
    throw new FunctionError(422, 'INVALID_DEPARTMENT', 'department_id must be a UUID.');
  }
  return { full_name: body.full_name.trim(), department_id: body.department_id.toLowerCase() };
}

// Identity, role and status come from verified server state, never this body.
export function parseFacultyOnboardingInput(value: unknown): FacultyOnboardingInput {
  return profileFields(requestObject(value, ['full_name', 'department_id']));
}

export function parseFacultyInviteInput(value: unknown): FacultyInviteInput {
  const body = requestObject(value, ['email', 'full_name', 'department_id']);
  const profile = profileFields(body);
  if (typeof body.email !== 'string') {
    throw new FunctionError(422, 'INVALID_EMAIL', 'A valid email address is required.');
  }
  const email = body.email.trim().toLowerCase();
  if (body.email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new FunctionError(422, 'INVALID_EMAIL', 'A valid email address is required.');
  }
  return { ...profile, email };
}
