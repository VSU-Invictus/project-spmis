import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListStudentReviewsParams = operations['listStudentReviews']['parameters']['query'];
export type Review = components['schemas']['Review'];

export function useStudentReviews(
  params?: ListStudentReviewsParams,
  options?: Omit<UseQueryOptions<Review[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.studentReviews(params as Record<string, unknown>),
    queryFn: async (): Promise<Review[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/review_details', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as Review[];
    },
    ...options,
  });
}

