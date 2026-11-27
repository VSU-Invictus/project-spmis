import { createFacultyOnboardingHandler } from '../_shared/faculty-onboarding-handler.ts';
import { adminClient, requireUser } from '../_shared/supabase.ts';

Deno.serve(createFacultyOnboardingHandler({
  requireUser,
  async complete(userId, input) {
    return await adminClient().rpc('complete_faculty_onboarding', {
      p_actor_id: userId,
      p_full_name: input.full_name,
      p_department_id: input.department_id,
    });
  },
}));
