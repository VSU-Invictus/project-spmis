import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { Review } from './useStudentReviews';

export type CreateReviewRequest = components['schemas']['CreateReviewRequest'];
export type CreateReviewVariables =
  | CreateReviewRequest
  | { body: CreateReviewRequest; headers?: Record<string, string> };

export function useCreateReview(
  options?: UseMutationOptions<Review, Error, CreateReviewVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateReviewVariables): Promise<Review> => {
      const isWrapped = 'body' in variables && typeof variables.body === 'object' && 'body_document' in variables.body;
      const body = isWrapped ? (variables as { body: CreateReviewRequest }).body : (variables as CreateReviewRequest);
      const headers = isWrapped ? (variables as { headers?: Record<string, string> }).headers : undefined;

      const result = await request(
        apiClient.POST('/functions/v1/reviews', {
          body,
          headers,
        })
      );
      return result as Review;
    },
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ['listStudentReviews'] });
      await queryClient.invalidateQueries({ queryKey: ['searchStudents'] });
      if (options?.onSuccess) {
        // @ts-expect-error tanstack query v5 callback compatibility
        options.onSuccess(data, variables, context);
      }
    },
  });
}
