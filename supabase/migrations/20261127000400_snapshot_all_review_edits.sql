-- The transactional RPC owns snapshots so tag-only edits are captured once.
drop trigger reviews_snapshot_edit on public.reviews;
drop function private.snapshot_review();

create or replace function public.update_review_transaction(
  p_actor_id uuid,
  p_review_id uuid,
  p_body_text text,
  p_body_document jsonb,
  p_deidentified_text text,
  p_tags text[],
  p_replace_tags boolean,
  p_embedding text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := private.require_service_actor(p_actor_id, 'faculty');
  current_review public.reviews%rowtype;
  normalized_tag text;
begin
  perform set_config('app.actor_id', p_actor_id::text, true);
  select * into current_review
  from public.reviews
  where id = p_review_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Review was not found.';
  end if;
  if current_review.owner_id <> caller then
    raise exception using errcode = '42501', message = 'The caller does not own this review.';
  end if;
  if current_review.status = 'deleted' then
    raise exception using errcode = '55000', message = 'Deleted reviews cannot be edited.';
  end if;

  -- Recheck status under the row lock: Edge processing may have started while hidden.
  if current_review.status = 'active' and p_embedding is null then
    raise exception using errcode = '55000',
      message = 'The review is active and requires a fresh embedding. Retry the edit.';
  end if;

  -- Capture one complete pre-edit version, including tag-only edits.
  insert into public.review_versions
    (review_id, body_text_snapshot, body_document_snapshot, tags_snapshot, edited_by)
  values (p_review_id, current_review.body_text, current_review.body_document,
    array(select tag from public.review_tags where review_id = p_review_id order by tag),
    caller);

  update public.reviews
  set body_text = p_body_text,
      body_document = p_body_document,
      deidentified_text = p_deidentified_text
  where id = p_review_id;

  if p_replace_tags then
    delete from public.review_tags where review_id = p_review_id;
    foreach normalized_tag in array coalesce(p_tags, '{}'::text[]) loop
      insert into public.tags (tag) values (normalized_tag) on conflict do nothing;
      insert into public.review_tags (review_id, tag) values (p_review_id, normalized_tag);
    end loop;
  end if;

  if current_review.status = 'active' then
    insert into public.review_embeddings (review_id, embedding)
    values (p_review_id, p_embedding::extensions.vector)
    on conflict (review_id) do update
      set embedding = excluded.embedding, generated_at = now();
  end if;

  insert into public.audit_log_entries
    (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (caller, 'faculty', 'review.updated', 'review', p_review_id,
    jsonb_build_object('status', current_review.status));

  return p_review_id;
end;
$$;
