import { delay, http, HttpResponse } from 'msw';

const now = '2026-10-26T00:00:00.000Z';
const studentId = '45b54332-e470-4c21-a839-7428c4f6bf42';
const programId = '8ef76d5f-e6b2-49aa-a627-171dee1b8b65';
const departmentId = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';
const ownerId = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
const reviewWordLimit = 500;
const chatbotRateLimit = 3;

type RichTextRun = { text?: string; bold?: boolean; italic?: boolean };

type ReviewDocumentBlock = {
  type?: string;
  content?: Array<RichTextRun>;
  items?: Array<Array<RichTextRun>>;
};

type ReviewDocument = {
  blocks?: Array<ReviewDocumentBlock>;
};

type ReviewInput = {
  student_id?: string;
  body_document?: ReviewDocument;
  tags?: string[];
};

type MockAttachment = {
  id: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

type MockReview = {
  id: string;
  student_id: string;
  owner_id: string;
  author_name: string;
  author_department_name: string;
  body_text: string;
  body_document: ReviewDocument;
  status: 'active' | 'hidden';
  tags: string[];
  attachments: MockAttachment[];
  created_at: string;
  updated_at: string;
};

type MockReviewRevision = {
  id: string;
  review_id: string;
  body_text_snapshot: string;
  edited_by: string;
  edited_at: string;
  body_document_snapshot?: ReviewDocument;
  tags_snapshot?: string[];
};

type ApprovalItemType =
  | 'student_registration'
  | 'program_proposal'
  | 'department_proposal';

type ApprovalPayload = {
  student_id_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  program_id?: string;
  name?: string;
  department_id?: string;
};

type ApprovalItem = {
  id: string;
  type: ApprovalItemType;
  payload: ApprovalPayload;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  decided_by: string | null;
  decision_reason: string | null;
  created_at: string;
  decided_at: string | null;
};

type MockStudentProfile = {
  id: string;
  student_id_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  program_id: string;
  program_name: string;
  registration_source: string;
  visible_review_tags: string[];
  created_at: string;
  updated_at: string;
};

const students: MockStudentProfile[] = [
  {
    id: studentId,
    student_id_number: '27-1-12345',
    first_name: 'Maria',
    middle_name: null,
    last_name: 'Santos',
    program_id: programId,
    program_name: 'Bachelor of Science in Computer Science',
    registration_source: 'admin_direct',
    visible_review_tags: ['leadership', 'research'],
    created_at: now,
    updated_at: now,
  },
  {
    id: '27b5cc8d-1679-4e44-9e42-7b4cac5ae119',
    student_id_number: '27-1-12346',
    first_name: 'Juan',
    middle_name: null,
    last_name: 'Dela Cruz',
    program_id: programId,
    program_name: 'Bachelor of Science in Computer Science',
    registration_source: 'faculty_applied',
    visible_review_tags: [],
    created_at: now,
    updated_at: now,
  },
];

const initialReview: MockReview = {
  id: '67015de8-1ce8-4ac4-8634-384bf5fb3821',
  student_id: studentId,
  owner_id: ownerId,
  author_name: 'Alex Reyes',
  author_department_name: 'Computer Science',
  body_text: 'Demonstrated strong leadership and research skills.',
  body_document: {
    blocks: [{ type: 'paragraph', content: [{ text: 'Demonstrated strong leadership and research skills.' }] }],
  },
  status: 'active' as const,
  tags: ['leadership', 'research'],
  attachments: [
    {
      id: 'c32b11a0-51df-4e3f-8c04-75a10885a201',
      mime_type: 'application/pdf',
      size_bytes: 184320,
      created_at: now,
    },
  ],
  created_at: now,
  updated_at: now,
};

const reviews: MockReview[] = [structuredClone(initialReview)];

const initialRevision: MockReviewRevision = {
  id: '5180c0d4-9423-4ef8-b7d8-9418193d02f9',
  review_id: initialReview.id,
  body_text_snapshot: 'Demonstrated strong leadership skills.',
  edited_by: ownerId,
  edited_at: '2026-10-25T12:00:00.000Z',
  body_document_snapshot: {
    blocks: [{ type: 'paragraph', content: [{ text: 'Demonstrated strong leadership skills.' }] }],
  },
  tags_snapshot: ['leadership'],
};

const reviewRevisions: MockReviewRevision[] = [structuredClone(initialRevision)];

const approvalQueue: ApprovalItem[] = [
  {
    id: '07e42297-6b44-4b35-ab2f-d216d547bdc7',
    type: 'student_registration',
    payload: {
      student_id_number: '27-1-12347',
      first_name: 'Sam',
      last_name: 'Reyes',
      middle_name: null,
      program_id: programId,
    },
    status: 'pending',
    submitted_by: ownerId,
    decided_by: null,
    decision_reason: null,
    created_at: now,
    decided_at: null,
  },
];

const departments = [
  { id: departmentId, name: 'Computer Science', status: 'approved', proposed_by: null, created_at: now, updated_at: now },
  { id: '98a12d0b-73c2-4e02-b7c9-aebc20e823de', name: 'Mathematics', status: 'approved', proposed_by: null, created_at: now, updated_at: now },
];

const programs = [
  { id: programId, name: 'Bachelor of Science in Computer Science', status: 'approved', proposed_by: null, created_at: now, updated_at: now },
  { id: '9625620d-2d60-4bb2-ad06-d041e6023158', name: 'Bachelor of Science in Mathematics', status: 'approved', proposed_by: null, created_at: now, updated_at: now },
];

type MockFacultyProfile = {
  id: string;
  email: string;
  full_name: string;
  department_id: string;
  role: 'faculty' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
};

const facultyProfiles: MockFacultyProfile[] = [
  {
    id: ownerId,
    email: 'alex.reyes@example.edu',
    full_name: 'Alex Reyes',
    department_id: departmentId,
    role: 'faculty',
    status: 'active',
    created_at: now,
    updated_at: now,
  },
  {
    id: '98b5fca9-0d8c-4c0a-a10a-7aa10b9bb3a1',
    email: 'pending.faculty@example.edu',
    full_name: 'Pending Faculty',
    department_id: departmentId,
    role: 'faculty',
    status: 'pending',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'b6f6d2fb-1536-4d80-8599-337eaa8ec3ab',
    email: 'admin@example.edu',
    full_name: 'SPMIS Administrator',
    department_id: departmentId,
    role: 'admin',
    status: 'active',
    created_at: now,
    updated_at: now,
  },
];

const initialStudents = structuredClone(students);
const initialApprovalQueue = structuredClone(approvalQueue);
const initialDepartments = structuredClone(departments);
const initialPrograms = structuredClone(programs);
const initialFacultyProfiles = structuredClone(facultyProfiles);

const restore = <T>(target: T[], initial: T[]) => {
  target.splice(0, target.length, ...structuredClone(initial));
};

const auditLogs = [
  {
    id: '9e259155-705c-46fb-9530-c0f100cfca0f',
    actor_id: ownerId,
    actor_role: 'faculty',
    action: 'review.created',
    entity_type: 'review',
    entity_id: reviews[0].id,
    metadata: { status: 'active' },
    created_at: now,
  },
];

let chatbotCallCount = 0;
let nextReviewId = 1;
let nextRevisionId = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractReviewText = (document: ReviewDocument | undefined): string =>
  (document?.blocks ?? [])
    .map((block) =>
      block.type === 'paragraph'
        ? (block.content ?? []).map((item) => item.text ?? '').join('')
        : (block.items ?? [])
            .map((item) => item.map((run) => run.text ?? '').join(''))
            .join(' ')
    )
    .join(' ')
    .trim();

const countWords = (text: string): number => text.match(/\S+/g)?.length ?? 0;

const matches = (value: string, filter: string | null): boolean => {
  if (!filter) return true;
  if (filter.startsWith('eq.')) return value === filter.slice(3);
  if (filter.startsWith('ilike.')) {
    return value.toLowerCase().includes(filter.slice(6).replace(/^\*|\*$/g, '').toLowerCase());
  }
  return value.toLowerCase().includes(filter.toLowerCase());
};

const uuidFilterPattern = /^eq\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parseEqUuidFilter = (filter: string | null): string | null =>
  filter && uuidFilterPattern.test(filter) ? filter.slice(3) : null;

const reviewValidationError = (code: 'REVIEW_BODY_REQUIRED' | 'REVIEW_WORD_LIMIT', details: string) =>
  HttpResponse.json(
    {
      code,
      message: code === 'REVIEW_BODY_REQUIRED'
        ? 'Enter a review before saving.'
        : `Reviews must contain no more than ${reviewWordLimit} words.`,
      details,
      hint: code === 'REVIEW_BODY_REQUIRED'
        ? 'Add review text and submit it again.'
        : 'Shorten the review and submit it again.',
    },
    { status: 422 },
  );

export function auditLogHandler(origin = '*') {
  return http.get(`${origin}/rest/v1/audit_log_entries`, async ({ request }) => {
    await delay(10);
    const { searchParams } = new URL(request.url);
    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 20);
    const ascending = searchParams.get('order') === 'created_at.asc,id.asc';
    const exactCount = request.headers.get('Prefer')?.split(',').some(value => value.trim() === 'count=exact');
    const records = auditLogs.filter(entry =>
      matches(entry.action, searchParams.get('action')) && matches(entry.actor_role, searchParams.get('actor_role')),
    ).sort((a, b) => {
      const dateOrder = Date.parse(a.created_at) - Date.parse(b.created_at);
      return (ascending ? dateOrder : -dateOrder) || a.id.localeCompare(b.id);
    });
    const total = exactCount ? records.length : '*';

    if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      return HttpResponse.json({
        code: 'BAD_REQUEST', message: 'Invalid audit log pagination.', details: null, hint: null,
      }, { status: 400 });
    }
    if (offset > 0 && offset >= records.length) {
      return HttpResponse.json({
        code: 'PGRST103', message: 'Requested range not satisfiable',
        details: `An offset of ${offset} was requested, but there are only ${records.length} rows.`, hint: null,
      }, { status: 416, headers: { 'Content-Range': `*/${total}` } });
    }

    const page = records.slice(offset, offset + limit);
    const range = page.length ? `${offset}-${offset + page.length - 1}` : '*';
    return HttpResponse.json(page, {
      status: exactCount && page.length < records.length ? 206 : 200,
      headers: { 'Content-Range': `${range}/${total}` },
    });
  });
}

