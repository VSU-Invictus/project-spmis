import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { components } from '../../../contract/generated/schema';
import { apiClient, request } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { queryKeys } from './queryKeys';

export type UpdateOwnProfileInput = components['schemas']['OwnProfileUpdate'];
type OwnProfile = components['schemas']['FacultyProfile'];

export function useUpdateOwnProfile(
  options?: UseMutationOptions<OwnProfile, Error, UpdateOwnProfileInput>
) {
  const queryClient = useQueryClient();
  const { syncProfile } = useSession();

  return useMutation({
    mutationFn: async (body: UpdateOwnProfileInput): Promise<OwnProfile> => {
      const profiles = await request(
        apiClient.POST('/rest/v1/rpc/update_own_profile', { body })
      );
      const profile = profiles?.[0];
      if (!profile) throw new Error('The profile update returned no profile.');
      return profile;
    },
    ...options,
    onSuccess: async (profile, variables, onMutateResult, context) => {
      queryClient.setQueryData(queryKeys.ownProfile(), profile);
      syncProfile(profile);
      await queryClient.invalidateQueries({ queryKey: queryKeys.ownProfile() });
      await options?.onSuccess?.(profile, variables, onMutateResult, context);
    },
  });
}
