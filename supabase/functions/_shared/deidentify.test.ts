import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { deidentifyText, reidentifyText } from './deidentify.ts';

const students = [{
  id: '40000000-0000-4000-8000-000000000001',
  first_name: 'Maria',
  middle_name: 'Dela Cruz',
  last_name: 'Santos',
  student_id_number: 'TEST-001',
  program_name: 'Example Computer Science',
}];

Deno.test('deidentifies full, partial, and student ID variants case-insensitively', () => {
  const result = deidentifyText(
    'Maria Dela Cruz Santos / Maria Santos / SANTOS Maria / Santos, Maria / Maria / Dela Cruz / Santos / TEST-001',
    students,
  );
  assertEquals(
    result.text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}}',
  );
});

Deno.test('redacts colliding single-name variants without binding to the wrong student', () => {
  const collidingStudents = [
    ...students,
    {
      id: '40000000-0000-4000-8000-000000000003',
      first_name: 'Maria',
      middle_name: null,
      last_name: 'Reyes',
      student_id_number: 'TEST-003',
      program_name: 'Example Mathematics',
    },
  ];
  const deidentified = deidentifyText(
    'Maria Santos and Maria Reyes both excelled, though Maria led the lab.',
    collidingStudents,
  ).text;

  assertEquals(
    deidentified,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} and {{STUDENT:40000000-0000-4000-8000-000000000003}} both excelled, though {{STUDENT:REDACTED}} led the lab.',
  );
  const restored = reidentifyText(deidentified, collidingStudents);
  assertEquals(
    restored,
    'Maria Dela Cruz Santos (TEST-001, Example Computer Science) and Maria Reyes (TEST-003, Example Mathematics) both excelled, though {{STUDENT:REDACTED}} led the lab.',
  );
});

Deno.test('reverse substitution restores known tokens and preserves unknown tokens', () => {
  assertEquals(
    reidentifyText(
      '{{STUDENT:40000000-0000-4000-8000-000000000001}} helped {{student:40000000-0000-4000-8000-000000000001}} and {{STUDENT:unknown}}.',
      students,
    ),
    'Maria Dela Cruz Santos (TEST-001, Example Computer Science) helped Maria Dela Cruz Santos (TEST-001, Example Computer Science) and {{STUDENT:unknown}}.',
  );
});

Deno.test('deidentifies and restores names for multiple students in one response', () => {
  const secondStudent = {
    id: '40000000-0000-4000-8000-000000000002',
    first_name: 'Alex',
    middle_name: null,
    last_name: 'Rivera',
    student_id_number: 'TEST-002',
    program_name: 'Example Mathematics',
  };
  const allStudents = [...students, secondStudent];
  const deidentified = deidentifyText(
    'Maria Santos collaborated with Rivera, Alex.',
    allStudents,
  ).text;

  assertEquals(
    deidentified,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} collaborated with {{STUDENT:40000000-0000-4000-8000-000000000002}}.',
  );
  const restored = reidentifyText(deidentified, allStudents);
  assertEquals(
    restored,
    'Maria Dela Cruz Santos (TEST-001, Example Computer Science) collaborated with Alex Rivera (TEST-002, Example Mathematics).',
  );
  assertEquals(restored.includes('{{STUDENT:'), false);
});
