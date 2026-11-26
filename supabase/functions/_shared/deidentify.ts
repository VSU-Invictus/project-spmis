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

function variants(student: StudentNameRecord, includePartialNames: boolean): string[] {
  const first = clean(student.first_name);
  const middle = clean(student.middle_name);
  const last = clean(student.last_name);
  const studentIdNumber = clean(student.student_id_number);
  return [...new Set([
    studentIdNumber,
    [first, middle, last].filter(Boolean).join(' '),
    [first, last].filter(Boolean).join(' '),
    [last, first].filter(Boolean).join(' '),
    [last, middle, first].filter(Boolean).join(', '),
    [last, first].filter(Boolean).join(', '),
    ...(includePartialNames ? [first, middle, last] : []),
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
  targetStudentId?: string,
): { text: string; replacements: Replacement[] } {
  const replacements: Replacement[] = [];
  let output = text;

  // Only a review's known subject permits partial-name matching. Chat has no
  // target and matches full names and IDs, preserving ordinary words like "may".
  const variantOwners = new Map<string, { name: string; studentIds: Set<string> }>();
  for (const student of students) {
    for (const name of variants(student, student.id === targetStudentId)) {
      const key = name.toLowerCase();
      const entry = variantOwners.get(key) ?? { name, studentIds: new Set<string>() };
      entry.studentIds.add(student.id);
      variantOwners.set(key, entry);
    }
  }

  const candidates = [...variantOwners.values()]
    .map(({ name, studentIds }) => ({
      name,
      token: studentIds.size === 1
        ? `{{STUDENT:${[...studentIds][0]}}}`
        : '{{STUDENT:REDACTED}}',
    }))
    .sort((left, right) => right.name.length - left.name.length);

  // Replace in one pass so a later name/ID cannot match inside a generated token.
  if (candidates.length) {
    const byName = new Map(candidates.map((candidate) => [candidate.name.toLowerCase(), candidate]));
    const expression = new RegExp(
      `\\{\\{STUDENT:[^}]+\\}\\}|(?<![\\p{L}\\p{N}])(?:${candidates.map((candidate) => escapeRegex(candidate.name)).join('|')})(?![\\p{L}\\p{N}])`,
      'giu',
    );
    output = output.replace(expression, (match) => {
      if (/^\{\{STUDENT:/i.test(match)) return match;
      const candidate = byName.get(match.toLowerCase())!;
      replacements.push(candidate);
      return candidate.token;
    });
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
  return text.replace(/\{\{STUDENT:(REDACTED|[0-9a-f-]+)\}\}/gi, (token, id: string) =>
    id.toUpperCase() === 'REDACTED' ? 'a student' :
      names.get(`{{STUDENT:${id.toLowerCase()}}}`) ?? token);
}
