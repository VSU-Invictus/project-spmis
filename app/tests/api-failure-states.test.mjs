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
const { ApiRequestError, normalizeApiError } = await import(errorsUrl);

const reqSource = await readFile(new URL('../src/lib/api/request.ts', import.meta.url), 'utf8');
const reqOutput = ts.transpileModule(reqSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace("'./errors'", JSON.stringify(errorsUrl));
const { request } = await import(`data:text/javascript;base64,${Buffer.from(reqOutput).toString('base64')}`);

test('handles 422 REVIEW_WORD_LIMIT failure scenario properly', async () => {
  const mock422Payload = {
    code: 'REVIEW_WORD_LIMIT',
    message: 'Reviews must contain no more than 500 words.',
    details: 'The extracted review contains 501 words; the limit is 500.',
    hint: 'Shorten the review and submit it again.',
  };

  await assert.rejects(
    request(
      Promise.resolve({
        error: mock422Payload,
        response: new Response(JSON.stringify(mock422Payload), { status: 422 }),
      })
    ),
    (err) => {
      assert.ok(err instanceof ApiRequestError);
      assert.equal(err.status, 422);
      assert.equal(err.code, 'REVIEW_WORD_LIMIT');
      assert.equal(err.message, 'Reviews must contain no more than 500 words.');
      assert.equal(err.details, 'The extracted review contains 501 words; the limit is 500.');
      assert.equal(err.hint, 'Shorten the review and submit it again.');
      return true;
    }
  );
});

test('handles 429 RATE_LIMITED failure scenario on AI Chat Assistant', async () => {
  const mock429Payload = {
    code: 'RATE_LIMITED',
    message: 'The AI Chat Assistant is temporarily unavailable.',
    details: null,
    hint: 'Try again later.',
  };

  await assert.rejects(
    request(
      Promise.resolve({
        error: mock429Payload,
        response: new Response(JSON.stringify(mock429Payload), { status: 429 }),
      })
    ),
    (err) => {
      assert.ok(err instanceof ApiRequestError);
      assert.equal(err.status, 429);
      assert.equal(err.code, 'RATE_LIMITED');
      assert.equal(err.message, 'The AI Chat Assistant is temporarily unavailable.');
      assert.equal(err.hint, 'Try again later.');
      return true;
    }
  );
});

test('handles 401 Unauthorized unauthenticated blocking rule', async () => {
  const mock401Payload = {
    code: 'PGRST301',
    message: 'JWT expired or token missing',
    details: null,
    hint: 'Re-authenticate with Google OAuth.',
  };

  await assert.rejects(
    request(
      Promise.resolve({
        error: mock401Payload,
        response: new Response(JSON.stringify(mock401Payload), { status: 401 }),
      })
    ),
    (err) => {
      assert.ok(err instanceof ApiRequestError);
      assert.equal(err.status, 401);
      assert.equal(err.code, 'PGRST301');
      assert.equal(err.hint, 'Re-authenticate with Google OAuth.');
      return true;
    }
  );
});

