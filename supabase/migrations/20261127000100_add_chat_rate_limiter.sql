create table private.chat_rate_limit_requests (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  requested_at timestamptz not null
);

create index chat_rate_limit_requests_actor_time_idx
  on private.chat_rate_limit_requests (actor_id, requested_at);
create index chat_rate_limit_requests_time_idx
  on private.chat_rate_limit_requests (requested_at);

revoke all on table private.chat_rate_limit_requests from public, anon, authenticated, service_role;

create function public.consume_chat_rate_limit(p_actor_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_time timestamptz;
  window_start timestamptz;
  request_count integer;
begin
  if p_actor_id is null or not exists (
    select 1
    from public.faculty_profiles
    where id = p_actor_id
      and status = 'active'
      and role in ('faculty', 'admin')
  ) then
    raise exception using errcode = '42501', message = 'The caller is not authorized for this operation.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_actor_id::text, 0)
  );

  request_time := pg_catalog.clock_timestamp();
  window_start := request_time - interval '1 minute';
  delete from private.chat_rate_limit_requests
  where requested_at <= window_start;

  select count(*)::integer into request_count
  from private.chat_rate_limit_requests
  where actor_id = p_actor_id and requested_at > window_start;

  if request_count >= 20 then
    return false;
  end if;

  insert into private.chat_rate_limit_requests (actor_id, requested_at)
  values (p_actor_id, request_time);
  return true;
end;
$$;

revoke all on function public.consume_chat_rate_limit(uuid) from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(uuid) to service_role;
