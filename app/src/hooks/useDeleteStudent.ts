import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export function useDeleteStudent(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: string): Promise<void> => {
      await request(
        apiClient.DELETE('/rest/v1/student_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        ...[queryKeys.searchStudents(), queryKeys.auditLogs()].map(([operationId]) =>
          queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
        ),
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentById(variables),
          exact: true,
          refetchType: 'all',
        }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
