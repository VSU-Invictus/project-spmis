import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { FunctionError } from './errors.ts';
import { sendReservedFacultyInvitation } from './reserved-faculty-invitation.ts';

Deno.test('overlapping invitations permit only one Auth call', async () => {
  let reserved = false;
  let sends = 0;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => { release = resolve; });
  const dependencies = {
    async reserve() {
      if (reserved) return { data: null, error: { code: '23505' } };
      reserved = true;
      return { data: 'synthetic-token', error: null };
    },
    async send() { sends++; await barrier; return { userId: 'synthetic-user', error: null }; },
    async finish(token: string) { assertEquals(token, 'synthetic-token'); return { data: true, error: null }; },
  };
  const first = sendReservedFacultyInvitation(dependencies);
  const rejected = await assertRejects(() => sendReservedFacultyInvitation(dependencies), FunctionError);
  assertEquals(rejected.status, 409);
  release();
  assertEquals((await first).userId, 'synthetic-user');
  assertEquals(sends, 1);
});

Deno.test('reservation failures are mapped without sending invitations', async () => {
  for (const [code, status] of [['23505', 409], ['42501', 403], ['23514', 422], ['XX000', 500]] as const) {
    let sends = 0;
    const error = await assertRejects(() => sendReservedFacultyInvitation({
      reserve: async () => ({ data: null, error: { code } }),
      send: async () => { sends++; return { userId: null, error: null }; },
      finish: async () => ({ data: true, error: null }),
    }), FunctionError);
    assertEquals(error.status, status);
    assertEquals(sends, 0);
  }
});

Deno.test('known Auth rejection releases only its own reservation', async () => {
  let finished = '';
  const result = await sendReservedFacultyInvitation({
    reserve: async () => ({ data: 'synthetic-token', error: null }),
    send: async () => ({ userId: null, error: { code: 'email_exists', status: 422 } }),
    finish: async (token) => { finished = token; return { data: true, error: null }; },
  });
  assertEquals(finished, 'synthetic-token');
  assertEquals(result.error?.code, 'email_exists');
});

Deno.test('uncertain Auth failures retain the reservation until expiry', async () => {
  for (const status of [undefined, 0, 500, 502]) {
    let finishes = 0;
    await sendReservedFacultyInvitation({
      reserve: async () => ({ data: 'synthetic-token', error: null }),
      send: async () => ({ userId: null, error: { status } }),
      finish: async () => { finishes++; return { data: true, error: null }; },
    });
    assertEquals(finishes, 0);
  }
});

Deno.test('stale reservation cannot report an invitation as newly created', async () => {
  const error = await assertRejects(() => sendReservedFacultyInvitation({
    reserve: async () => ({ data: 'stale-token', error: null }),
    send: async () => ({ userId: 'synthetic-user', error: null }),
    finish: async () => ({ data: false, error: null }),
  }), FunctionError);
  assertEquals(error.status, 409);
});

Deno.test('network exceptions do not release an invitation with an unknown outcome', async () => {
  let finishes = 0;
  await assertRejects(() => sendReservedFacultyInvitation({
    reserve: async () => ({ data: 'synthetic-token', error: null }),
    send: async () => { throw new Error('Synthetic network failure'); },
    finish: async () => { finishes++; return { data: true, error: null }; },
  }));
  assertEquals(finishes, 0);
});
