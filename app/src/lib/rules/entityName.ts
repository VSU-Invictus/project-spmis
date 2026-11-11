export const ENTITY_NAME_LENGTH_LIMIT = 200;

export type EntityNameValidationResult =
  | { valid: true; value: string }
  | { valid: false; reason: 'required' | 'too_long' | 'unchanged' };

export function validateEntityName(name: string): EntityNameValidationResult {
  const value = name.trim();

  if (value === '') {
    return { valid: false, reason: 'required' };
  }

  if ([...value].length > ENTITY_NAME_LENGTH_LIMIT) {
    return { valid: false, reason: 'too_long' };
  }

  return { valid: true, value };
}

export function validateEntityNameEdit(
  name: string,
  currentName: string,
): EntityNameValidationResult {
  const result = validateEntityName(name);

  if (!result.valid) {
    return result;
  }

  if (result.value === currentName.trim()) {
    return { valid: false, reason: 'unchanged' };
  }

  return result;
}
