import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { errorResponse, FunctionError } from './errors.ts';
import { enforceChatRateLimit } from './chat-rate-limit.ts';

Deno.test('chat rate limit persists across invocations and rejects request 21', async () => {
  const requestsByActor = new Map<string, number[]>();
  let now = Date.now();
  const createInvocationRpc = () => (actorId: string) => {
    const recent = (requestsByActor.get(actorId) ?? []).filter((timestamp) => now - timestamp < 60_000);
    requestsByActor.set(actorId, recent);
    if (recent.length >= 20) return Promise.resolve({ data: false, error: null });
    recent.push(now);
    requestsByActor.set(actorId, recent);
    return Promise.resolve({ data: true, error: null });
  };

  for (let request = 0; request < 20; request++) {

    await enforceChatRateLimit('faculty-1', createInvocationRpc());
  }

  const error = await assertRejects(
    () => enforceChatRateLimit('faculty-1', createInvocationRpc()),
    FunctionError,
  );
  assertEquals(errorResponse(error).status, 429);
  assertEquals(await errorResponse(error).json(), {
    code: 'RATE_LIMITED',
    message: 'The AI Chat Assistant is temporarily unavailable.',
    details: null,
    hint: 'Try again later.',
  });

  now += 60_001;
  await enforceChatRateLimit('faculty-1', createInvocationRpc());
  assertEquals(requestsByActor.get('faculty-1')?.length, 1);
});

Deno.test('chat rate limit maps database failures instead of allowing the request', async () => {
  const error = await assertRejects(
    () => enforceChatRateLimit('faculty-1', () => Promise.resolve({
      data: null,
      error: { code: '42501', message: 'The caller is not authorized for this operation.' },
    })),
    FunctionError,
  );
  assertEquals(errorResponse(error).status, 403);
});