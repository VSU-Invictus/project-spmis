-- Expose author attribution only for a review the caller can read.
create function private.review_author(p_review_id uuid)
returns table (author_name text, author_department_name text)
language sql stable security definer set search_path = ''
as $$
  select f.full_name, d.name
  from public.reviews r
  join public.faculty_profiles f on f.id = r.owner_id
  join public.departments d on d.id = f.department_id
  where r.id = p_review_id and private.actor_kind() = 'faculty'
    and (r.status = 'active' or (r.status = 'hidden' and r.owner_id = auth.uid()))
$$;
revoke all on function private.review_author(uuid) from public;
grant execute on function private.review_author(uuid) to authenticated;

create view public.review_details with (security_invoker = true) as
select r.id, r.student_id, r.owner_id, r.body_text, r.body_document, r.status,
       r.created_at, r.updated_at, a.author_name, a.author_department_name,
       array(select rt.tag from public.review_tags rt where rt.review_id = r.id order by rt.tag) as tags,
       coalesce((
         select jsonb_agg(jsonb_build_object(
           'id', ra.id, 'review_id', ra.review_id, 'mime_type', ra.mime_type,
           'size_bytes', ra.size_bytes, 'created_at', ra.created_at
         ) order by ra.created_at, ra.id)
         from public.review_attachments ra where ra.review_id = r.id
       ), '[]'::jsonb) as attachments
from public.reviews r cross join lateral private.review_author(r.id) a;

revoke all on public.review_details from public, anon, authenticated;
grant select on public.review_details to authenticated;

create function public.get_student_by_id(p_student_id uuid)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select to_jsonb(s) from public.student_profiles s where s.id = p_student_id
$$;

create function public.get_own_profile()
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select to_jsonb(f) from public.faculty_profiles f where f.id = auth.uid()
$$;

create function public.update_own_profile(full_name text)
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

create function public.suggest_review_tags(prefix text default '')
returns table (tag text) language sql stable security invoker set search_path = ''
as $$
  select t.tag from public.tags t
  where private.actor_kind() = 'faculty'
    and starts_with(t.tag, lower(prefix))
$$;

-- The helper returns only matching student IDs and active tags. Admin callers
-- can search active review text without receiving the underlying review rows.
create function private.search_active_review_matches(
  p_query text, p_owner_id uuid, p_owner_department_id uuid, p_tag text
)
returns table (student_id uuid, tags text[], text_matches boolean)
language sql stable security definer set search_path = ''
as $$
  select r.student_id,
    array_agg(distinct rt.tag order by rt.tag) filter (where rt.tag is not null),
    bool_or(p_query is null or strpos(lower(r.body_text), lower(p_query)) > 0)
  from public.reviews r
  join public.faculty_profiles f on f.id = r.owner_id
  left join public.review_tags rt on rt.review_id = r.id
  where private.actor_kind() in ('faculty', 'admin') and r.status = 'active'
    and (p_owner_id is null or r.owner_id = p_owner_id)
    and (p_owner_department_id is null or f.department_id = p_owner_department_id)
    and (p_tag is null or exists (
      select 1 from public.review_tags wanted
      where wanted.review_id = r.id and wanted.tag = lower(p_tag)
    ))
  group by r.student_id
$$;
revoke all on function private.search_active_review_matches(text, uuid, uuid, text) from public;
grant execute on function private.search_active_review_matches(text, uuid, uuid, text) to authenticated;

create type public.student_search_result as (
  id uuid, student_id_number text, first_name text, last_name text, middle_name text,
  program_id uuid, registration_source text, created_at timestamptz, updated_at timestamptz,
  program_name text, visible_review_tags text[]
);

create function public.search_students(
  query text default null, program_id uuid default null, owner_id uuid default null,
  owner_department_id uuid default null, tag text default null
)
returns setof public.student_search_result
language sql stable security invoker set search_path = ''
as $$
  select s.id, s.student_id_number, s.first_name, s.last_name, s.middle_name,
         s.program_id, s.registration_source, s.created_at, s.updated_at,
         p.name, coalesce(matches.tags, '{}'::text[])
  from public.student_profiles s
  join public.programs p on p.id = s.program_id
  left join private.search_active_review_matches($1, $3, $4, $5) matches on matches.student_id = s.id
  where ($2 is null or s.program_id = $2)
    and (($3 is null and $4 is null and $5 is null) or matches.student_id is not null)
    and ($1 is null
      or strpos(lower(concat_ws(' ', s.first_name, s.middle_name, s.last_name)), lower($1)) > 0
      or strpos(lower(s.student_id_number), lower($1)) > 0
      or matches.text_matches)
$$;

revoke all on function public.get_student_by_id(uuid) from public, anon, authenticated;
grant execute on function public.get_student_by_id(uuid) to authenticated;
revoke all on function public.get_own_profile() from public, anon, authenticated;
grant execute on function public.get_own_profile() to authenticated;
revoke all on function public.update_own_profile(text) from public, anon, authenticated;
grant execute on function public.update_own_profile(text) to authenticated;
revoke all on function public.suggest_review_tags(text) from public, anon, authenticated;
grant execute on function public.suggest_review_tags(text) to authenticated;
revoke all on function public.search_students(text, uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.search_students(text, uuid, uuid, uuid, text) to authenticated;
