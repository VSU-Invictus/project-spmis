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

/** Caller-scoped history, with an identity-specific cache and complete bounded pages. */
export function useOwnApplications(profileId: string) {
  return useQuery({
    queryKey: [...queryKeys.approvalQueueItems(), 'own-history', profileId],
    queryFn: async (): Promise<ApprovalQueueItem[]> => {
      const items: ApprovalQueueItem[] = [];
      for (let offset = 0; ; offset += 100) {
        const page = await request(apiClient.GET('/rest/v1/approval_queue_items', {
          params: { query: { limit: 100, offset, order: 'created_at.desc,id.asc' } },
        }));
        // RLS remains authoritative. Also avoid displaying unrelated mock/cached rows.
        items.push(...(page ?? []).filter(item => item.submitted_by === profileId));
        if (!page || page.length < 100) return items;
      }
    },
  });
}

