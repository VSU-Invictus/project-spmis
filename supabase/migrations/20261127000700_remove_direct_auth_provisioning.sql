-- Auth identities must be provisioned through Supabase Auth APIs, never table inserts.
create or replace function private.prepare_faculty_profile_insert()
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
      raise exception using errcode = '23514',
        message = 'Invite the faculty member through the invitation endpoint before linking a profile.';
    end if;

    new.id := auth_user_id;
  end if;

  return new;
end;
$$;
