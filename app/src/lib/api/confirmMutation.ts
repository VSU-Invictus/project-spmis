import { z } from 'zod';

/** Confirm a single-record write without treating an empty or unrelated response as success. */
export function confirmsMutation(
  response: unknown,
  expected: Record<string, unknown>,
  id?: string,
): boolean {
  if (!Array.isArray(response) || response.length !== 1) return false;
  const record: unknown = response[0];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  const fields = record as Record<string, unknown>;
  return z.string().uuid().safeParse(fields.id).success &&
    (id === undefined || fields.id === id) &&
    Object.entries(expected).every(([key, value]) => value === undefined || fields[key] === value);
}
