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

Deno.test('deidentifies full and partial student name variants case-insensitively', () => {
  const result = deidentifyText(
    'Maria Dela Cruz Santos / Maria Santos / SANTOS Maria / Santos, Maria / Maria / Dela Cruz / Santos / TEST-001',
    students,
  );
  assertEquals(
    result.text,
    '{{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / {{STUDENT:40000000-0000-4000-8000-000000000001}} / TEST-001',
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
