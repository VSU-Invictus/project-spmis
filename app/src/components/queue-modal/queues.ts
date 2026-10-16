export const QUEUE_TYPES = ['student', 'department', 'program', 'faculty'] as const;
export type QueueType = (typeof QUEUE_TYPES)[number];

export const QUEUE_PARAM = 'queue';

export const QUEUE_TITLES: Record<QueueType, string> = {
  student: 'Student Proposals',
  department: 'Department Proposals',
  program: 'Program Proposals',
  faculty: 'Faculty Proposals'
};

export const QUEUE_ROUTES: Record<QueueType, string> = {
  student: '/admin/student-applications',
  department: '/admin/department-applications',
  program: '/admin/program-applications',
  faculty: '/admin/faculty-applications'
};

export function isQueueType(value: string | null | undefined): value is QueueType {
  return !!value && (QUEUE_TYPES as readonly string[]).includes(value);
}

