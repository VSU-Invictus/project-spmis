import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function moduleUrl(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
}

const errorsUrl = await moduleUrl('../src/lib/api/errors.ts');
const source = await readFile(new URL('../src/lib/api/request.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace("'./errors'", JSON.stringify(errorsUrl));
const { request } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
const { ApiRequestError } = await import(errorsUrl);

test('200 with an explicit undefined error returns data', async () => {
  const data = { id: 'synthetic-id' };
  assert.equal(await request(Promise.resolve({ data, error: undefined, response: new Response('{}') })), data);
});

test('204 succeeds without a body', async () => {
  assert.equal(await request(Promise.resolve({ data: undefined, response: new Response(null, { status: 204 }) })), undefined);
});

test('successful null detail response stays null', async () => {
  assert.equal(await request(Promise.resolve({ data: null, response: new Response('null') })), null);
});

test('failed requests preserve the API error and status', async () => {
  await assert.rejects(request(Promise.resolve({ error: { code: 'FORBIDDEN', message: 'Denied', hint: 'Sign in', details: null }, response: new Response(null, { status: 403 }) })), error => {
    assert.ok(error instanceof ApiRequestError);
    assert.equal(error.status, 403);
    assert.equal(error.code, 'FORBIDDEN');
    assert.equal(error.hint, 'Sign in');
    return true;
  });
});

test('non-2xx without an error payload still fails', async () => {
  await assert.rejects(request(Promise.resolve({ error: undefined, response: new Response(null, { status: 500 }) })), error => error instanceof ApiRequestError && error.status === 500);
});

test('network failures become typed errors', async () => {
  await assert.rejects(request(Promise.reject(new Error('Network unavailable'))), error => error instanceof ApiRequestError && error.message === 'Network unavailable');
});
