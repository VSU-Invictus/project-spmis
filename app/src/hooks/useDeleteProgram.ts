import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export type DeleteProgramInput = string;

export function useDeleteProgram(
  options?: Omit<UseMutationOptions<void, Error, DeleteProgramInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: DeleteProgramInput): Promise<void> => {
      await request(
        apiClient.DELETE('/rest/v1/programs', {
          params: { query: { id: `eq.${id}` } },
        }),
      );

    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([queryKeys.programs(), queryKeys.searchStudents(), queryKeys.auditLogs()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
