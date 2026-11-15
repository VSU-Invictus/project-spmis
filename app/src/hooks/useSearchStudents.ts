import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';
import { countedPage } from '../lib/api/countedPage';

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

export interface StudentSearchPage {
  students: StudentSearchResult[];
  total: number;
}

/** Counted variant for server-paginated rosters; keeps the existing Faculty hook unchanged. */
export function useStudentSearchPage(params: SearchStudentsParams) {
  return useQuery({
    queryKey: [...queryKeys.searchStudents(params as Record<string, unknown>), 'counted-page'],
    queryFn: async (): Promise<StudentSearchPage> => {
      let contentRange: string | null = null;
      const students = await request<StudentSearchResult[]>(apiClient.GET('/rest/v1/rpc/search_students', {
        params: { query: params, header: { Prefer: 'count=exact' } },
      }).then(result => {
        contentRange = result.response.headers.get('Content-Range');
        return result;
      }));
      const page = await countedPage(students ?? [], contentRange, params?.offset ?? 0, params?.limit ?? 20,
        async (offset, limit) => (await request(apiClient.GET('/rest/v1/rpc/search_students', {
          params: { query: { ...params, offset, limit, order: params?.order ?? 'created_at.desc,id.asc' } },
        }))) ?? []);
      return { students: page.records, total: page.total };
    },
  });
}
