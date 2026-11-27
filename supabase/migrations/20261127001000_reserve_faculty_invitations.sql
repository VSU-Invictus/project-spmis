-- Serialize invitation requests across Edge workers while Auth performs its transaction.
create table private.faculty_invitation_reservations (
  email text primary key,
  token uuid not null,
  expires_at timestamptz not null
);
alter table private.faculty_invitation_reservations enable row level security;
revoke all on private.faculty_invitation_reservations from public, anon, authenticated, service_role;

create function public.reserve_faculty_invitation(p_actor_id uuid, p_email text, p_department_id uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  reservation uuid := gen_random_uuid();
begin
  perform public.validate_faculty_invitation(p_actor_id, p_email, p_department_id);
  insert into private.faculty_invitation_reservations as current (email, token, expires_at)
  values (lower(btrim(p_email)), reservation, now() + interval '5 minutes')
  on conflict (email) do update set token = excluded.token, expires_at = excluded.expires_at
    where current.expires_at <= now();
  if not found then
    raise exception using errcode = '23505', message = 'An invitation is already in progress for this email address.';
  end if;
  return reservation;
end;
$$;

create function public.finish_faculty_invitation(p_email text, p_token uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  delete from private.faculty_invitation_reservations
    where email = lower(btrim(p_email)) and token = p_token;
  return found;
end;
$$;
revoke all on function public.reserve_faculty_invitation(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.finish_faculty_invitation(text, uuid) from public, anon, authenticated;
grant execute on function public.reserve_faculty_invitation(uuid, text, uuid) to service_role;
grant execute on function public.finish_faculty_invitation(text, uuid) to service_role;
