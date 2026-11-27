import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type InviteFacultyInput = components['schemas']['FacultyInvitationInput'];
export type FacultyInvitationResult = components['schemas']['FacultyInvitationResult'];

/** inviteFaculty: active admins provision a pending faculty account via Supabase Auth invitation. */
export function useInviteFaculty(
  options?: Omit<UseMutationOptions<FacultyInvitationResult, Error, InviteFacultyInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: InviteFacultyInput): Promise<FacultyInvitationResult> => {
      // Exact contract fields only; never send role, status, id or redirect.
      const body: InviteFacultyInput = {
        email: input.email,
        full_name: input.full_name,
        department_id: input.department_id,
      };
      const result = await request(apiClient.POST('/functions/v1/faculty-invitations', { body }));
      if (!result) throw new Error('The server did not confirm the invitation.');
      return result;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryKeys.facultyProfiles(),
        queryKeys.approvalQueueItems(),
        queryKeys.auditLogs(),
      ].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
