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
      await request(
        apiClient.DELETE('/rest/v1/faculty_profiles', {
          params: { query: { id: `eq.${id}` } },
        }),
      );
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
