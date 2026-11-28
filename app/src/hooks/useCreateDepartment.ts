import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { Department } from './useDepartments';
import { queryKeys } from './queryKeys';

export type CreateDepartmentInput = components['schemas']['ManagedListInput'];

export function useCreateDepartment(
  options?: Omit<UseMutationOptions<Department[], Error, CreateDepartmentInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateDepartmentInput): Promise<Department[]> => {
      const result = await request(
        apiClient.POST('/rest/v1/departments', {
          params: { header: { Prefer: 'return=representation' } },
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
