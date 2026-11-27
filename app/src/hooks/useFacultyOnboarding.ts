import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { components } from '../../../contract/generated/schema';
import { queryKeys } from './queryKeys';

export type OnboardingDepartment = components['schemas']['FacultyOnboardingDepartment'];
export type FacultyOnboardingInput = components['schemas']['FacultyOnboardingInput'];
export type OnboardedFacultyProfile = components['schemas']['FacultyProfile'];

/** listFacultyOnboardingDepartments: approved departments for verified Google users without a profile. */
export function useOnboardingDepartments(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.onboardingDepartments(),
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<OnboardingDepartment[]> =>
      (await request(apiClient.GET('/functions/v1/faculty-onboarding'))) ?? [],
  });
}

/** completeFacultyOnboarding: creates the caller's pending faculty profile. */
export function useCompleteFacultyOnboarding(
  options?: Omit<UseMutationOptions<OnboardedFacultyProfile, Error, FacultyOnboardingInput>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: FacultyOnboardingInput): Promise<OnboardedFacultyProfile> => {
      // Exact contract fields only; identity, role and status are server-owned.
      const body: FacultyOnboardingInput = { full_name: input.full_name, department_id: input.department_id };
      const result = await request(apiClient.POST('/functions/v1/faculty-onboarding', { body }));
      if (!result) throw new Error('The server did not return the created faculty profile.');
      return result;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryKeys.ownProfile(),
        queryKeys.onboardingDepartments(),
        queryKeys.approvalQueueItems(),
        queryKeys.facultyProfiles(),
      ].map(([operationId]) => queryClient.invalidateQueries({ queryKey: [operationId] })));
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
