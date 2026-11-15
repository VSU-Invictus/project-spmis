import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { Program } from './usePrograms';
import { queryKeys } from './queryKeys';

export type CreateProgramInput = components['schemas']['ManagedListInput'];

export function useCreateProgram(
  options?: Omit<UseMutationOptions<Program[], Error, CreateProgramInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateProgramInput): Promise<Program[]> => {
      const result = await request(
        apiClient.POST('/rest/v1/programs', {
          params: { header: { Prefer: 'return=representation' } },
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
