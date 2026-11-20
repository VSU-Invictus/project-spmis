export interface StudentNameRecord {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  student_id_number?: string | null;
  program_name?: string | null;
  program?: { name: string } | Array<{ name: string }> | null;
}

interface Replacement {
  token: string;
  name: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clean(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

function variants(student: StudentNameRecord): string[] {
  const first = clean(student.first_name);
  const middle = clean(student.middle_name);
  const last = clean(student.last_name);
  return [...new Set([
    [first, middle, last].filter(Boolean).join(' '),
    [first, last].filter(Boolean).join(' '),
    [last, first].filter(Boolean).join(' '),
    [last, middle, first].filter(Boolean).join(', '),
    [last, first].filter(Boolean).join(', '),
    first,
    middle,
    last,
  ].filter((value) => value.length > 1))];
}

function reidentifiedValue(student: StudentNameRecord): string {
  const name = [clean(student.first_name), clean(student.middle_name), clean(student.last_name)]
    .filter(Boolean).join(' ');
  const details = [
    clean(student.student_id_number),
    clean(student.program_name) ||
      (Array.isArray(student.program) ? clean(student.program[0]?.name ?? null) : clean(student.program?.name ?? null)),
  ].filter(Boolean);
  return details.length ? `${name} (${details.join(', ')})` : name;
}

export function deidentifyText(
  text: string,
  students: StudentNameRecord[],
): { text: string; replacements: Replacement[] } {
  const replacements: Replacement[] = [];
  let output = text;
  const names = students
    .flatMap((student) => variants(student).map((name) => ({
      name,
      token: `{{STUDENT:${student.id}}}`,
    })))
    .sort((left, right) => right.name.length - left.name.length);

  for (const candidate of names) {
    const expression = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(candidate.name)}(?![\\p{L}\\p{N}])`, 'giu');
    if (expression.test(output)) {
      output = output.replace(expression, candidate.token);
      replacements.push(candidate);
    }
  }

  return { text: output, replacements };
}

export function reidentifyText(
  text: string,
  students: StudentNameRecord[],
): string {
  const names = new Map(students.map((student) => [
    `{{STUDENT:${student.id.toLowerCase()}}}`,
    reidentifiedValue(student),
  ]));
  return text.replace(/\{\{STUDENT:([0-9a-f-]+)\}\}/gi, (token, id: string) =>
    names.get(`{{STUDENT:${id.toLowerCase()}}}`) ?? token);
}
