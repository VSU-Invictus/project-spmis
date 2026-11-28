import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { components } from '../../../contract/generated/schema';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export type OwnProfile = components['schemas']['FacultyProfile'];

export function useOwnProfile(
  options?: Omit<UseQueryOptions<OwnProfile | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.ownProfile(),
    queryFn: async (): Promise<OwnProfile | null> => {
      const profile = await request(apiClient.GET('/rest/v1/rpc/get_own_profile'));
      return profile ?? null;
    },
    ...options,
  });
}
