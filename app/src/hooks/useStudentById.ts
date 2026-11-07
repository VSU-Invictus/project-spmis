import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type StudentProfile = components['schemas']['StudentProfile'];

export function useStudentById(
  studentId: string | undefined,
  options?: Omit<UseQueryOptions<StudentProfile | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.studentById(studentId ?? ''),
    queryFn: async (): Promise<StudentProfile | null> => {
      if (!studentId) return null;
      const result = await request(
        apiClient.GET('/rest/v1/rpc/get_student_by_id', {
          params: {
            query: {
              p_student_id: studentId,
            },
          },
        })
      );
      return (result ?? null) as StudentProfile | null;
    },
    enabled: Boolean(studentId),
    ...options,
  });
}
