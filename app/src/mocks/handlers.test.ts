import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './server';

const BASE = 'http://localhost';
const studentId = '45b54332-e470-4c21-a839-7428c4f6bf42';

describe('contract MSW handlers', () => {
  it('searches students through the RPC route and returns contract records', async () => {
    const response = await fetch(`${BASE}/rest/v1/rpc/search_students?query=Maria`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ id: studentId, first_name: 'Maria', program_name: expect.any(String) });
  });

  it('lists a student’s attributed reviews as an array', async () => {
    const response = await fetch(`${BASE}/rest/v1/review_details?student_id=eq.${studentId}`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ student_id: studentId, body_document: expect.any(Object), status: 'active' });
  });

  it('returns REVIEW_BODY_REQUIRED for an empty extracted review', async () => {
    const response = await fetch(`${BASE}/functions/v1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, body_document: { blocks: [] } }),
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: 'REVIEW_BODY_REQUIRED', details: expect.any(String), hint: expect.any(String) });
  });

  it('allows 500 words and returns REVIEW_WORD_LIMIT above the contract limit', async () => {
    const makeBody = (words: number) => JSON.stringify({
      student_id: studentId,
      body_document: { blocks: [{ type: 'paragraph', content: [{ text: Array(words).fill('word').join(' ') }] }] },
    });
    const allowed = await fetch(`${BASE}/functions/v1/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: makeBody(500),
    });
    expect(allowed.status).toBe(201);
    expect(await allowed.json()).toMatchObject({ student_id: studentId, status: 'active', body_text: expect.any(String) });

    const rejected = await fetch(`${BASE}/functions/v1/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: makeBody(501),
    });
    expect(rejected.status).toBe(422);
    expect(await rejected.json()).toMatchObject({ code: 'REVIEW_WORD_LIMIT' });
  });

  it('returns a ChatResponse and then the contract RATE_LIMITED error', async () => {
    for (let index = 0; index < 3; index += 1) {
      const response = await fetch(`${BASE}/functions/v1/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'hello' }),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ message: expect.any(String) });
    }
    const throttled = await fetch(`${BASE}/functions/v1/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'hello again' }),
    });
    expect(throttled.status).toBe(429);
    expect(await throttled.json()).toMatchObject({ code: 'RATE_LIMITED', details: null, hint: expect.any(String) });
  });

  it('lists and decides approval queue items using the bulk contract shape', async () => {
    const queue = await fetch(`${BASE}/rest/v1/approval_queue_items?status=eq.pending`);
    const items = await queue.json();
    expect(queue.status).toBe(200);
    expect(items).toHaveLength(1);

    const response = await fetch(`${BASE}/functions/v1/approvals`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_ids: [items[0].id], decision: 'approve' }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject([{ id: items[0].id, status: 'approved', decided_by: expect.any(String) }]);
  });

  it('lists departments, programs, and audit entries as contract arrays', async () => {
    const [departmentResponse, programResponse, auditResponse] = await Promise.all([
      fetch(`${BASE}/rest/v1/departments`),
      fetch(`${BASE}/rest/v1/programs`),
      fetch(`${BASE}/rest/v1/audit_log_entries`),
    ]);
    const [departmentData, programData, auditData] = await Promise.all([
      departmentResponse.json(), programResponse.json(), auditResponse.json(),
    ]);
    expect(departmentData[0]).toMatchObject({ id: expect.any(String), status: 'approved' });
    expect(programData[0]).toMatchObject({ id: expect.any(String), status: 'approved' });
    expect(auditData[0]).toMatchObject({ action: 'review.created', actor_role: 'faculty', entity_type: 'review' });
  });

  it('supports per-test overrides on a contract route', async () => {
    server.use(http.get(`${BASE}/rest/v1/departments`, () => HttpResponse.json([])));
    const response = await fetch(`${BASE}/rest/v1/departments`);
    expect(await response.json()).toEqual([]);
  });

  it('retrieves a student by ID via get_student_by_id RPC', async () => {
    const response = await fetch(`${BASE}/rest/v1/rpc/get_student_by_id?p_student_id=${studentId}`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      id: studentId,
      first_name: 'Maria',
      last_name: 'Santos',
      student_id_number: '27-1-12345',
    });
  });

  it('updates a review via PATCH /functions/v1/reviews/:id and records a revision snapshot', async () => {
    const listResp = await fetch(`${BASE}/rest/v1/review_details?student_id=eq.${studentId}`);
    const [existing] = await listResp.json();

    const patchResp = await fetch(`${BASE}/functions/v1/reviews/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body_document: {
          blocks: [{ type: 'paragraph', content: [{ text: 'Updated review with robotics and teamwork.' }] }],
        },
        tags: ['robotics', 'teamwork'],
      }),
    });
    expect(patchResp.status).toBe(200);
    const updated = await patchResp.json();
    expect(updated).toMatchObject({
      id: existing.id,
      body_text: 'Updated review with robotics and teamwork.',
      tags: ['robotics', 'teamwork'],
    });

    const revisionsResp = await fetch(`${BASE}/rest/v1/review_revisions?review_id=eq.${existing.id}`);
    expect(revisionsResp.status).toBe(200);
    const revisions = await revisionsResp.json();
    expect(revisions.length).toBeGreaterThanOrEqual(2);
    expect(revisions[0]).toMatchObject({
      review_id: existing.id,
      body_text_snapshot: 'Demonstrated strong leadership and research skills.',
    });
  });

  it('hides, unhides, and deletes a review via POST /functions/v1/reviews/:id/status', async () => {
    const listResp = await fetch(`${BASE}/rest/v1/review_details?student_id=eq.${studentId}`);
    const [existing] = await listResp.json();

    const hideResp = await fetch(`${BASE}/functions/v1/reviews/${existing.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'hide' }),
    });
    expect(hideResp.status).toBe(200);
    expect(await hideResp.json()).toEqual({ id: existing.id, status: 'hidden' });

    const unhideResp = await fetch(`${BASE}/functions/v1/reviews/${existing.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unhide' }),
    });
    expect(unhideResp.status).toBe(200);
    expect(await unhideResp.json()).toEqual({ id: existing.id, status: 'active' });

    const deleteResp = await fetch(`${BASE}/functions/v1/reviews/${existing.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete' }),
    });
    expect(deleteResp.status).toBe(200);
    expect(await deleteResp.json()).toEqual({ id: existing.id, status: 'deleted' });
  });

  it('returns tag suggestions via GET /rest/v1/rpc/suggest_review_tags', async () => {
    const response = await fetch(`${BASE}/rest/v1/rpc/suggest_review_tags?prefix=res`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(expect.arrayContaining([{ tag: 'research' }]));
  });

  it('gets and updates the authenticated faculty profile', async () => {
    const profileResponse = await fetch(`${BASE}/rest/v1/rpc/get_own_profile`);
    expect(profileResponse.status).toBe(200);
    expect(await profileResponse.json()).toMatchObject({
      id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
      full_name: 'Alex Reyes',
      role: 'faculty',
      status: 'active',
    });

    const updateResponse = await fetch(`${BASE}/rest/v1/rpc/update_own_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Alex Updated' }),
    });

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toMatchObject([
      { full_name: 'Alex Updated' },
    ]);
  });

  it('performs department and program CRUD operations', async () => {
    const departmentCreate = await fetch(`${BASE}/rest/v1/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Physics' }),
    });
    expect(departmentCreate.status).toBe(201);
    const [department] = await departmentCreate.json();

    const departmentUpdate = await fetch(
      `${BASE}/rest/v1/departments?id=eq.${department.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Applied Physics' }),
      },
    );
    expect(departmentUpdate.status).toBe(200);
    expect(await departmentUpdate.json()).toMatchObject([
      { id: department.id, name: 'Applied Physics' },
    ]);

    const departmentDelete = await fetch(
      `${BASE}/rest/v1/departments?id=eq.${department.id}`,
      { method: 'DELETE' },
    );
    expect(departmentDelete.status).toBe(204);

    const programCreate = await fetch(`${BASE}/rest/v1/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bachelor of Physics' }),
    });
    expect(programCreate.status).toBe(201);
  });

  it('creates and updates student profiles', async () => {
    const createResponse = await fetch(`${BASE}/rest/v1/student_profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id_number: '27-1-12348',
        first_name: 'Ana',
        last_name: 'Garcia',
        middle_name: null,
        program_id: '8ef76d5f-e6b2-49aa-a627-171dee1b8b65',
      }),
    });

    expect(createResponse.status).toBe(201);
    const [student] = await createResponse.json();

    const updateResponse = await fetch(
      `${BASE}/rest/v1/student_profiles?id=eq.${student.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: 'Anna' }),
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toMatchObject([
      { id: student.id, first_name: 'Anna' },
    ]);

    const deleteConflict = await fetch(
      `${BASE}/rest/v1/student_profiles?id=eq.${studentId}`,
      { method: 'DELETE' },
    );
    expect(deleteConflict.status).toBe(409);

    const deleteResponse = await fetch(
      `${BASE}/rest/v1/student_profiles?id=eq.${student.id}`,
      { method: 'DELETE' },
    );
    expect(deleteResponse.status).toBe(204);
  });

  it('lists, creates, updates, and deletes faculty profiles', async () => {
    const listResponse = await fetch(`${BASE}/rest/v1/faculty_profiles`);
    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'faculty' }),
      ]),
    );

    const createResponse = await fetch(`${BASE}/rest/v1/faculty_profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Jane.Doe@Example.Edu',
        full_name: 'Dr. Jane Doe',
        department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
        role: 'faculty',
        status: 'active',
      }),
    });
    expect(createResponse.status).toBe(201);
    const [created] = await createResponse.json();
    expect(created).toMatchObject({
      email: 'jane.doe@example.edu',
      full_name: 'Dr. Jane Doe',
      role: 'faculty',
      status: 'active',
    });

    const duplicateResponse = await fetch(`${BASE}/rest/v1/faculty_profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane.doe@example.edu',
        full_name: 'Duplicate Faculty',
        department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
        role: 'faculty',
      }),
    });
    expect(duplicateResponse.status).toBe(409);

    const updateResponse = await fetch(
      `${BASE}/rest/v1/faculty_profiles?id=eq.e48adc9e-1b79-4b92-9848-aa12b25d63d7`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: 'Alex Faculty' }),
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toMatchObject([
      { full_name: 'Alex Faculty' },
    ]);

    const deleteConflict = await fetch(
      `${BASE}/rest/v1/faculty_profiles?id=eq.e48adc9e-1b79-4b92-9848-aa12b25d63d7`,
      { method: 'DELETE' },
    );
    expect(deleteConflict.status).toBe(409);

    const deleteResponse = await fetch(
      `${BASE}/rest/v1/faculty_profiles?id=eq.${created.id}`,
      { method: 'DELETE' },
    );
    expect(deleteResponse.status).toBe(204);
  });

  it('rejects missing or malformed id filters on student and faculty DELETE without mutating rosters', async () => {
    const initialStudents = await (await fetch(`${BASE}/rest/v1/rpc/search_students`)).json();
    const initialFaculty = await (await fetch(`${BASE}/rest/v1/faculty_profiles`)).json();

    for (const url of [
      `${BASE}/rest/v1/student_profiles`,
      `${BASE}/rest/v1/student_profiles?id=${studentId}`,
      `${BASE}/rest/v1/student_profiles?id=eq.not-a-uuid`,
    ]) {
      const response = await fetch(url, { method: 'DELETE' });
      expect(response.status).toBe(400);
    }

    for (const url of [
      `${BASE}/rest/v1/faculty_profiles`,
      `${BASE}/rest/v1/faculty_profiles?id=98b5fca9-0d8c-4c0a-a10a-7aa10b9bb3a1`,
      `${BASE}/rest/v1/faculty_profiles?id=eq.not-a-uuid`,
    ]) {
      const response = await fetch(url, { method: 'DELETE' });
      expect(response.status).toBe(400);
    }

    const remainingStudents = await (await fetch(`${BASE}/rest/v1/rpc/search_students`)).json();
    const remainingFaculty = await (await fetch(`${BASE}/rest/v1/faculty_profiles`)).json();
    expect(remainingStudents).toHaveLength(initialStudents.length);
    expect(remainingFaculty).toHaveLength(initialFaculty.length);
  });

  it('creates an approval queue item', async () => {
    const response = await fetch(`${BASE}/rest/v1/approval_queue_items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'student_registration',
        payload: {
          student_id_number: '27-1-12349',
          first_name: 'Luis',
          last_name: 'Reyes',
          middle_name: null,
          program_id: '8ef76d5f-e6b2-49aa-a627-171dee1b8b65',
        },
      }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject([
      {
        type: 'student_registration',
        status: 'pending',
        submitted_by: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
      },
    ]);
  });
});
