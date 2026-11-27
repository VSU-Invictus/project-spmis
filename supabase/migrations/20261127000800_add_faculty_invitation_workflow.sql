-- Preflight for the admin-only invitation endpoint. Never expose Auth tables to clients.
create function public.validate_faculty_invitation(p_actor_id uuid, p_email text, p_department_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_service_actor(p_actor_id, 'admin');
  if p_email is null or char_length(btrim(p_email)) > 320
    or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '23514', message = 'A valid faculty email address is required.';
  end if;
  if exists (select 1 from auth.users where lower(email) = lower(btrim(p_email)))
    or exists (select 1 from public.faculty_profiles where lower(email) = lower(btrim(p_email))) then
    raise exception using errcode = '23505', message = 'An account already exists for this email address.';
  end if;
  perform 1 from public.departments where id = p_department_id and status = 'approved' for share;
  if not found then
    raise exception using errcode = '23514', message = 'The faculty department must be approved.';
  end if;
end;
$$;
revoke all on function public.validate_faculty_invitation(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.validate_faculty_invitation(uuid, text, uuid) to service_role;

-- Auth may set invited_at on insertion or a subsequent update within its transaction.
-- Neither an email signup nor user-editable metadata alone can activate this path.
create function private.create_invited_faculty()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  inviter uuid;
  target_department uuid;
  profile public.faculty_profiles%rowtype;
  previous_actor text := current_setting('app.actor_id', true);
begin
  if new.invited_at is null
    or new.raw_user_meta_data->'spmis_faculty_invitation' is distinct from 'true'::jsonb then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.invited_at is not null then return new; end if;
  end if;
  inviter := (new.raw_user_meta_data->>'spmis_invited_by')::uuid;
  perform private.require_service_actor(inviter, 'admin');
  target_department := (new.raw_user_meta_data->>'department_id')::uuid;
  perform set_config('app.actor_id', inviter::text, true);

  insert into public.faculty_profiles (id, email, full_name, department_id, role, status)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', target_department, 'faculty', 'pending')
  returning * into profile;
  insert into public.approval_queue_items (type, submitted_by, status, payload)
  values ('faculty_account', new.id, 'pending', jsonb_build_object(
    'full_name', profile.full_name, 'email', profile.email, 'department_id', profile.department_id));

  perform set_config('app.actor_id', coalesce(previous_actor, ''), true);
  return new;
end;
$$;
revoke all on function private.create_invited_faculty() from public, anon, authenticated;
create trigger auth_user_invited_faculty
  after insert or update of invited_at on auth.users
  for each row execute function private.create_invited_faculty();
