import { useQueries, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type StudentProfile = components['schemas']['StudentProfile'];

async function fetchStudentById(studentId: string): Promise<StudentProfile | null> {
  const result = await request(
    apiClient.GET('/rest/v1/rpc/get_student_by_id', {
      params: { query: { p_student_id: studentId } },
    })
  );
  return (result ?? null) as StudentProfile | null;
}

export function useStudentById(
  studentId: string | undefined,
  options?: Omit<UseQueryOptions<StudentProfile | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.studentById(studentId ?? ''),
    queryFn: async (): Promise<StudentProfile | null> => {
      if (!studentId) return null;
      return fetchStudentById(studentId);
    },
    enabled: Boolean(studentId),
    ...options,
  });
}

/** Load only the student records needed for a small collection such as recent reviews. */
export function useStudentsByIds(studentIds: string[], enabled = true) {
  const uniqueIds = [...new Set(studentIds)];
  return useQueries({
    queries: uniqueIds.map((studentId) => ({
      queryKey: queryKeys.studentById(studentId),
      queryFn: () => fetchStudentById(studentId),
      enabled: enabled && Boolean(studentId),
    })),
  });
}
