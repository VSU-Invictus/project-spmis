import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type SearchStudentsParams = operations['searchStudents']['parameters']['query'];
export type StudentSearchResult = components['schemas']['StudentSearchResult'];

export function useSearchStudents(
  params?: SearchStudentsParams,
  options?: Omit<UseQueryOptions<StudentSearchResult[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.searchStudents(params as Record<string, unknown>),
    queryFn: async (): Promise<StudentSearchResult[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/rpc/search_students', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as StudentSearchResult[];
    },
    ...options,
  });
}
