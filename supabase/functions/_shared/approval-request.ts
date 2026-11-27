import { FunctionError, isUuid } from './errors.ts';

export function normalizeApplicationIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100 ||
    !value.every((id): id is string => isUuid(id))) {
    throw new FunctionError(422, 'INVALID_APPLICATION_IDS', 'application_ids must contain 1 to 100 UUIDs.');
  }
  const ids = value.map((id) => id.toLowerCase());
  if (new Set(ids).size !== ids.length) {
    throw new FunctionError(422, 'INVALID_APPLICATION_IDS', 'application_ids must not contain duplicate UUIDs.');
  }
  return ids;
}
