import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { FunctionError } from './errors.ts';
import { createFacultyInvitationHandler } from './faculty-invitation-handler.ts';

const actorId = '30000000-0000-4000-8000-000000000004';
const userId = '31300000-abcd-4000-8000-000000000011';
const input = { full_name: ' Synthetic Faculty ', email: ' INVITE-213@EXAMPLE.TEST ', department_id: '10000000-ABCD-4000-8000-000000000001' };
const normalized = { full_name: 'Synthetic Faculty', email: 'invite-213@example.test', department_id: input.department_id.toLowerCase() };
function request(body = JSON.stringify(input), method = 'POST') {
  return new Request('http://localhost/functions/v1/faculty-invitations', {
    method, ...(method === 'POST' ? { body, headers: { 'content-type': 'application/json' } } : {}),
  });
}

Deno.test('admin invitation validates before calling Auth with the verified actor and normalized input', async () => {
  const calls: string[] = [];
  const handler = createFacultyInvitationHandler({
    getProfile: async () => ({ id: actorId, role: 'admin' }),
    async validate(id, value) {
      calls.push('validate'); assertEquals(id, actorId); assertEquals(value, normalized);
      return { error: null };
    },
    async invite(id, value) {
      calls.push('invite'); assertEquals(id, actorId); assertEquals(value, normalized);
      return { userId, error: null };
    },
  });
  const response = await handler(request());
  assertEquals(response.status, 201);
  assertEquals(await response.json(), { id: userId, email: normalized.email, status: 'pending' });
  assertEquals(calls, ['validate', 'invite']);
});

Deno.test('unauthenticated, pending, and non-admin callers cannot invoke invitation side effects', async () => {
  for (const kind of ['anonymous', 'pending', 'faculty'] as const) {
    let calls = 0;
    const handler = createFacultyInvitationHandler({
      getProfile: async () => {
        if (kind !== 'faculty') throw new FunctionError(kind === 'anonymous' ? 401 : 403, 'FORBIDDEN', 'Access denied.');
        return { id: actorId, role: 'faculty' };
      },
      validate: async () => { calls++; return { error: null }; },
      invite: async () => { calls++; return { userId, error: null }; },
    });
    assertEquals((await handler(request('{'))).status, kind === 'anonymous' ? 401 : 403);
    assertEquals(calls, 0);
  }
});

Deno.test('invitation rejects malformed JSON, unknown fields, privilege overrides and invalid email before side effects', async () => {
  let calls = 0;
  const handler = createFacultyInvitationHandler({
    getProfile: async () => ({ id: actorId, role: 'admin' }),
    validate: async () => { calls++; return { error: null }; },
    invite: async () => { calls++; return { userId, error: null }; },
  });
  for (const [body, status] of [
    ['{', 400], ['null', 422], ['[]', 422],
    [JSON.stringify({ ...input, role: 'admin' }), 422],
    [JSON.stringify({ ...input, spmis_invited_by: userId }), 422],
    [JSON.stringify({ ...input, redirect_to: 'https://example.test' }), 422],
    [JSON.stringify({ ...input, email: 'invalid' }), 422],
  ] as const) assertEquals((await handler(request(body))).status, status);
  assertEquals(calls, 0);
});

for (const [code, status] of [['23505', 409], ['42501', 403], ['23514', 422], ['XX000', 500]] as const) {
  Deno.test(`invitation preflight ${code} returns sanitized ${status} and never calls Auth`, async () => {
    let invites = 0;
    const handler = createFacultyInvitationHandler({
      getProfile: async () => ({ id: actorId, role: 'admin' }),
      validate: async () => ({ error: { code, message: 'Synthetic internal database details' } }),
      invite: async () => { invites++; return { userId, error: null }; },
    });
    const response = await handler(request());
    assertEquals(response.status, status);
    assertEquals((await response.json()).details, null);
    assertEquals(invites, 0);
  });
}

for (const [code, upstreamStatus, status] of [
  ['email_exists', 422, 409], ['user_already_exists', 422, 409],
  ['over_email_send_rate_limit', 429, 429], ['unexpected_failure', 500, 502],
] as const) {
  Deno.test(`invitation Auth ${code} returns sanitized ${status}`, async () => {
    const handler = createFacultyInvitationHandler({
      getProfile: async () => ({ id: actorId, role: 'admin' }),
      validate: async () => ({ error: null }),
      invite: async () => ({ userId: null, error: { code, status: upstreamStatus, message: 'Synthetic private Auth details' } }),
    });
    const response = await handler(request());
    assertEquals(response.status, status);
    const body = await response.json();
    assertEquals(body.details, null);
    assertEquals(JSON.stringify(body).includes('Synthetic private'), false);
    if (status === 429) assertEquals(body.hint, 'Try again later.');
  });
}

Deno.test('invitation handles CORS and unsupported methods without touching Auth', async () => {
  let calls = 0;
  const handler = createFacultyInvitationHandler({
    getProfile: async () => { calls++; return { id: actorId, role: 'admin' }; },
    validate: async () => { calls++; return { error: null }; },
    invite: async () => { calls++; return { userId, error: null }; },
  });
  assertEquals((await handler(request('', 'OPTIONS'))).status, 200);
  assertEquals((await handler(request('', 'GET'))).status, 405);
  assertEquals(calls, 0);
});

Deno.test('invitation never reports success when Auth returns no user', async () => {
  const handler = createFacultyInvitationHandler({
    getProfile: async () => ({ id: actorId, role: 'admin' }),
    validate: async () => ({ error: null }),
    invite: async () => ({ userId: null, error: null }),
  });
  assertEquals((await handler(request())).status, 502);
});
