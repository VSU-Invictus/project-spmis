import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListFacultyParams = operations['listFaculty']['parameters']['query'];
export type FacultyListItem = components['schemas']['FacultyProfile'];

export function useFacultyList(
  params?: ListFacultyParams,
  options?: Omit<UseQueryOptions<FacultyListItem[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.facultyProfiles(params as Record<string, unknown>),
    queryFn: async (): Promise<FacultyListItem[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/faculty_profiles', { params: { query: params } }),
      );
      return result ?? [];
    },
    ...options,
  });
}

/** Counted roster variant; shares the operation prefix used by mutation invalidation. */
export function useFacultyPage(params: ListFacultyParams) {
  return useQuery({
    queryKey: [...queryKeys.facultyProfiles(params as Record<string, unknown>), 'counted-page'],
    queryFn: async (): Promise<{ faculty: FacultyListItem[]; total: number }> => {
      let contentRange: string | null = null;
      const faculty = await request(apiClient.GET('/rest/v1/faculty_profiles', {
        params: { query: params, header: { Prefer: 'count=exact' } },
      }).then(result => {
        contentRange = result.response.headers.get('Content-Range');
        return result;
      }));
      const count = /\/(\d+)$/.exec(contentRange ?? '');
      if (!count) throw new Error('Faculty count unavailable. Please retry loading the roster.');
      return { faculty: (faculty ?? []) as FacultyListItem[], total: Number(count[1]) };
    },
  });
}
