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
