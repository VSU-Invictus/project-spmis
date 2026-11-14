import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { FacultyListItem } from './useFacultyList';
import { queryKeys } from './queryKeys';

export type UpdateFacultyByAdminInput = components['schemas']['FacultyUpdate'] & { id: string };

export function useUpdateFacultyByAdmin(
  options?: Omit<UseMutationOptions<FacultyListItem[], Error, UpdateFacultyByAdminInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateFacultyByAdminInput): Promise<FacultyListItem[]> => {
      const result = await request(
        apiClient.PATCH('/rest/v1/faculty_profiles', {
          params: { query: { id: `eq.${input.id}` }, header: { Prefer: 'return=representation' } },
          body: {
            email: input.email,
            full_name: input.full_name,
            department_id: input.department_id,
            role: input.role,
            status: input.status,
          },
        }),
      );
      return result ?? [];
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryKeys.facultyProfiles(),
        queryKeys.auditLogs(),
        queryKeys.searchStudents(),
        queryKeys.studentReviews(),
        queryKeys.ownProfile(),
      ].map(([operationId]) => queryClient.invalidateQueries({
        queryKey: [operationId], refetchType: 'all',
      })));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
