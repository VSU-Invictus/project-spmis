import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError, mapDatabaseError } from './errors.ts';

for (const testCase of [
  { sqlstate: '23503', status: 409, code: 'CONFLICT', message: 'The operation conflicts with a related record.' },
  { sqlstate: '23502', status: 422, code: 'VALIDATION_ERROR', message: 'A required value is missing or invalid.' },
  { sqlstate: '22P02', status: 422, code: 'VALIDATION_ERROR', message: 'A required value is missing or invalid.' },
]) {
  Deno.test(`database ${testCase.sqlstate} maps to sanitized HTTP ${testCase.status}`, async () => {
    const error = assertThrows(() => mapDatabaseError({
      code: testCase.sqlstate,
      message: 'Synthetic internal failure in table example_private, column example_secret, constraint example_fk',
    }), FunctionError);
    const response = errorResponse(error);
    assertEquals(response.status, testCase.status);
    assertEquals(await response.json(), {
      code: testCase.code, message: testCase.message, details: null, hint: null,
    });
  });
}

Deno.test('unmapped and missing database errors return 500 without internal database details', async () => {
  for (const databaseError of [
    { code: 'XX000', message: 'Synthetic table example_private, column example_secret, constraint example_check' },
    { message: 'Synthetic internal database message' },
    {},
    null,
  ]) {
    const error = assertThrows(() => mapDatabaseError(databaseError), FunctionError);
    const response = errorResponse(error);
    assertEquals(response.status, 500);
    assertEquals(await response.json(), {
      code: 'DATABASE_ERROR', message: 'The database operation failed.', details: null, hint: null,
    });
  }
});

Deno.test('existing authorization, missing-resource, conflict and validation mappings retain their statuses', async () => {
  for (const [sqlstate, status, code] of [
    ['42501', 403, 'FORBIDDEN'],
    ['P0002', 404, 'NOT_FOUND'],
    ['55000', 409, 'CONFLICT'],
    ['23505', 409, 'CONFLICT'],
    ['23514', 422, 'VALIDATION_ERROR'],
    ['22023', 422, 'VALIDATION_ERROR'],
  ] as const) {
    const error = assertThrows(() => mapDatabaseError({ code: sqlstate }), FunctionError);
    const response = errorResponse(error);
    assertEquals(response.status, status);
    const body = await response.json();
    assertEquals(body.code, code);
    assertEquals(body.details, null);
    assertEquals(body.hint, null);
  }
});
