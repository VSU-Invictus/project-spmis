import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export type DeleteDepartmentInput = string;

export function useDeleteDepartment(
  options?: Omit<UseMutationOptions<void, Error, DeleteDepartmentInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: DeleteDepartmentInput): Promise<void> => {
      await request(
        apiClient.DELETE('/rest/v1/departments', {
          params: { query: { id: `eq.${id}` } },
        }),
      );

    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([queryKeys.departments(), queryKeys.searchStudents(), queryKeys.auditLogs(), queryKeys.facultyProfiles(), queryKeys.studentReviews()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
