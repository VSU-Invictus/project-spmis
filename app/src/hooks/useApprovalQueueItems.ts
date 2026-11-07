import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListApprovalQueueItemsParams = operations['listApprovalQueueItems']['parameters']['query'];
export type ApprovalQueueItem = components['schemas']['ApprovalQueueItem'];

export function useApprovalQueueItems(
  params?: ListApprovalQueueItemsParams,
  options?: Omit<UseQueryOptions<ApprovalQueueItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.approvalQueueItems(params as Record<string, unknown>),
    queryFn: async (): Promise<ApprovalQueueItem[]> => {
      const result = await request(
        apiClient.GET('/rest/v1/approval_queue_items', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as ApprovalQueueItem[];
    },
    ...options,
  });
}
