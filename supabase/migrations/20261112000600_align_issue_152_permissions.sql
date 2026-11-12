create or replace function public.update_own_profile(full_name text)
returns setof public.faculty_profiles language plpgsql security definer set search_path = ''
as $$
begin
  if coalesce(private.actor_kind(), '') not in ('faculty', 'pending') then
    raise exception using errcode = '42501', message = 'Only faculty can update their own profile.';
  end if;
  return query update public.faculty_profiles f
    set full_name = update_own_profile.full_name
    where f.id = auth.uid() and f.role = 'faculty' and f.status in ('pending', 'active')
    returning f.*;
end;
$$;

grant delete on public.student_profiles to authenticated;
create policy student_profiles_admin_delete on public.student_profiles for delete to authenticated
  using ((select private.actor_kind()) = 'admin');

grant insert (id, email, full_name, department_id, role, status), delete
  on public.faculty_profiles to authenticated;
create policy faculty_profiles_admin_insert on public.faculty_profiles for insert to authenticated
  with check ((select private.actor_kind()) = 'admin');
create policy faculty_profiles_admin_delete on public.faculty_profiles for delete to authenticated
  using ((select private.actor_kind()) = 'admin');

grant update (type, payload, submitted_by, status, decided_by, decision_reason, decided_at), delete
  on public.approval_queue_items to authenticated;
create policy queue_admin_insert on public.approval_queue_items for insert to authenticated
  with check ((select private.actor_kind()) = 'admin');
create policy queue_admin_update on public.approval_queue_items for update to authenticated
  using ((select private.actor_kind()) = 'admin')
  with check ((select private.actor_kind()) = 'admin');
create policy queue_admin_delete on public.approval_queue_items for delete to authenticated
  using ((select private.actor_kind()) = 'admin');

alter policy queue_read on public.approval_queue_items
  using ((select private.actor_kind()) = 'admin' or (
    submitted_by = (select auth.uid()) and (select private.actor_kind()) = 'faculty'
  ));

drop function public.suggest_review_tags(text);