export const handlers = [
  http.get('*/rest/v1/rpc/search_students', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') ?? '').toLowerCase();
    const programFilter = url.searchParams.get('program_id');
    const ownerFilter = url.searchParams.get('owner_id');
    const ownerDepartmentFilter = url.searchParams.get('owner_department_id');
    const tagFilter = url.searchParams.get('tag');
    const result = students.filter((student) => {
      const text = `${student.first_name} ${student.middle_name ?? ''} ${student.last_name} ${student.student_id_number}`.toLowerCase();
      const matchingReviews = reviews.filter((review) => review.student_id === student.id && review.status === 'active');
      const matchingFilteredReviews = matchingReviews.filter((review) =>
        matches(review.owner_id, ownerFilter)
        && (!ownerDepartmentFilter || matches(departmentId, ownerDepartmentFilter))
        && (!tagFilter || review.tags.includes(tagFilter.toLowerCase())),
      );
      const hasReviewFilter = Boolean(ownerFilter || ownerDepartmentFilter || tagFilter);
      return matches(student.program_id, programFilter)
        && (!query || text.includes(query) || matchingFilteredReviews.some((review) => review.body_text.toLowerCase().includes(query)))
        && (!hasReviewFilter || matchingFilteredReviews.length > 0);
    });
    return HttpResponse.json(result);
  }),

  http.get('*/rest/v1/rpc/get_own_profile', async () => {
    await delay(10);

    return HttpResponse.json(
      facultyProfiles.find((profile) => profile.id === ownerId) ?? null,
    );
  }),

  http.post('*/rest/v1/rpc/update_own_profile', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);
    const profile = facultyProfiles.find((item) => item.id === ownerId);

    if (!profile) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'Your profile was not found.',
          details: null,
          hint: 'Refresh the page and try again.',
        },
        { status: 404 },
      );
    }

    if (!isRecord(input) || typeof input.full_name !== 'string' || !input.full_name.trim()) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The profile update is invalid.',
          details: 'A nonblank full_name is required.',
          hint: 'Enter your full name and try again.',
        },
        { status: 422 },
      );
    }

    profile.full_name = input.full_name.trim();
    profile.updated_at = new Date().toISOString();

    return HttpResponse.json([profile]);
  }),

  http.get('*/rest/v1/rpc/get_student_by_id', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const targetId = url.searchParams.get('p_student_id');
    const found = students.find((student) => student.id === targetId);
    if (!found) {
      return HttpResponse.json(null);
    }
    return HttpResponse.json({
      id: found.id,
      student_id_number: found.student_id_number,
      first_name: found.first_name,
      middle_name: found.middle_name,
      last_name: found.last_name,
      program_id: found.program_id,
      registration_source: found.registration_source,
      created_at: found.created_at,
      updated_at: found.updated_at,
    });
  }),

  http.post('*/rest/v1/student_profiles', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);

    if (!isRecord(input)) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The student profile is invalid.',
          details: 'Expected a JSON object.',
          hint: 'Correct the student details and try again.',
        },
        { status: 422 },
      );
    }

    const timestamp = new Date().toISOString();
    const program = programs.find((item) => item.id === input.program_id);

    const student = {
      id: crypto.randomUUID(),
      student_id_number: String(input.student_id_number ?? ''),
      first_name: String(input.first_name ?? ''),
      middle_name: typeof input.middle_name === 'string' ? input.middle_name : null,
      last_name: String(input.last_name ?? ''),
      program_id: String(input.program_id ?? ''),
      program_name: program?.name ?? '',
      registration_source: 'admin_direct',
      visible_review_tags: [],
      created_at: timestamp,
      updated_at: timestamp,
    };

    students.push(student);
    return HttpResponse.json([student], { status: 201 });
  }),

  http.patch('*/rest/v1/student_profiles', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const input: unknown = await request.json().catch(() => null);
    const student = students.find((item) => matches(item.id, idFilter));

    if (!student) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The student profile was not found.',
          details: null,
          hint: 'Check the student identifier.',
        },
        { status: 404 },
      );
    }

    if (isRecord(input)) {
      if (typeof input.student_id_number === 'string') {
        student.student_id_number = input.student_id_number;
      }
      if (typeof input.first_name === 'string') student.first_name = input.first_name;
      if (typeof input.last_name === 'string') student.last_name = input.last_name;
      if (typeof input.middle_name === 'string' || input.middle_name === null) {
        student.middle_name = input.middle_name;
      }
      if (typeof input.program_id === 'string') {
        student.program_id = input.program_id;
        student.program_name = programs.find((program) => program.id === input.program_id)?.name ?? '';
      }
    }

    student.updated_at = new Date().toISOString();
    return HttpResponse.json([student]);
  }),

  http.delete('*/rest/v1/student_profiles', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const targetId = parseEqUuidFilter(url.searchParams.get('id'));
    if (!targetId) {
      return HttpResponse.json(
        {
          code: 'PGRST100',
          message: 'A valid id=eq.<uuid> filter is required.',
          details: 'Provide an equality filter matching a valid UUID.',
          hint: 'Pass ?id=eq.<uuid> in the request query string.',
        },
        { status: 400 },
      );
    }

    const index = students.findIndex((item) => item.id === targetId);

    if (index === -1) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The student profile was not found.',
          details: null,
          hint: 'Check the student identifier.',
        },
        { status: 404 },
      );
    }

    const target = students[index];
    if (reviews.some((review) => review.student_id === target.id)) {
      return HttpResponse.json(
        {
          code: '23503',
          message: 'Cannot delete a student profile that still has reviews.',
          details: 'Key is still referenced from table "reviews".',
          hint: 'Delete or reassign dependent reviews before removing this student.',
        },
        { status: 409 },
      );
    }

    students.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/rest/v1/review_details', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const studentFilter = url.searchParams.get('student_id');
    const statusFilter = url.searchParams.get('status');
    const result = reviews.filter((review) =>
      matches(review.student_id, studentFilter)
      && (!statusFilter || statusFilter === `eq.${review.status}`)
      && (review.status === 'active' || review.owner_id === ownerId),
    );
    return HttpResponse.json(result);
  }),

  http.post('*/functions/v1/reviews', async ({ request }) => {
    await delay(10);
    const input: unknown = await request.json().catch(() => null);
    if (!isRecord(input)) {
      return HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'The request contains invalid data.', details: 'Expected a JSON object.', hint: 'Correct the request and retry.' }, { status: 422 });
    }
    const body = input as ReviewInput;
    const text = extractReviewText(body.body_document);
    if (!text) return reviewValidationError('REVIEW_BODY_REQUIRED', 'The extracted review contains no non-whitespace text.');
    const wordCount = countWords(text);
    if (wordCount > reviewWordLimit) return reviewValidationError('REVIEW_WORD_LIMIT', `The extracted review contains ${wordCount} words; the limit is ${reviewWordLimit}.`);

    const timestamp = new Date().toISOString();
    const review = {
      id: `mock-review-${nextReviewId++}`,
      student_id: body.student_id ?? studentId,
      owner_id: ownerId,
      author_name: 'Alex Reyes',
      author_department_name: 'Computer Science',
      body_text: text,
      body_document: body.body_document ?? { blocks: [] },
      status: 'active' as const,
      tags: [...new Set((body.tags ?? []).flatMap((tag) => tag.toLowerCase().trim().split(/\s+/).filter(Boolean)))],
      attachments: [],
      created_at: timestamp,
      updated_at: timestamp,
    };
    reviews.push(review);
    return HttpResponse.json(review, { status: 201 });
  }),

  http.patch('*/functions/v1/reviews/:id', async ({ params, request }) => {
    await delay(10);
    const id = String(params.id ?? '');
    const review = reviews.find((item) => item.id === id);
    if (!review) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'The requested review was not found.', details: null, hint: 'Check the review identifier.' },
        { status: 404 },
      );
    }
    if (review.owner_id !== ownerId) {
      return HttpResponse.json(
        { code: 'FORBIDDEN', message: 'Only the review owner can update this review.', details: null, hint: 'Sign in as the owning faculty member.' },
        { status: 403 },
      );
    }
    const input: unknown = await request.json().catch(() => null);
    if (!isRecord(input)) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'The request contains invalid data.', details: 'Expected a JSON object.', hint: 'Correct the request and retry.' },
        { status: 422 },
      );
    }
    const body = input as ReviewInput;
    const text = extractReviewText(body.body_document);
    if (!text) return reviewValidationError('REVIEW_BODY_REQUIRED', 'The extracted review contains no non-whitespace text.');
    const wordCount = countWords(text);
    if (wordCount > reviewWordLimit) return reviewValidationError('REVIEW_WORD_LIMIT', `The extracted review contains ${wordCount} words; the limit is ${reviewWordLimit}.`);

    const timestamp = new Date().toISOString();
    reviewRevisions.unshift({
      id: `mock-revision-${nextRevisionId++}`,
      review_id: review.id,
      body_text_snapshot: review.body_text,
      edited_by: ownerId,
      edited_at: timestamp,
      body_document_snapshot: structuredClone(review.body_document),
      tags_snapshot: [...review.tags],
    });

    review.body_text = text;
    review.body_document = body.body_document ?? { blocks: [] };
    if (body.tags !== undefined) {
      review.tags = [...new Set(body.tags.flatMap((tag) => tag.toLowerCase().trim().split(/\s+/).filter(Boolean)))];
    }
    review.updated_at = timestamp;
    return HttpResponse.json(review);
  }),

  http.post('*/functions/v1/reviews/:id/status', async ({ params, request }) => {
    await delay(10);
    const id = String(params.id ?? '');
    const reviewIndex = reviews.findIndex((item) => item.id === id);
    if (reviewIndex === -1) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'The requested review was not found.', details: null, hint: 'Check the review identifier.' },
        { status: 404 },
      );
    }
    const review = reviews[reviewIndex];
    if (review.owner_id !== ownerId) {
      return HttpResponse.json(
        { code: 'FORBIDDEN', message: 'Only the review owner can change this review status.', details: null, hint: 'Sign in as the owning faculty member.' },
        { status: 403 },
      );
    }
    const input: unknown = await request.json().catch(() => null);
    const action = isRecord(input) ? String(input.action ?? '') : '';
    if (!['hide', 'unhide', 'delete'].includes(action)) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid status action.', details: 'Expected hide, unhide, or delete.', hint: 'Choose a valid review status action.' },
        { status: 422 },
      );
    }
    if (action === 'hide' && review.status !== 'active') {
      return HttpResponse.json(
        { code: 'INVALID_STATE', message: 'Only active reviews can be hidden.', details: null, hint: 'Refresh the page and try again.' },
        { status: 409 },
      );
    }
    if (action === 'unhide' && review.status !== 'hidden') {
      return HttpResponse.json(
        { code: 'INVALID_STATE', message: 'Only hidden reviews can be restored.', details: null, hint: 'Refresh the page and try again.' },
        { status: 409 },
      );
    }
    if (action === 'delete') {
      reviews.splice(reviewIndex, 1);
      return HttpResponse.json({ id, status: 'deleted' as const });
    }
    review.status = action === 'hide' ? 'hidden' : 'active';
    review.updated_at = new Date().toISOString();
    return HttpResponse.json({ id: review.id, status: review.status });
  }),

  http.get('*/rest/v1/review_revisions', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const reviewIdFilter = url.searchParams.get('review_id');
    const result = reviewRevisions.filter((revision) => matches(revision.review_id, reviewIdFilter));
    return HttpResponse.json(result);
  }),

  http.get('*/rest/v1/rpc/suggest_review_tags', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const prefix = (url.searchParams.get('prefix') ?? '').trim().toLowerCase();
    const defaultSuggestions = [
      'algorithms',
      'communication',
      'leadership',
      'mentorship',
      'research',
      'robotics',
      'teamwork',
    ];
    const activeTags = reviews
      .filter((review) => review.status === 'active')
      .flatMap((review) => review.tags);
    const distinct = [...new Set([...defaultSuggestions, ...activeTags])].sort((a, b) => a.localeCompare(b));
    const filtered = prefix ? distinct.filter((tag) => tag.startsWith(prefix) || tag.includes(prefix)) : distinct;
    return HttpResponse.json(filtered.map((tag) => ({ tag })));
  }),

  http.post('*/functions/v1/chat', async ({ request }) => {
    await delay(10);
    chatbotCallCount += 1;
    if (chatbotCallCount > chatbotRateLimit) {
      return HttpResponse.json({ code: 'RATE_LIMITED', message: 'The AI Chat Assistant is temporarily unavailable.', details: null, hint: 'Try again later.' }, { status: 429 });
    }
    const body: unknown = await request.json().catch(() => null);
    const message = isRecord(body) && typeof body.message === 'string' ? body.message : '';
    return HttpResponse.json({ message: `Mock answer to: ${message}` });
  }),

  http.get('*/rest/v1/faculty_profiles', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const departmentFilter = url.searchParams.get('department_id');
    const roleFilter = url.searchParams.get('role');
    const statusFilter = url.searchParams.get('status');

    return HttpResponse.json(
      facultyProfiles.filter((profile) =>
        matches(profile.id, idFilter)
        && matches(profile.department_id, departmentFilter)
        && matches(profile.role, roleFilter)
        && matches(profile.status, statusFilter),
      ),
    );
  }),

  http.post('*/rest/v1/faculty_profiles', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);
    if (
      !isRecord(input)
      || typeof input.email !== 'string'
      || !input.email.trim()
      || typeof input.full_name !== 'string'
      || !input.full_name.trim()
      || typeof input.department_id !== 'string'
      || !input.department_id.trim()
      || (input.role !== 'faculty' && input.role !== 'admin')
      || (input.status !== undefined && input.status !== 'pending' && input.status !== 'active' && input.status !== 'suspended')
    ) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The faculty profile is invalid.',
          details: 'Expected email, full_name, department_id, and role (faculty or admin).',
          hint: 'Correct the faculty details and try again.',
        },
        { status: 422 },
      );
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    if (facultyProfiles.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return HttpResponse.json(
        {
          code: '23505',
          message: 'A faculty profile with that email address already exists.',
          details: `Key (email)=(${normalizedEmail}) already exists.`,
          hint: 'Use a different email address.',
        },
        { status: 409 },
      );
    }

    const timestamp = new Date().toISOString();
    const profile: MockFacultyProfile = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      full_name: input.full_name.trim(),
      department_id: input.department_id,
      role: input.role,
      status: input.status ?? 'active',
      created_at: timestamp,
      updated_at: timestamp,
    };

    facultyProfiles.push(profile);
    return HttpResponse.json([profile], { status: 201 });
  }),

  http.patch('*/rest/v1/faculty_profiles', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const input: unknown = await request.json().catch(() => null);
    const profile = facultyProfiles.find((item) => matches(item.id, idFilter));

    if (!profile) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The faculty profile was not found.',
          details: null,
          hint: 'Check the faculty identifier.',
        },
        { status: 404 },
      );
    }

    if (!isRecord(input)) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The request contains invalid data.',
          details: 'Expected a JSON object.',
          hint: 'Correct the request and retry.',
        },
        { status: 422 },
      );
    }

    if (typeof input.email === 'string') profile.email = input.email.trim();
    if (typeof input.full_name === 'string') profile.full_name = input.full_name.trim();
    if (typeof input.department_id === 'string') profile.department_id = input.department_id;
    if (input.role === 'faculty' || input.role === 'admin') profile.role = input.role;
    if (input.status === 'pending' || input.status === 'active' || input.status === 'suspended') {
      profile.status = input.status;
    }

    profile.updated_at = new Date().toISOString();
    return HttpResponse.json([profile]);
  }),

  http.delete('*/rest/v1/faculty_profiles', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const targetId = parseEqUuidFilter(url.searchParams.get('id'));
    if (!targetId) {
      return HttpResponse.json(
        {
          code: 'PGRST100',
          message: 'A valid id=eq.<uuid> filter is required.',
          details: 'Provide an equality filter matching a valid UUID.',
          hint: 'Pass ?id=eq.<uuid> in the request query string.',
        },
        { status: 400 },
      );
    }

    const index = facultyProfiles.findIndex((item) => item.id === targetId);

    if (index === -1) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The faculty profile was not found.',
          details: null,
          hint: 'Check the faculty identifier.',
        },
        { status: 404 },
      );
    }

    const target = facultyProfiles[index];
    if (reviews.some((review) => review.owner_id === target.id)) {
      return HttpResponse.json(
        {
          code: '23503',
          message: 'Cannot delete a faculty profile that still owns reviews.',
          details: 'Key is still referenced from table "reviews".',
          hint: 'Remove dependent reviews before removing this faculty account.',
        },
        { status: 409 },
      );
    }

    facultyProfiles.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/rest/v1/approval_queue_items', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);

    if (!isRecord(input) || !isRecord(input.payload)) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The application is invalid.',
          details: 'Expected an application type and payload.',
          hint: 'Correct the application and try again.',
        },
        { status: 422 },
      );
    }

    const item: ApprovalItem = {
      id: `mock-approval-${approvalQueue.length + 1}`,
      type: input.type === 'program_proposal' || input.type === 'department_proposal'
        ? input.type
        : 'student_registration',
      payload: input.payload as ApprovalPayload,
      status: 'pending',
      submitted_by: ownerId,
      decided_by: null,
      decision_reason: null,
      created_at: new Date().toISOString(),
      decided_at: null,
    };

    approvalQueue.push(item);
    return HttpResponse.json([item], { status: 201 });
  }),

  http.get('*/rest/v1/approval_queue_items', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const typeFilter = url.searchParams.get('type');
    return HttpResponse.json(approvalQueue.filter((item) =>
      (!statusFilter || statusFilter === `eq.${item.status}`)
      && (!typeFilter || typeFilter === `eq.${item.type}`),
    ));
  }),

  http.post('*/functions/v1/approvals', async ({ request }) => {
    await delay(10);
    const body: unknown = await request.json().catch(() => null);
    const applicationIds = isRecord(body) && Array.isArray(body.application_ids)
      ? body.application_ids.filter((id): id is string => typeof id === 'string')
      : [];
    if (!isRecord(body) || applicationIds.length === 0 || !['approve', 'reject'].includes(String(body.decision))) {
      return HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'The request contains invalid data.', details: 'Expected application_ids and an approve or reject decision.', hint: 'Correct the request and retry.' }, { status: 422 });
    }
    if (body.decision === 'reject' && (typeof body.reason !== 'string' || !body.reason.trim())) {
      return HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'The request contains invalid data.', details: 'A nonblank reason is required to reject applications.', hint: 'Add a rejection reason and retry.' }, { status: 422 });
    }
    const selected = approvalQueue.filter((item) => applicationIds.includes(item.id));
    if (selected.length !== applicationIds.length) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'The requested record was not found.', details: null, hint: 'Check the record identifier.' }, { status: 404 });
    }
    if (selected.some((item) => item.status !== 'pending')) {
      return HttpResponse.json({ code: 'INVALID_STATE', message: 'The operation is not allowed in the current state.', details: null, hint: 'Refresh the record and try an allowed action.' }, { status: 409 });
    }
    const timestamp = new Date().toISOString();
    const decided = selected.map((item) => {
      item.status = body.decision === 'approve' ? 'approved' : 'rejected';
      item.decided_by = ownerId;
      item.decision_reason = body.decision === 'reject' && typeof body.reason === 'string' ? body.reason : null;
      item.decided_at = timestamp;
      return item;
    });
    return HttpResponse.json(decided);
  }),

  http.get('*/rest/v1/departments', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const nameFilter = url.searchParams.get('name');
    const statusFilter = url.searchParams.get('status');
    return HttpResponse.json(departments.filter((item) =>
      matches(item.name, nameFilter) && matches(item.status, statusFilter),
    ));
  }),

  http.post('*/rest/v1/departments', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);
    const name = isRecord(input) && typeof input.name === 'string'
      ? input.name.trim()
      : '';

    if (!name) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The department name is invalid.',
          details: 'A nonblank name is required.',
          hint: 'Enter a department name and try again.',
        },
        { status: 422 },
      );
    }

    const timestamp = new Date().toISOString();
    const department = {
      id: `mock-department-${departments.length + 1}`,
      name,
      status: 'approved' as const,
      proposed_by: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    departments.push(department);
    return HttpResponse.json([department], { status: 201 });
  }),

  http.patch('*/rest/v1/departments', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const input: unknown = await request.json().catch(() => null);
    const name = isRecord(input) && typeof input.name === 'string'
      ? input.name.trim()
      : '';

    const department = departments.find((item) => matches(item.id, idFilter));

    if (!department) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The department was not found.',
          details: null,
          hint: 'Check the department identifier.',
        },
        { status: 404 },
      );
    }

    if (!name) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The department name is invalid.',
          details: 'A nonblank name is required.',
          hint: 'Enter a department name and try again.',
        },
        { status: 422 },
      );
    }

    department.name = name;
    department.updated_at = new Date().toISOString();

    return HttpResponse.json([department]);
  }),

  http.delete('*/rest/v1/departments', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const index = departments.findIndex((item) => matches(item.id, idFilter));

    if (index === -1) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The department was not found.',
          details: null,
          hint: 'Check the department identifier.',
        },
        { status: 404 },
      );
    }

    departments.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/rest/v1/programs', async ({ request }) => {
    await delay(10);
    const url = new URL(request.url);
    const nameFilter = url.searchParams.get('name');
    const statusFilter = url.searchParams.get('status');
    return HttpResponse.json(programs.filter((item) =>
      matches(item.name, nameFilter) && matches(item.status, statusFilter),
    ));
  }),

  http.post('*/rest/v1/programs', async ({ request }) => {
    await delay(10);

    const input: unknown = await request.json().catch(() => null);
    const name = isRecord(input) && typeof input.name === 'string'
      ? input.name.trim()
      : '';

    if (!name) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The program name is invalid.',
          details: 'A nonblank name is required.',
          hint: 'Enter a program name and try again.',
        },
        { status: 422 },
      );
    }

    const timestamp = new Date().toISOString();
    const program = {
      id: `mock-program-${programs.length + 1}`,
      name,
      status: 'approved' as const,
      proposed_by: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    programs.push(program);
    return HttpResponse.json([program], { status: 201 });
  }),

  http.patch('*/rest/v1/programs', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const input: unknown = await request.json().catch(() => null);
    const name = isRecord(input) && typeof input.name === 'string'
      ? input.name.trim()
      : '';

    const program = programs.find((item) => matches(item.id, idFilter));

    if (!program) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The program was not found.',
          details: null,
          hint: 'Check the program identifier.',
        },
        { status: 404 },
      );
    }

    if (!name) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'The program name is invalid.',
          details: 'A nonblank name is required.',
          hint: 'Enter a program name and try again.',
        },
        { status: 422 },
      );
    }

    program.name = name;
    program.updated_at = new Date().toISOString();

    return HttpResponse.json([program]);
  }),

  http.delete('*/rest/v1/programs', async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const index = programs.findIndex((item) => matches(item.id, idFilter));

    if (index === -1) {
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'The program was not found.',
          details: null,
          hint: 'Check the program identifier.',
        },
        { status: 404 },
      );
    }

    programs.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  auditLogHandler(),
];

export const __resetMocks = () => {
  chatbotCallCount = 0;
  nextReviewId = 1;
  nextRevisionId = 1;

  restore(students, initialStudents);
  restore(approvalQueue, initialApprovalQueue);
  restore(departments, initialDepartments);
  restore(programs, initialPrograms);
  restore(facultyProfiles, initialFacultyProfiles);
  restore(reviews, [initialReview]);
  restore(reviewRevisions, [initialRevision]);
};
