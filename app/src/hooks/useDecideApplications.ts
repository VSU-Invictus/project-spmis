import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { ApprovalQueueItem } from './useApprovalQueueItems';

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
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ['listApprovalQueueItems'] });
      await queryClient.invalidateQueries({ queryKey: ['listFaculty'] });
      await queryClient.invalidateQueries({ queryKey: ['searchStudents'] });
      await queryClient.invalidateQueries({ queryKey: ['listDepartments'] });
      await queryClient.invalidateQueries({ queryKey: ['listPrograms'] });
      if (options?.onSuccess) {
        // @ts-expect-error tanstack query callback compatibility
        options.onSuccess(data, variables, context);
      }
    },
  });
}
