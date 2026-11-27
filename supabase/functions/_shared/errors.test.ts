import { assertEquals, assertRejects, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { assertAllowedKeys, errorResponse, FunctionError, mapDatabaseError, readJson } from './errors.ts';

function jsonRequest(body: string): Request {
  return new Request('http://localhost/synthetic-test', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body,
  });
}

Deno.test('readJson returns a sanitized 400 envelope for malformed or empty JSON', async () => {
  for (const body of ['', '{', '{"message":', '{"message":"synthetic",}']) {
    const error = await assertRejects(() => readJson(jsonRequest(body), ['message']), FunctionError);
    const response = errorResponse(error);
    assertEquals(response.status, 400);
    assertEquals(await response.json(), {
      code: 'INVALID_REQUEST', message: 'The request body must contain valid JSON.', details: null, hint: null,
    });
  }
});

Deno.test('readJson returns 422 rather than 400 for valid JSON with a non-object shape', async () => {
  for (const body of ['null', '[]', '1', '"synthetic"', 'false']) {
    const error = await assertRejects(() => readJson(jsonRequest(body), ['message']), FunctionError);
    assertEquals(error.status, 422);
    assertEquals(error.message, 'The request body must be a JSON object.');
  }
});

const requestCases = [
  { allowed: ['student_id', 'body_document', 'tags'], body: { student_id: '40000000-0000-4000-8000-000000000001', body_document: { blocks: [] }, tags: [] } },
  { allowed: ['body_document', 'tags'], body: { body_document: { blocks: [] }, tags: [] } },
  { allowed: ['action'], body: { action: 'hide' } },
  { allowed: ['message', 'history'], body: { message: 'Synthetic question', history: [] } },
  { allowed: ['application_ids', 'decision', 'department_assignments'], body: { application_ids: [], decision: 'approve', department_assignments: [] } },
  { allowed: ['application_ids', 'decision', 'reason'], body: { application_ids: [], decision: 'reject', reason: 'Synthetic reason' } },
];

Deno.test('readJson preserves allowed fields including optional empty arrays across operation shapes', async () => {
  for (const { allowed, body } of requestCases) {
    assertEquals(await readJson(jsonRequest(JSON.stringify(body)), allowed), body);
  }
});

Deno.test('readJson rejects unsupported fields for every Edge request shape', async () => {
  for (const { allowed, body } of requestCases) {
    const error = await assertRejects(
      () => readJson(jsonRequest(JSON.stringify({ ...body, tag: 'synthetic typo' })), allowed),
      FunctionError,
    );
    const response = errorResponse(error);
    assertEquals(response.status, 422);
    assertEquals(await response.json(), {
      code: 'INVALID_REQUEST', message: 'The request contains unsupported fields.', details: null, hint: null,
    });
  }
  const error = await assertRejects(
    () => readJson(jsonRequest('{"message":"synthetic","__proto__":{}}'), ['message']), FunctionError,
  );
  assertEquals(error.status, 422);
});

Deno.test('closed request fields reject cross-decision properties and nested extras', () => {
  for (const { body, allowed } of [
    { body: { decision: 'approve', reason: 'Synthetic reason' }, allowed: ['application_ids', 'decision', 'department_assignments'] },
    { body: { decision: 'reject', department_assignments: [] }, allowed: ['application_ids', 'decision', 'reason'] },
    { body: { role: 'user', content: 'Synthetic text', extra: true }, allowed: ['role', 'content'] },
    { body: { application_id: 'synthetic-id', department_id: 'synthetic-id', extra: true }, allowed: ['application_id', 'department_id'] },
  ]) {
    const error = assertThrows(() => assertAllowedKeys(body, allowed), FunctionError);
    assertEquals(error.status, 422);
  }
});

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
