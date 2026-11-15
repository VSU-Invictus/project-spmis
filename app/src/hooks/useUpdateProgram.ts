import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { Program } from './usePrograms';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type UpdateProgramInput = components['schemas']['ManagedListInput'] & { id: string };

export function useUpdateProgram(
  options?: Omit<UseMutationOptions<Program[], Error, UpdateProgramInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateProgramInput): Promise<Program[]> => {
      const result = await request(
        apiClient.PATCH('/rest/v1/programs', {
          params: { query: { id: `eq.${input.id}` }, header: { Prefer: 'return=representation' } },
          body: { name: input.name },
        }),
      );
      return result ?? [];
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([queryKeys.programs(), queryKeys.searchStudents(), queryKeys.auditLogs()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
