import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListReviewRevisionsParams = operations['listReviewRevisions']['parameters']['query'];
export type ReviewRevision = components['schemas']['ReviewRevision'];

export function useReviewRevisions(
  params: ListReviewRevisionsParams | undefined,
  options?: Omit<UseQueryOptions<ReviewRevision[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.reviewRevisions(params as Record<string, unknown>),
    queryFn: async (): Promise<ReviewRevision[]> => {
      if (!params?.review_id) return [];
      const result = await request(
        apiClient.GET('/rest/v1/review_revisions', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as ReviewRevision[];
    },
    enabled: Boolean(params?.review_id),
    ...options,
  });
}
