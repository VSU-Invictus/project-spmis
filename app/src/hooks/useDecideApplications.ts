import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { ApprovalQueueItem } from './useApprovalQueueItems';
import { queryKeys } from './queryKeys';

export type ApplicationDecisionRequest = components['schemas']['ApplicationDecisionRequest'];

export function useDecideApplications(
  options?: UseMutationOptions<ApprovalQueueItem[], Error, ApplicationDecisionRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ApplicationDecisionRequest): Promise<ApprovalQueueItem[]> => {
      const result = await request(
        apiClient.POST('/functions/v1/approvals', {
          body,
        })
      );
      return (result ?? []) as ApprovalQueueItem[];
    },
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryKeys.approvalQueueItems(),
        queryKeys.facultyProfiles(),
        queryKeys.searchStudents(),
        queryKeys.departments(),
        queryKeys.programs(),
        queryKeys.auditLogs(),
      ].map(([operationId]) => queryClient.invalidateQueries({
        queryKey: [operationId],
        // Cached pages disable refetchOnMount, so refresh inactive variants too.
        refetchType: 'all',
      })));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

