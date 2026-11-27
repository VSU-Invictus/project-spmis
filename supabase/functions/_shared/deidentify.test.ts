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
    students[0].id,
  );
  assertEquals(
    result.text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}}',
  );
});

Deno.test('redacts ambiguous full names without binding to the wrong student', () => {
  const collidingStudents = [
    ...students,
    {
      id: '40000000-0000-4000-8000-000000000003',
      first_name: 'Maria',
      middle_name: null,
      last_name: 'Santos',
      student_id_number: 'TEST-003',
      program_name: 'Example Mathematics',
    },
  ];
  const deidentified = deidentifyText(
    'Maria Santos led the lab.',
    collidingStudents,
  ).text;

  assertEquals(
    deidentified,
    '{{STUDENT:REDACTED}} led the lab.',
  );
  const restored = reidentifyText(deidentified, collidingStudents);
  assertEquals(
    restored,
    'a student led the lab.',
  );
});

Deno.test('review target partial names are redacted while other students common words remain intact', () => {
  const other = {
    id: '40000000-0000-4000-8000-000000000004',
    first_name: 'May', middle_name: 'Hope', last_name: 'Grace',
    student_id_number: 'TEST-004',
  };
  assertEquals(
    deidentifyText(
      'Maria may lead with grace and hope alongside May Grace (TEST-004).',
      [...students, other], students[0].id,
    ).text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} may lead with grace and hope alongside {{STUDENT:40000000-0000-4000-8000-000000000004}} ({{STUDENT:40000000-0000-4000-8000-000000000004}}).',
  );
  assertEquals(
    deidentifyText('Which students may need support? May Grace (TEST-004).', [other]).text,
    'Which students may need support? {{STUDENT:40000000-0000-4000-8000-000000000004}} ({{STUDENT:40000000-0000-4000-8000-000000000004}}).',
  );
});

Deno.test('generated and existing student tokens are not matched again as names', () => {
  const other = { ...students[0], id: '40000000-0000-4000-8000-000000000005', student_id_number: '40000000' };
  const token = `{{STUDENT:${students[0].id}}}`;
  assertEquals(deidentifyText(`TEST-001 ${token}`, [students[0], other]).text, `${token} ${token}`);
});

Deno.test('malformed student markers cannot shield names or student IDs from redaction', () => {
  const result = deidentifyText('{{STUDENT:Maria Santos}} and {{STUDENT:TEST-001}}', students).text;
  assertEquals(result.includes('Maria Santos'), false);
  assertEquals(result.includes('TEST-001'), false);
});

Deno.test('chat redacts last-first-middle full names without matching partial names', () => {
  assertEquals(
    deidentifyText('Santos, Maria Dela Cruz led the group. Maria may follow up.', students).text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} led the group. Maria may follow up.',
  );
});

Deno.test('chat redacts full names across repeated spaces, tabs and line breaks', () => {
  const token = `{{STUDENT:${students[0].id}}}`;
  assertEquals(
    deidentifyText('Maria  Santos / Maria\tSantos / Maria\nSantos / Santos, Maria\tDela\nCruz', students).text,
    `${token} / ${token} / ${token} / ${token}`,
  );
});

Deno.test('Unicode case-folded name matches resolve safely and preserve ambiguous ownership', () => {
  const token = `{{STUDENT:${students[0].id}}}`;
  assertEquals(deidentifyText('Maria \u017fantos', students).text, token);
  const other = { ...students[0], id: '40000000-0000-4000-8000-000000000006',
    last_name: '\u017fantos', student_id_number: 'TEST-006' };
  assertEquals(deidentifyText('Maria Santos', [...students, other]).text, '{{STUDENT:REDACTED}}');
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
