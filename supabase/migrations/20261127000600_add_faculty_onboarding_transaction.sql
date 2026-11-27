-- Called only by the onboarding Edge Function after verifying the caller JWT.
-- Auth creates identities through its supported API; this RPC never creates Auth users.
create function public.complete_faculty_onboarding(
  p_actor_id uuid,
  p_full_name text,
  p_department_id uuid
)
returns public.faculty_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_email text;
  profile public.faculty_profiles%rowtype;
begin
  -- Serialize repeat submissions for this Auth identity, including concurrent requests.
  select lower(btrim(u.email)) into account_email
  from auth.users u
  where u.id = p_actor_id and u.email_confirmed_at is not null
    and exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'google')
  for update of u;
  if not found then
    raise exception using errcode = '42501', message = 'A verified Google account is required for faculty onboarding.';
  end if;

  if exists (select 1 from public.faculty_profiles
    where id = p_actor_id or lower(email) = account_email) then
    raise exception using errcode = '23505', message = 'A faculty profile already exists for this account.';
  end if;
  if p_full_name is null or btrim(p_full_name) = '' or char_length(btrim(p_full_name)) > 200 then
    raise exception using errcode = '23514', message = 'A nonblank faculty name of at most 200 characters is required.';
  end if;
  perform 1 from public.departments
    where id = p_department_id and status = 'approved' for share;
  if not found then
    raise exception using errcode = '23514', message = 'The faculty department must be approved.';
  end if;

  perform set_config('app.actor_id', p_actor_id::text, true);
  insert into public.faculty_profiles (id, email, full_name, department_id, role, status)
  values (p_actor_id, account_email, btrim(p_full_name), p_department_id, 'faculty', 'pending')
  returning * into profile;

  insert into public.approval_queue_items (type, submitted_by, status, payload)
  values ('faculty_account', p_actor_id, 'pending', jsonb_build_object(
    'full_name', profile.full_name, 'email', profile.email, 'department_id', profile.department_id));

  return profile;
end;
$$;

revoke all on function public.complete_faculty_onboarding(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.complete_faculty_onboarding(uuid, text, uuid) to service_role;
