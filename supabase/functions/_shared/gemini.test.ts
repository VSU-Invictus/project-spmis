import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError } from './errors.ts';
import { generateAnswer } from './gemini.ts';
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
