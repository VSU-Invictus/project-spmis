import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import { queryKeys } from './queryKeys';

export function useDeleteFaculty(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: string): Promise<void> => {
      const existing = await request(
        apiClient.GET('/rest/v1/faculty_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );
      if (!existing?.some((item) => item.id === id)) {
        throw new Error('The faculty record was not found. Close this dialog and refresh the roster.');
      }

      await request(
        apiClient.DELETE('/rest/v1/faculty_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );

      const remaining = await request(
        apiClient.GET('/rest/v1/faculty_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );
      if (remaining?.some((item) => item.id === id)) {
        throw new Error('The faculty record could not be removed. Verify your permissions and refresh the roster.');
      }
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
