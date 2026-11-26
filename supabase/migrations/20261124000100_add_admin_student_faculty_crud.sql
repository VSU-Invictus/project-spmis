-- Contract v1.1.0: Admin direct CRUD hardening for student_profiles and faculty_profiles.
-- Note: student_profiles_admin_delete, faculty_profiles_admin_insert, and
-- faculty_profiles_admin_delete were initially created in 20261112000600_align_issue_152_permissions.sql.

-- 1. Prevent an admin from deleting their own currently signed-in profile with 409 Conflict (23503),
--    while faculty_profiles_admin_delete RLS policy continues to restrict DELETE to active admins.
create function private.prevent_faculty_self_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id = auth.uid() then
    raise exception using errcode = '23503', message = 'Administrators cannot delete their own active profile.';
  end if;
  return old;
end;
$$;

create trigger faculty_profiles_prevent_self_delete
  before delete on public.faculty_profiles
  for each row execute function private.prevent_faculty_self_delete();

-- 2. Drop static 'pending' default so the BEFORE INSERT trigger can default
--    admin-direct additions to 'active' while non-admin inserts still default to 'pending'.
alter table public.faculty_profiles alter column status drop default;

create function private.prepare_faculty_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_user_id uuid;
  caller_kind text;
begin
  new.email := lower(btrim(coalesce(new.email, '')));
  new.full_name := btrim(coalesce(new.full_name, ''));

  if new.email = '' or char_length(new.email) > 320
    or new.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '23514', message = 'A valid faculty email address is required.';
  end if;

  perform 1 from public.departments
    where id = new.department_id and status = 'approved' for share;
  if not found then
    raise exception using errcode = '23514', message = 'The faculty department must be approved.';
  end if;

  caller_kind := private.actor_kind();

  if new.status is null then
    new.status := case when caller_kind = 'admin' then 'active' else 'pending' end;
  end if;

  if new.id is null then
    if (auth.uid() is not null or current_setting('role', true) = 'authenticated')
      and caller_kind is distinct from 'admin' then
      raise exception using errcode = '42501', message = 'Only active administrators can provision faculty profiles.';
    end if;

    select u.id into auth_user_id
    from auth.users u
    where lower(u.email) = new.email
    limit 1;

    if auth_user_id is null then
      auth_user_id := gen_random_uuid();
      insert into auth.users (
        id,
        aud,
        role,
        email,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) values (
        auth_user_id,
        'authenticated',
        'authenticated',
        new.email,
        now(),
        '{"provider":"google","providers":["google"]}'::jsonb,
        jsonb_build_object('full_name', new.full_name),
        now(),
        now()
      );
    end if;

    new.id := auth_user_id;
  end if;

  return new;
end;
$$;

create trigger faculty_profiles_prepare_insert
  before insert on public.faculty_profiles
  for each row execute function private.prepare_faculty_profile_insert();

create function private.check_faculty_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    new.email := lower(btrim(coalesce(new.email, '')));
    if new.email = '' or char_length(new.email) > 320
      or new.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
      raise exception using errcode = '23514', message = 'A valid faculty email address is required.';
    end if;
  end if;

  if new.department_id is distinct from old.department_id then
    perform 1 from public.departments
      where id = new.department_id and status = 'approved' for share;
    if not found then
      raise exception using errcode = '23514', message = 'The faculty department must be approved.';
    end if;
  end if;

  return new;
end;
$$;

create trigger faculty_profiles_check_update
  before update of email, department_id on public.faculty_profiles
  for each row execute function private.check_faculty_profile_update();

revoke all on function private.prevent_faculty_self_delete() from public;
revoke all on function private.prepare_faculty_profile_insert() from public;
revoke all on function private.check_faculty_profile_update() from public;
