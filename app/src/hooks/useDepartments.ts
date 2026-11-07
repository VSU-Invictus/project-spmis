import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListDepartmentsParams = operations['listDepartments']['parameters']['query'];
export type Department = components['schemas']['Department'];

export function useDepartments(
  params?: ListDepartmentsParams,
  options?: Omit<UseQueryOptions<Department[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.departments(params as Record<string, unknown>),
    queryFn: async (): Promise<Department[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/departments', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as Department[];
    },
    ...options,
  });
}

