-- Expose only the approved department choices needed before a profile exists.
create function public.get_faculty_onboarding_departments(p_actor_id uuid)
returns table (id uuid, name text)
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from auth.users u
    where u.id = p_actor_id and u.email_confirmed_at is not null
      and exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'google')
  ) then
    raise exception using errcode = '42501', message = 'A verified Google account is required for faculty onboarding.';
  end if;
  return query select d.id, d.name from public.departments d
    where d.status = 'approved' order by d.name, d.id;
end;
$$;
revoke all on function public.get_faculty_onboarding_departments(uuid) from public, anon, authenticated;
grant execute on function public.get_faculty_onboarding_departments(uuid) to service_role;
