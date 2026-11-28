import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListTagsParams = operations['listTags']['parameters']['query'];
export type TagSuggestion = components['schemas']['TagSuggestion'];

export function useTags(
  params?: ListTagsParams,
  options?: Omit<UseQueryOptions<TagSuggestion[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.tags(params as Record<string, unknown>),
    queryFn: async (): Promise<TagSuggestion[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/rpc/suggest_review_tags', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as TagSuggestion[];
    },
    ...options,
  });
}
