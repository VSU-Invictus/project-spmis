import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { Review } from './useStudentReviews';

export type CreateReviewRequest = components['schemas']['CreateReviewRequest'];

export function useCreateReview(
  options?: UseMutationOptions<Review, Error, CreateReviewRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateReviewRequest): Promise<Review> => {
      const result = await request(
        apiClient.POST('/functions/v1/reviews', {
          body,
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
