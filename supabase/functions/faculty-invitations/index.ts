import { createFacultyInvitationHandler } from '../_shared/faculty-invitation-handler.ts';
import { adminClient, getProfile } from '../_shared/supabase.ts';
import { sendReservedFacultyInvitation } from '../_shared/reserved-faculty-invitation.ts';

Deno.serve(createFacultyInvitationHandler({
  getProfile,
  async validate(actorId, input) {
    return await adminClient().rpc('validate_faculty_invitation', {
      p_actor_id: actorId,
      p_email: input.email,
      p_department_id: input.department_id,
    });
  },
  async invite(actorId, input) {
    const db = adminClient();
    return await sendReservedFacultyInvitation({
      reserve: async () => await db.rpc('reserve_faculty_invitation', {
        p_actor_id: actorId, p_email: input.email, p_department_id: input.department_id,
      }),
      finish: async (token) => await db.rpc('finish_faculty_invitation', { p_email: input.email, p_token: token }),
      async send() {
        const { data, error } = await db.auth.admin.inviteUserByEmail(input.email, {
          data: {
            full_name: input.full_name,
            department_id: input.department_id,
            spmis_faculty_invitation: true,
            spmis_invited_by: actorId,
          },
        });
        return { userId: data.user?.id ?? null, error };
      },
    });
  },
}));
