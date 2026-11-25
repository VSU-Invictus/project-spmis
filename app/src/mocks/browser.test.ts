import { expect, it } from 'vitest';
import { isRosterMockRequest, rosterMockHandlers } from './browser';
import { server } from './server';

const origin = 'http://localhost:4010';
const studentQueue = '/rest/v1/approval_queue_items';
const approvals = '/functions/v1/approvals';
const studentId = '27b5cc8d-1679-4e44-9e42-7b4cac5ae119';

const post = (path: string, body: unknown) => new Request(origin + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

it('limits browser mocks to the local API origin and relevant operations', async () => {
  for (const request of [
    new Request('https://example.test/rest/v1/rpc/search_students'),
    new Request(origin + '/rest/v1/programs'),
    new Request(origin + '/rest/v1/departments'),
    new Request(origin + '/rest/v1/audit_log_entries'),
    new Request(origin + studentQueue + '?type=eq.faculty_account&status=eq.pending'),
    post(studentQueue, { type: 'program_proposal' }),
    post(approvals, { application_ids: ['00000000-0000-4000-8000-000000000001'] }),
  ]) {
    expect(await isRosterMockRequest(request, origin), request.url).toBe(false);
  }
});

it('uses the counted roster handlers and shares state for Student detail and deletion', async () => {
  server.resetHandlers(...rosterMockHandlers(origin));
  const roster = origin + '/rest/v1/rpc/search_students?limit=1';
  const detail = origin + '/rest/v1/rpc/get_student_by_id?p_student_id=' + studentId;
  const headers = { Prefer: 'count=exact' };

  const students = await fetch(roster, { headers });
  const faculty = await fetch(origin + '/rest/v1/faculty_profiles?limit=1', { headers });
  expect(students.headers.get('Content-Range')).toBe('0-0/2');
  expect(await students.json()).toMatchObject([{ program_name: 'Bachelor of Science in Computer Science' }]);
  expect(faculty.headers.get('Content-Range')).toBe('0-0/3');
  expect(await (await fetch(detail)).json()).toMatchObject({ id: studentId });

  const removed = await fetch(origin + '/rest/v1/student_profiles?id=eq.' + studentId, { method: 'DELETE' });
  expect(removed.status).toBe(204);
  expect(await (await fetch(detail)).json()).toBeNull();
  expect((await fetch(roster, { headers })).headers.get('Content-Range')).toBe('0-0/1');
});

it('serves pending student registrations and decisions from the same fixture state', async () => {
  server.resetHandlers(...rosterMockHandlers(origin));
  const pending = origin + studentQueue + '?type=eq.student_registration&status=eq.pending';
  const items = await (await fetch(pending)).json();
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ type: 'student_registration', status: 'pending' });

  const decisions = post(approvals, { application_ids: [items[0].id], decision: 'approve' });
  expect(await isRosterMockRequest(decisions, origin)).toBe(true);
  const result = await fetch(decisions);
  expect(await result.json()).toMatchObject([{ id: items[0].id, status: 'approved' }]);
  expect(await (await fetch(pending)).json()).toEqual([]);
});
