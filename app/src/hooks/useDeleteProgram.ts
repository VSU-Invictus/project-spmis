import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export type DeleteProgramInput = string;

async function programExists(id: string): Promise<boolean> {
  for (let offset = 0; ; offset += 100) {
    const page = await request(
      apiClient.GET('/rest/v1/programs', {
        params: { query: { limit: 100, offset, order: 'name.asc,id.asc' } },
      }),
    );
    if (page?.some((item) => item.id === id)) return true;
    if (!page || page.length < 100) return false;
  }
}

export function useDeleteProgram(
  options?: Omit<UseMutationOptions<void, Error, DeleteProgramInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: DeleteProgramInput): Promise<void> => {
      if (!(await programExists(id))) {
        throw new Error('The program record was not found. Close this dialog and refresh the list.');
      }

      await request(
        apiClient.DELETE('/rest/v1/programs', {
          params: { query: { id: `eq.${id}` } },
        }),
      );

      if (await programExists(id)) {
        throw new Error('The program record could not be removed. Verify your permissions and refresh the list.');
      }
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([queryKeys.programs(), queryKeys.searchStudents(), queryKeys.auditLogs()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
