import { FunctionError } from './errors.ts';

type ApiError = { code?: string; status?: number };
interface InvitationReservationDependencies {
  reserve(): Promise<{ data: string | null; error: ApiError | null }>;
  send(): Promise<{ userId: string | null; error: ApiError | null }>;
  finish(token: string): Promise<{ data: boolean | null; error: ApiError | null }>;
}

export async function sendReservedFacultyInvitation(dependencies: InvitationReservationDependencies) {
  const { data: token, error } = await dependencies.reserve();
  if (error?.code === '23505') {
    throw new FunctionError(409, 'CONFLICT', 'An account or invitation already exists for this email address.');
  }
  if (error?.code === '42501') {
    throw new FunctionError(403, 'FORBIDDEN', 'Only active administrators can invite faculty.');
  }
  if (error?.code === '23514') {
    throw new FunctionError(422, 'VALIDATION_ERROR', 'The faculty email or department is invalid.');
  }
  if (error || !token) {
    throw new FunctionError(500, 'DATABASE_ERROR', 'The invitation could not be reserved.');
  }
  // If the network throws, retain the lease until expiry: Auth's outcome is unknown.
  const result = await dependencies.send();
  if (result.error && (result.error.status === undefined || result.error.status === 0 || result.error.status >= 500)) {
    return result;
  }
  const finished = await dependencies.finish(token);
  if (finished.error) {
    throw new FunctionError(500, 'DATABASE_ERROR', 'The invitation result could not be confirmed.');
  }
  if (!finished.data) {
    throw new FunctionError(409, 'CONFLICT', 'The invitation request expired. Refresh the account state before retrying.');
  }
  return result;
}
