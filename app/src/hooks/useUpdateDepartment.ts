import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { Department } from './useDepartments';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type UpdateDepartmentInput = components['schemas']['ManagedListInput'] & { id: string };

export function useUpdateDepartment(
  options?: Omit<UseMutationOptions<Department[], Error, UpdateDepartmentInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateDepartmentInput): Promise<Department[]> => {
      const result = await request(
        apiClient.PATCH('/rest/v1/departments', {
          params: { query: { id: `eq.${input.id}` }, header: { Prefer: 'return=representation' } },
          body: { name: input.name },
        }),
      );
      return result ?? [];
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([queryKeys.departments(), queryKeys.searchStudents(), queryKeys.auditLogs(), queryKeys.facultyProfiles(), queryKeys.studentReviews()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
