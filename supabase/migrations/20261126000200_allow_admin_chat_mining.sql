-- PM decision in PR #203: active admins may mine active reviews through chat,
-- but only the Edge Function's service-role client may retrieve review context.
create or replace function public.match_review_embeddings(
  p_actor_id uuid,
  p_embedding text,
  p_limit integer default 8
)
returns table (review_id uuid, deidentified_text text, distance real)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.faculty_profiles
    where id = p_actor_id and status = 'active' and role in ('faculty', 'admin')
  ) then
    raise exception using errcode = '42501', message = 'The caller is not authorized for this operation.';
  end if;

  return query
    select r.id, r.deidentified_text,
      (e.embedding operator(extensions.<=>) p_embedding::extensions.vector)::real
    from public.review_embeddings e
    join public.reviews r on r.id = e.review_id
    where r.status = 'active'
    order by e.embedding operator(extensions.<=>) p_embedding::extensions.vector
    limit greatest(1, least(coalesce(p_limit, 8), 20));
end;
$$;

revoke all on function public.match_review_embeddings(uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.match_review_embeddings(uuid, text, integer)
  to service_role;
