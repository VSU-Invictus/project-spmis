import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';

export type ReviewStatusRequest = components['schemas']['ReviewStatusRequest'];
export type ReviewStatusResult = components['schemas']['ReviewStatusResult'];
export type SetReviewStatusVariables = {
  id: string;
  body: ReviewStatusRequest;
  headers?: Record<string, string>;
};

export function useSetReviewStatus(
  options?: UseMutationOptions<ReviewStatusResult, Error, SetReviewStatusVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: SetReviewStatusVariables): Promise<ReviewStatusResult> => {
      const result = await request(
        apiClient.POST('/functions/v1/reviews/{id}/status', {
          params: {
            path: {
              id: variables.id,
            },
          },
          body: variables.body,
          headers: variables.headers,
        })
      );
      return result as ReviewStatusResult;
    },
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ['listStudentReviews'] });
      await queryClient.invalidateQueries({ queryKey: ['listReviewRevisions'] });
      await queryClient.invalidateQueries({ queryKey: ['searchStudents'] });
      if (options?.onSuccess) {
        // @ts-expect-error tanstack query v5 callback compatibility
        options.onSuccess(data, variables, context);
      }
    },
  });
}
