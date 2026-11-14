import { assertEquals } from 'https://deno.land/std@0.224.0/assert/assert_equals.ts';
import { deidentifyText, reidentifyText } from './deidentify.ts';

const students = [{
  id: '40000000-0000-4000-8000-000000000001',
  first_name: 'Maria',
  middle_name: 'Dela Cruz',
  last_name: 'Santos',
}];

Deno.test('deidentifies full and partial student name variants case-insensitively', () => {
  const result = deidentifyText('Maria Dela Cruz Santos and SANTOS Maria showed initiative.', students);
  assertEquals(result.text, '{{STUDENT:40000000-0000-4000-8000-000000000001}} and {{STUDENT:40000000-0000-4000-8000-000000000001}} showed initiative.');
});

Deno.test('reverse substitution restores known tokens and preserves unknown tokens', () => {
  assertEquals(
    reidentifyText(
      '{{STUDENT:40000000-0000-4000-8000-000000000001}} helped {{STUDENT:unknown}}.',
      students,
    ),
    'Maria Dela Cruz Santos helped {{STUDENT:unknown}}.',
  );
});
