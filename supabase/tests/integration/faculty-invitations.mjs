// Opt-in, local-only HTTP integration check. Never run against a hosted project.
// Synthetic fixtures remain until the next local database reset. No tokens are printed.
import assert from 'node:assert/strict';
import { execFileSync, execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

let phase = 'read local Supabase configuration';
try {
  const local = JSON.parse(execSync('npx supabase status -o json', {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }));
  const base = local.API_URL;
  assert.equal(base, 'http://127.0.0.1:54321', 'Only the documented disposable local stack is supported');
  assert.ok(local.SERVICE_ROLE_KEY && local.ANON_KEY);
  const suffix = randomUUID().replaceAll('-', '');
  const adminEmail = `admin-${suffix}@example.test`;
  const inviteEmail = `faculty-${suffix}@example.test`;
  const department = '10000000-0000-4000-8000-000000000001';

  async function api(path, { token = local.SERVICE_ROLE_KEY, method = 'GET', body } = {}) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { apikey: local.ANON_KEY, Authorization: `Bearer ${token}`, 'content-type': 'application/json', Prefer: 'return=representation' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    return { status: response.status, data: text ? JSON.parse(text) : null };
  }

  // Auth API setup, not a production password or alternate application login flow.
  async function session(email) {
    const link = await api('/auth/v1/admin/generate_link', { method: 'POST', body: { type: 'magiclink', email } });
    assert.equal(link.status, 200);
    assert.ok(link.data.hashed_token);
    const verified = await api('/auth/v1/verify', {
      token: local.ANON_KEY, method: 'POST', body: { type: 'magiclink', token_hash: link.data.hashed_token },
    });
    assert.equal(verified.status, 200);
    assert.ok(verified.data.access_token);
    return verified.data.access_token;
  }

  phase = 'create synthetic admin through supported Auth API';
  const admin = await api('/auth/v1/admin/users', {
    method: 'POST', body: { email: adminEmail, email_confirm: true },
  });
  assert.equal(admin.status, 200);
  const adminId = admin.data.id;
  assert.ok(adminId);
  const adminProfile = await api('/rest/v1/faculty_profiles', {
    method: 'POST', body: { id: adminId, email: adminEmail, full_name: 'Synthetic Integration Admin', department_id: department, role: 'admin', status: 'active' },
  });
  assert.equal(adminProfile.status, 201);
  const adminToken = await session(adminEmail);
  const input = { email: inviteEmail, full_name: 'Synthetic Integration Faculty', department_id: department };

  phase = 'reject anonymous invitations';
  assert.equal((await api('/functions/v1/faculty-invitations', { token: local.ANON_KEY, method: 'POST', body: input })).status, 401);

  phase = 'invite faculty through the real Edge Function and Auth API';
  const invited = await api('/functions/v1/faculty-invitations', { token: adminToken, method: 'POST', body: input });
  assert.equal(invited.status, 201);
  const userId = invited.data.id;
  assert.match(userId, /^[0-9a-f-]{36}$/i);
  assert.equal(invited.data.status, 'pending');
  phase = 'verify Auth identity, instance, pending profile and approval application';
  // Read-only inspection of Auth internals avoids granting Auth-table access to service_role.
  const authIntegrity = execFileSync('docker', ['exec', 'supabase_db_project-spmis', 'psql', '-U', 'postgres', '-d', 'postgres', '-Atc',
    `select count(*) from auth.users u where u.id = '${userId}' and u.instance_id is not null and exists (select 1 from auth.identities i where i.user_id = u.id);`],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  assert.equal(authIntegrity, '1');
  const profiles = await api(`/rest/v1/faculty_profiles?id=eq.${userId}`);
  assert.equal(profiles.data.length, 1);
  assert.equal(profiles.data[0].status, 'pending');
  assert.equal(profiles.data[0].role, 'faculty');
  const queue = await api(`/rest/v1/approval_queue_items?submitted_by=eq.${userId}&type=eq.faculty_account`);
  assert.equal(queue.data.length, 1);
  assert.equal(queue.data[0].status, 'pending');

  phase = 'reject duplicate email without extra accounts or applications';
  const duplicate = await api('/functions/v1/faculty-invitations', {
    token: adminToken, method: 'POST', body: { ...input, email: ` ${inviteEmail.toUpperCase()} ` },
  });
  assert.equal(duplicate.status, 409);
  assert.equal((await api(`/rest/v1/faculty_profiles?email=eq.${encodeURIComponent(inviteEmail)}`)).data.length, 1);
  assert.equal((await api(`/rest/v1/approval_queue_items?submitted_by=eq.${userId}`)).data.length, 1);

  phase = 'verify concurrent duplicate invitations';
  const concurrentInput = { ...input, email: `concurrent-${suffix}@example.test` };
  const overlapping = await Promise.all([0, 1].map(() => api('/functions/v1/faculty-invitations', {
    token: adminToken, method: 'POST', body: concurrentInput,
  })));
  assert.deepEqual(overlapping.map((result) => result.status).sort(), [201, 409]);
  assert.equal((await api(`/rest/v1/faculty_profiles?email=eq.${encodeURIComponent(concurrentInput.email)}`)).data.length, 1);

  phase = 'verify pending restrictions using a real Auth session';
  const facultyToken = await session(inviteEmail);
  for (const table of ['student_profiles', 'reviews']) {
    const result = await api(`/rest/v1/${table}?select=id`, { token: facultyToken });
    assert.equal(result.status, 200);
    assert.deepEqual(result.data, []);
  }
  assert.equal((await api('/functions/v1/chat', { token: facultyToken, method: 'POST', body: { message: 'Synthetic access check' } })).status, 403);
  assert.equal((await api('/functions/v1/faculty-invitations', { token: facultyToken, method: 'POST', body: input })).status, 403);

  phase = 'approve through the real approvals endpoint';
  assert.equal((await api('/functions/v1/approvals', {
    token: adminToken, method: 'POST', body: { decision: 'approve', application_ids: [queue.data[0].id] },
  })).status, 200);
  phase = 'verify active faculty access after approval';
  const own = await api('/rest/v1/rpc/get_own_profile', { token: facultyToken });
  assert.equal(own.data.status, 'active');
  const students = await api('/rest/v1/student_profiles?select=id', { token: facultyToken });
  assert.equal(students.status, 200);
  assert.ok(students.data.length > 0);
  console.log('PASS: supported Auth invitation, identity integrity, duplicate rejection, pending restrictions, admin approval, active faculty access.');
  console.log('Synthetic local fixtures remain until the next database reset. Google OAuth browser registration is a separate check.');
} catch {
  console.error(`FAIL during: ${phase}. No Auth responses, tokens, or keys were printed.`);
  process.exitCode = 1;
}
