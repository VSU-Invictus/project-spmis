import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError } from './errors.ts';
import { embedText, generateAnswer } from './gemini.ts';
import { reidentifyText } from './deidentify.ts';

const originalFetch = globalThis.fetch;

Deno.test('Gemini generation default and model overrides use the configured endpoints', async () => {
  const variables = ['GEMINI_API_KEY', 'GEMINI_EMBEDDING_MODEL', 'GEMINI_GENERATION_MODEL'];
  const saved = variables.map((name) => Deno.env.get(name));
  const urls: string[] = [];
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  Deno.env.delete('GEMINI_GENERATION_MODEL');
  globalThis.fetch = (input: string | URL | Request) => {
    urls.push(String(input));
    return Promise.resolve(new Response(JSON.stringify({
      embedding: { values: Array(768).fill(0.1) },
      candidates: [{ content: { parts: [{ text: 'Synthetic answer' }] } }],
    }), { status: 200 }));
  };
  try {
    assertEquals(await generateAnswer('Synthetic prompt'), 'Synthetic answer');
    Deno.env.set('GEMINI_GENERATION_MODEL', 'test-generation-model');
    await generateAnswer('Synthetic prompt');
    Deno.env.set('GEMINI_EMBEDDING_MODEL', 'test-embedding-model');
    await embedText('Synthetic review');
    assertEquals(urls, [
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/test-generation-model:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/test-embedding-model:embedContent',
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    variables.forEach((name, index) => {
      const value = saved[index];
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    });
  }
});

function mockFetch(status: number, body: Record<string, unknown>): void {
  globalThis.fetch = (_input: string | URL | Request, _init?: RequestInit) =>
    Promise.resolve(new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }));
}

Deno.test('askChatbot handles mocked Gemini 200 with reverse substitution', async () => {
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  mockFetch(200, {
    candidates: [{
      content: { parts: [{ text: '{{STUDENT:40000000-0000-4000-8000-000000000001}} showed growth.' }] },
    }],
  });

  try {
    const answer = await generateAnswer('Review context with deidentified text');
    assertEquals(
      reidentifyText(answer, [{
        id: '40000000-0000-4000-8000-000000000001',
        first_name: 'Maria',
        middle_name: 'Dela Cruz',
        last_name: 'Santos',
        student_id_number: 'TEST-001',
        program_name: 'Example Computer Science',
      }]),
      'Maria Dela Cruz Santos (TEST-001, Example Computer Science) showed growth.',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('askChatbot converts mocked Gemini 429 to contract rate-limit error', async () => {
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  mockFetch(429, { error: { message: 'Too Many Requests' } });

  try {
    let error: unknown;
    try {
      await generateAnswer('prompt');
    } catch (caught) {
      error = caught;
    }
    assertEquals(error instanceof FunctionError, true);
    const response = errorResponse(error);
    assertEquals(response.status, 429);
    assertEquals(await response.json(), {
      code: 'RATE_LIMITED',
      message: 'The AI Chat Assistant is temporarily unavailable.',
      details: null,
      hint: 'Try again later.',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('embedText requests and validates 768-dimensional embeddings with the default model', async () => {
  const originalApiKey = Deno.env.get('GEMINI_API_KEY');
  const originalModel = Deno.env.get('GEMINI_EMBEDDING_MODEL');
  Deno.env.delete('GEMINI_EMBEDDING_MODEL');
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const values = Array(768).fill(0.1);
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    assertEquals(String(input), 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent');
    assertEquals(new Headers(init?.headers).get('x-goog-api-key'), 'test-key');
    assertEquals(JSON.parse(String(init?.body)), {
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text: 'review text' }] },
      outputDimensionality: 768,
    });
    return Promise.resolve(new Response(JSON.stringify({ embedding: { values } }), { status: 200 }));
  };

  try {
    assertEquals(await embedText('review text'), `[${values.join(',')}]`);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalModel === undefined) Deno.env.delete('GEMINI_EMBEDDING_MODEL');
    else Deno.env.set('GEMINI_EMBEDDING_MODEL', originalModel);
    if (originalApiKey === undefined) Deno.env.delete('GEMINI_API_KEY');
    else Deno.env.set('GEMINI_API_KEY', originalApiKey);
  }
});

Deno.test('embedText rejects mocked Gemini invalid embedding values', async () => {
  const originalApiKey = Deno.env.get('GEMINI_API_KEY');
  Deno.env.set('GEMINI_API_KEY', 'test-key');

  try {
    for (const values of ['invalid', [], Array(3072).fill(0.1), [...Array(767).fill(0.1), 'invalid']]) {
      mockFetch(200, { embedding: { values } });
      let error: unknown;
      try {
        await embedText('review text');
      } catch (caught) {
        error = caught;
      }
      assertEquals(error instanceof FunctionError, true);
      const response = errorResponse(error);
      assertEquals(response.status, 502);
      assertEquals(await response.json(), {
        code: 'AI_PROVIDER_ERROR',
        message: 'The AI provider returned an invalid embedding.',
        details: null,
        hint: null,
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) Deno.env.delete('GEMINI_API_KEY');
    else Deno.env.set('GEMINI_API_KEY', originalApiKey);
  }
});

Deno.test('geminiRequest sends API key in x-goog-api-key header and omits raw provider details on 502', async () => {
  const originalApiKey = Deno.env.get('GEMINI_API_KEY');
  Deno.env.set('GEMINI_API_KEY', 'secret-header-key');
  let capturedUrl = '';
  let capturedHeader: string | null = null;
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedHeader = new Headers(init?.headers).get('x-goog-api-key');
    return Promise.resolve(new Response('raw upstream stacktrace with internal details', { status: 500 }));
  };

  try {
    let error: unknown;
    try {
      await generateAnswer('prompt');
    } catch (caught) {
      error = caught;
    }
    assertEquals(capturedUrl.includes('key='), false);
    assertEquals(capturedHeader, 'secret-header-key');
    assertEquals(error instanceof FunctionError, true);
    const response = errorResponse(error);
    assertEquals(response.status, 502);
    assertEquals(await response.json(), {
      code: 'AI_PROVIDER_ERROR',
      message: 'The AI provider request failed.',
      details: null,
      hint: null,
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) Deno.env.delete('GEMINI_API_KEY');
    else Deno.env.set('GEMINI_API_KEY', originalApiKey);
  }
});
