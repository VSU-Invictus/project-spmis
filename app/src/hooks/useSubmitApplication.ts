import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { ApprovalQueueItem } from './useApprovalQueueItems';
import { queryKeys } from './queryKeys';

export type SubmitApplicationInput = components['schemas']['ApplicationSubmission'];

function submissionBody(input: SubmitApplicationInput): SubmitApplicationInput {
  switch (input.type) {
    case 'student_registration':
      return {
        type: input.type,
        payload: {
          student_id_number: input.payload.student_id_number,
          first_name: input.payload.first_name,
          last_name: input.payload.last_name,
          middle_name: input.payload.middle_name,
          program_id: input.payload.program_id,
        },
      };
    case 'program_proposal':
      return {
        type: input.type,
        payload: { name: input.payload.name, program_id: input.payload.program_id },
      };
    case 'department_proposal':
      return {
        type: input.type,
        payload: { name: input.payload.name, department_id: input.payload.department_id },
      };
  }
}

export function useSubmitApplication(
  options?: Omit<UseMutationOptions<ApprovalQueueItem[], Error, SubmitApplicationInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: SubmitApplicationInput): Promise<ApprovalQueueItem[]> => {
      const result = await request(
        apiClient.POST('/rest/v1/approval_queue_items', {
          params: { header: { Prefer: 'return=representation' } },
          body: submissionBody(input),
        }),
      );
      return result ?? [];
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      // A submission creates a pending application, not an approved managed record.
      await Promise.all([queryKeys.approvalQueueItems(), queryKeys.auditLogs()].map(([operationId]) =>
        queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
      ));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
