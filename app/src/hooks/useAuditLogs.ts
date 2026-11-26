import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';
import { waitForAuditLogMock } from '../mocks/browser';

export type ListAuditLogsParams = operations['listAuditLogs']['parameters']['query'];
export type AuditLogEntry = components['schemas']['AuditLogEntry'];

function readPreviewTotal(contentRange: string | null, rowCount: number, limit: number): number | null {
  if (rowCount === 0) return contentRange === '*/0' ? 0 : null;
  const range = /^0-(\d+)\/(\d+)$/.exec(contentRange ?? '');
  // Static mock metadata can advertise a range that disagrees with the returned page.
  if (!range || rowCount > limit || Number(range[1]) !== rowCount - 1) return null;
  const total = Number(range[2]);
  return Number.isSafeInteger(total) && total >= rowCount ? total : null;
}

export function useAuditLogs(
  params?: ListAuditLogsParams,
  options?: Omit<UseQueryOptions<AuditLogEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params as Record<string, unknown>),
    queryFn: async (): Promise<AuditLogEntry[]> => {
      await waitForAuditLogMock();
      const result = await request(
        apiClient.GET('/rest/v1/audit_log_entries', {
          params: {
            query: params,
          },
        })
      );
      return (result ?? []) as AuditLogEntry[];
    },
    ...options,
  });
}

/** Request the exact count on the same first-page request used for the Dashboard preview. */
export function useAuditLogPreview(limit: number) {
  const params = { limit, order: 'created_at.desc,id.asc' } as const;
  return useQuery({
    queryKey: [...queryKeys.auditLogs(params), 'preview-with-count'],
    queryFn: async () => {
      await waitForAuditLogMock();
      let contentRange: string | null = null;
      const entries = (await request<AuditLogEntry[]>(apiClient.GET('/rest/v1/audit_log_entries', {
        params: { query: params, header: { Prefer: 'count=exact' } },
      }).then(result => {
        contentRange = result.response.headers.get('Content-Range');
        return result;
      }))) ?? [];

      return { entries, total: readPreviewTotal(contentRange, entries.length, limit) };
    },
  });
}
