import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError } from './errors.ts';
import { embedText, generateAnswer } from './gemini.ts';
import { reidentifyText } from './deidentify.ts';

const originalFetch = globalThis.fetch;

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

Deno.test('embedText formats mocked Gemini embedding values', async () => {
  const originalApiKey = Deno.env.get('GEMINI_API_KEY');
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  mockFetch(200, { embedding: { values: [0.1, 0.2, 0.3] } });

  try {
    assertEquals(await embedText('review text'), '[0.1,0.2,0.3]');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) Deno.env.delete('GEMINI_API_KEY');
    else Deno.env.set('GEMINI_API_KEY', originalApiKey);
  }
});

Deno.test('embedText rejects mocked Gemini invalid embedding values', async () => {
  const originalApiKey = Deno.env.get('GEMINI_API_KEY');
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  mockFetch(200, { embedding: { values: 'invalid' } });

  try {
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
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) Deno.env.delete('GEMINI_API_KEY');
    else Deno.env.set('GEMINI_API_KEY', originalApiKey);
  }
});
