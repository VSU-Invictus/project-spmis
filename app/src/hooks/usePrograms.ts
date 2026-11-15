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

/** Complete approved choices for forms, using the contract's bounded result pages. */
export function useApprovedProgramOptions() {
  return useQuery({
    queryKey: [...queryKeys.programs({ status: 'eq.approved' }), 'all-options'],
    queryFn: async (): Promise<Program[]> => {
      const programs: Program[] = [];
      for (let offset = 0; ; offset += 100) {
        const page = await request(apiClient.GET('/rest/v1/programs', {
          params: { query: { status: 'eq.approved', limit: 100, offset, order: 'name.asc,id.asc' } },
        }));
        programs.push(...(page ?? []));
        if (!page || page.length < 100) return programs;
      }
    },
  });
}
