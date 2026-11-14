import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import type { StudentProfile } from './useStudentById';
import { queryKeys } from './queryKeys';

export type CreateStudentDirectInput = components['schemas']['StudentInput'];

export function useCreateStudentDirect(
  options?: Omit<UseMutationOptions<StudentProfile[], Error, CreateStudentDirectInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateStudentDirectInput): Promise<StudentProfile[]> => {
      const result = await request(
        apiClient.POST('/rest/v1/student_profiles', {
          params: { header: { Prefer: 'return=representation' } },
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
        ...data.map(student => queryClient.invalidateQueries({
          queryKey: queryKeys.studentById(student.id), exact: true, refetchType: 'all',
        })),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
