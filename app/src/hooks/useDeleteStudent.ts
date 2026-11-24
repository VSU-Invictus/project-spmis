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
      const existing = await request(
        apiClient.GET('/rest/v1/rpc/get_student_by_id', {
          params: { query: { p_student_id: id } },
        }),
      );
      if (existing?.id !== id) {
        throw new Error('The student record was not found. Close this dialog and refresh the roster.');
      }

      await request(
        apiClient.DELETE('/rest/v1/student_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );

      const remaining = await request(
        apiClient.GET('/rest/v1/rpc/get_student_by_id', {
          params: { query: { p_student_id: id } },
        }),
      );
      if (remaining?.id === id) {
        throw new Error('The student record could not be removed. Verify your permissions and refresh the roster.');
      }
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
