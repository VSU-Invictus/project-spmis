import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { Review } from './useStudentReviews';

export type UpdateReviewRequest = components['schemas']['UpdateReviewRequest'];
export type UpdateReviewVariables = {
  id: string;
  body: UpdateReviewRequest;
  headers?: Record<string, string>;
};

export function useUpdateReview(
  options?: UseMutationOptions<Review, Error, UpdateReviewVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateReviewVariables): Promise<Review> => {
      const result = await request(
        apiClient.PATCH('/functions/v1/reviews/{id}', {
          params: {
            path: {
              id: variables.id,
            },
          },
          body: variables.body,
          headers: variables.headers,
        })
      );
      return result as Review;
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
