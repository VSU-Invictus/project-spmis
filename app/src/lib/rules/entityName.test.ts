import { describe, expect, it } from 'vitest';
import { validateEntityName, validateEntityNameEdit } from './entityName';

describe('proposal/entity name rule', () => {
  it('trims and accepts non-blank names from 1 through 200 characters', () => {
    expect(validateEntityName('  A  ')).toEqual({ valid: true, value: 'A' });
    expect(validateEntityName('a'.repeat(200))).toEqual({
      valid: true,
      value: 'a'.repeat(200),
    });
  });

  it('rejects blank and whitespace-only names', () => {
    expect(validateEntityName('')).toEqual({ valid: false, reason: 'required' });
    expect(validateEntityName(' \t\n ')).toEqual({ valid: false, reason: 'required' });
  });

  it('rejects names longer than 200 characters', () => {
    expect(validateEntityName('a'.repeat(201))).toEqual({
      valid: false,
      reason: 'too_long',
    });
  });

  it('rejects an edit that leaves the trimmed name unchanged', () => {
    expect(validateEntityNameEdit('  Existing Name ', 'Existing Name')).toEqual({
      valid: false,
      reason: 'unchanged',
    });
    expect(validateEntityNameEdit('Different Name', 'Existing Name')).toEqual({
      valid: true,
      value: 'Different Name',
    });
  });
});
