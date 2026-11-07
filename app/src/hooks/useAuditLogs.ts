import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { operations, components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type ListAuditLogsParams = operations['listAuditLogs']['parameters']['query'];
export type AuditLogEntry = components['schemas']['AuditLogEntry'];

export function useAuditLogs(
  params?: ListAuditLogsParams,
  options?: Omit<UseQueryOptions<AuditLogEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params as Record<string, unknown>),
    queryFn: async (): Promise<AuditLogEntry[]> => {
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
