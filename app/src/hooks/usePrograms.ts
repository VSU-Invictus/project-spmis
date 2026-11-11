import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListProgramsParams = operations['listPrograms']['parameters']['query'];
export type Program = components['schemas']['Program'];

export function usePrograms(
  params?: ListProgramsParams,
  options?: Omit<UseQueryOptions<Program[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.programs(params as Record<string, unknown>),
    queryFn: async (): Promise<Program[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/programs', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as Program[];
    },
    ...options,
  });
}

