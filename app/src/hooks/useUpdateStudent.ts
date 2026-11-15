import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { StudentProfile } from './useStudentById';
import { queryKeys } from './queryKeys';

export type UpdateStudentInput = components['schemas']['StudentInput'] & { id: string };

export function useUpdateStudent(
  options?: Omit<UseMutationOptions<StudentProfile[], Error, UpdateStudentInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateStudentInput): Promise<StudentProfile[]> => {
      const result = await request(
        apiClient.PATCH('/rest/v1/student_profiles', {
          params: { query: { id: `eq.${input.id}` }, header: { Prefer: 'return=representation' } },
          body: {
            student_id_number: input.student_id_number,
            first_name: input.first_name,
            last_name: input.last_name,
            middle_name: input.middle_name,
            program_id: input.program_id,
          },
        }),
      );
      return result ?? [];
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        ...[queryKeys.searchStudents(), queryKeys.auditLogs()].map(([operationId]) =>
          queryClient.invalidateQueries({ queryKey: [operationId], refetchType: 'all' }),
        ),
        queryClient.invalidateQueries({
          queryKey: queryKeys.studentById(variables.id), exact: true, refetchType: 'all',
        }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
