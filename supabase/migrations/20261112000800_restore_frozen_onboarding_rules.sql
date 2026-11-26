create or replace function public.update_own_profile(full_name text)
returns setof public.faculty_profiles language plpgsql security definer set search_path = ''
as $$
begin
  if private.actor_kind() is distinct from 'faculty' then
    raise exception using errcode = '42501', message = 'Only active faculty can update their profile.';
  end if;
  return query update public.faculty_profiles f
    set full_name = update_own_profile.full_name
    where f.id = auth.uid() and f.role = 'faculty' and f.status = 'active'
    returning f.*;
end;
$$;

-- Pending faculty can read their own faculty-account application history.
alter policy queue_read on public.approval_queue_items
  using ((select private.actor_kind()) = 'admin' or (
    submitted_by = (select auth.uid()) and (
      (select private.actor_kind()) = 'faculty' or
      ((select private.actor_kind()) = 'pending' and type = 'faculty_account')
    )
  ));
