import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/api/errors.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { ApiRequestError, normalizeApiError, throwApiError } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

test('normalizes a PostgREST error and preserves its HTTP status', () => {
  assert.deepEqual(normalizeApiError({ code: 'PGRST103', message: 'Invalid range', details: null, hint: 'Use a smaller offset.' }, 416), {
    code: 'PGRST103', message: 'Invalid range', details: null, hint: 'Use a smaller offset.', status: 416,
  });
});

test('normalizes an Edge Function error envelope', () => {
  assert.deepEqual(normalizeApiError({ error: { code: 'RATE_LIMITED', message: 'Try again later.', hint: 'Retry tomorrow.' } }, 429), {
    code: 'RATE_LIMITED', message: 'Try again later.', details: null, hint: 'Retry tomorrow.', status: 429,
  });
});

test('throws a typed API error for non-2xx responses', () => {
  assert.throws(() => throwApiError({ code: 'FORBIDDEN', message: 'Access denied.', details: null, hint: null }, 403), (error) => {
    assert.ok(error instanceof ApiRequestError);
    assert.equal(error.code, 'FORBIDDEN');
    assert.equal(error.status, 403);
    return true;
  });
});
