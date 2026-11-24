import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { FacultyListItem } from './useFacultyList';
import { queryKeys } from './queryKeys';

export type CreateFacultyByAdminInput = components['schemas']['FacultyCreateInput'];

export function useCreateFacultyByAdmin(
  options?: Omit<UseMutationOptions<FacultyListItem[], Error, CreateFacultyByAdminInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateFacultyByAdminInput): Promise<FacultyListItem[]> => {
      const body: CreateFacultyByAdminInput = {
        email: input.email,
        full_name: input.full_name,
        department_id: input.department_id,
        role: input.role,
        ...(input.status !== undefined ? { status: input.status } : {}),
      };
      const result = await request(
        apiClient.POST('/rest/v1/faculty_profiles', {
          params: { header: { Prefer: 'return=representation' } },
          body,
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
      ].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
