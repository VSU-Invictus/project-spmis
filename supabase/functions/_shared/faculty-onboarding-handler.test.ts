import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { FunctionError } from './errors.ts';
import { createFacultyOnboardingHandler } from './faculty-onboarding-handler.ts';

const userId = '31300000-abcd-4000-8000-000000000001';
const input = { full_name: ' Synthetic Faculty ', department_id: '10000000-ABCD-4000-8000-000000000001' };
const profile = { id: userId, full_name: 'Synthetic Faculty', role: 'faculty', status: 'pending' };
function request(body: string = JSON.stringify(input), method = 'POST') {
  return new Request('http://localhost/functions/v1/faculty-onboarding', {
    method, ...(method === 'POST' ? { body, headers: { 'content-type': 'application/json' } } : {}),
  });
}

Deno.test('onboarding handler uses verified identity and normalized fields without an existing profile', async () => {
  let calls = 0;
  const handler = createFacultyOnboardingHandler({
    listDepartments: async () => ({ data: [], error: null }),
    requireUser: async () => ({ id: userId }),
    async complete(id, value) {
      calls++;
      assertEquals(id, userId);
      assertEquals(value, { full_name: 'Synthetic Faculty', department_id: input.department_id.toLowerCase() });
      return { data: profile, error: null };
    },
  });
  const response = await handler(request());
  assertEquals(response.status, 201);
  assertEquals(await response.json(), profile);
  assertEquals(calls, 1);
});

Deno.test('onboarding authentication failure prevents parsing and database calls', async () => {
  let calls = 0;
  const handler = createFacultyOnboardingHandler({
    listDepartments: async () => ({ data: [], error: null }),
    requireUser: async () => { throw new FunctionError(401, 'UNAUTHORIZED', 'Authentication is required.'); },
    complete: async () => { calls++; return { data: profile, error: null }; },
  });
  assertEquals((await handler(request('{'))).status, 401);
  assertEquals(calls, 0);
});

Deno.test('onboarding rejects malformed JSON and invalid or privileged body fields before writes', async () => {
  let calls = 0;
  const handler = createFacultyOnboardingHandler({
    listDepartments: async () => ({ data: [], error: null }),
    requireUser: async () => ({ id: userId }),
    complete: async () => { calls++; return { data: profile, error: null }; },
  });
  for (const [body, status] of [
    ['{', 400], ['', 400], ['null', 422], ['[]', 422],
    [JSON.stringify({ ...input, role: 'admin' }), 422],
    [JSON.stringify({ ...input, id: 'forged-id' }), 422],
    [JSON.stringify({ ...input, status: 'active' }), 422],
  ] as const) {
    assertEquals((await handler(request(body))).status, status);
  }
  assertEquals(calls, 0);
});

Deno.test('onboarding handles CORS and rejects unsupported methods without authentication or writes', async () => {
  let calls = 0;
  const handler = createFacultyOnboardingHandler({
    listDepartments: async () => ({ data: [], error: null }),
    requireUser: async () => { calls++; return { id: userId }; },
    complete: async () => { calls++; return { data: profile, error: null }; },
  });
  const response = await handler(request('', 'OPTIONS'));
  assertEquals(response.status, 200);
  assertEquals(response.headers.get('access-control-allow-origin'), '*');
  assertEquals(response.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assertEquals((await handler(request('', 'DELETE'))).status, 405);
  assertEquals(calls, 0);
});

for (const [code, status] of [['23505', 409], ['42501', 403], ['23514', 422], ['22P02', 422], ['XX000', 500]] as const) {
  Deno.test(`onboarding maps database ${code} to a sanitized ${status} response`, async () => {
    const handler = createFacultyOnboardingHandler({
      listDepartments: async () => ({ data: [], error: null }),
      requireUser: async () => ({ id: userId }),
      complete: async () => ({ data: null, error: { code, message: 'Synthetic internal table or constraint details' } }),
    });
    const response = await handler(request());
    assertEquals(response.status, status);
    const body = await response.json();
    assertEquals(body.details, null);
    assertEquals(body.hint, null);
    assertEquals(JSON.stringify(body).includes('Synthetic internal'), false);
  });
}

Deno.test('onboarding treats a missing database result as a safe server error', async () => {
  const handler = createFacultyOnboardingHandler({
    listDepartments: async () => ({ data: [], error: null }),
    requireUser: async () => ({ id: userId }),
    complete: async () => ({ data: null, error: null }),
  });
  assertEquals((await handler(request())).status, 500);
});

Deno.test('onboarding GET uses verified identity and returns only department choices without writes', async () => {
  const choices = [{ id: input.department_id.toLowerCase(), name: 'Synthetic Department' }];
  let writes = 0;
  const handler = createFacultyOnboardingHandler({
    requireUser: async () => ({ id: userId }),
    async listDepartments(id) { assertEquals(id, userId); return { data: choices, error: null }; },
    complete: async () => { writes++; return { data: profile, error: null }; },
  });
  const response = await handler(request('', 'GET'));
  assertEquals(response.status, 200);
  assertEquals(await response.json(), choices);
  assertEquals(writes, 0);
});

Deno.test('onboarding department failures are sanitized', async () => {
  for (const [code, status] of [['42501', 403], ['XX000', 500]] as const) {
    const handler = createFacultyOnboardingHandler({
      requireUser: async () => ({ id: userId }),
      listDepartments: async () => ({ data: null, error: { code } }),
      complete: async () => ({ data: profile, error: null }),
    });
    const response = await handler(request('', 'GET'));
    assertEquals(response.status, status);
    assertEquals((await response.json()).details, null);
  }
});
