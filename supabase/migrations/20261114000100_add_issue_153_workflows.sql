create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.faculty_profiles (id),
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select, update (read_at) on public.notifications to authenticated;
create policy notifications_owner_read on public.notifications
  for select to authenticated using (recipient_id = auth.uid());
create policy notifications_owner_ack on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create function private.require_actor(expected_role text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null or private.actor_kind() is distinct from expected_role then
    raise exception using errcode = '42501', message = 'The caller is not authorized for this operation.';
  end if;
  return caller;
end;
$$;

revoke all on function private.require_actor(text) from public;
grant execute on function private.require_actor(text) to authenticated;

create function public.create_review_transaction(
  p_student_id uuid,
  p_body_text text,
  p_body_document jsonb,
  p_deidentified_text text,
  p_tags text[],
  p_embedding text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := private.require_actor('faculty');
  review_id uuid;
  normalized_tag text;
begin
  if not exists (select 1 from public.student_profiles where id = p_student_id) then
    raise exception using errcode = 'P0002', message = 'Student was not found.';
  end if;

  insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values (p_student_id, caller, p_body_text, p_body_document, p_deidentified_text)
  returning id into review_id;

  foreach normalized_tag in array coalesce(p_tags, '{}'::text[]) loop
    insert into public.tags (tag) values (normalized_tag) on conflict do nothing;
    insert into public.review_tags (review_id, tag) values (review_id, normalized_tag);
  end loop;

  insert into public.review_embeddings (review_id, embedding)
  values (review_id, p_embedding::extensions.vector);

  insert into public.audit_log_entries
    (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (caller, 'faculty', 'review.created', 'review', review_id,
    jsonb_build_object('status', 'active'));

  return review_id;
end;
$$;

create function public.update_review_transaction(
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
  caller uuid := private.require_actor('faculty');
  current_review public.reviews%rowtype;
  normalized_tag text;
begin
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

create function public.set_review_status_transaction(
  p_review_id uuid,
  p_action text,
  p_embedding text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := private.require_actor('faculty');
  current_review public.reviews%rowtype;
  current_status text;
  next_status text;
begin
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
  current_status := current_review.status;

  next_status := case
    when p_action = 'hide' and current_status = 'active' then 'hidden'
    when p_action = 'unhide' and current_status = 'hidden' then 'active'
    when p_action = 'delete' and current_status in ('active', 'hidden') then 'deleted'
    else null
  end;
  if next_status is null then
    raise exception using errcode = '55000', message = 'The requested review status transition is invalid.';
  end if;

  update public.reviews set status = next_status where id = p_review_id;
  if next_status = 'active' then
    insert into public.review_embeddings (review_id, embedding)
    select p_review_id, p_embedding::extensions.vector
    where p_embedding is not null
    on conflict (review_id) do update
      set embedding = excluded.embedding, generated_at = now();
  else
    delete from public.review_embeddings where review_id = p_review_id;
  end if;

  insert into public.audit_log_entries
    (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (caller, 'faculty', 'review.' || next_status, 'review', p_review_id,
    jsonb_build_object('from_status', current_status, 'to_status', next_status));

  return next_status;
end;
$$;

create function public.match_review_embeddings(
  p_embedding text,
  p_limit integer default 8
)
returns table (review_id uuid, deidentified_text text, distance real)
language sql
security definer
set search_path = ''
as $$
  select r.id, r.deidentified_text,
    (e.embedding <=> p_embedding::extensions.vector)::real
  from public.review_embeddings e
  join public.reviews r on r.id = e.review_id
  where r.status = 'active'
    and private.actor_kind() in ('faculty', 'admin')
  order by e.embedding <=> p_embedding::extensions.vector
  limit greatest(1, least(coalesce(p_limit, 8), 20));
$$;

create function public.decide_applications_transaction(p_request jsonb)
returns setof public.approval_queue_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := private.require_actor('admin');
  item public.approval_queue_items%rowtype;
  application_id uuid;
  decision text := p_request->>'decision';
  reason text := nullif(btrim(p_request->>'reason'), '');
  payload jsonb;
  target_department_id uuid;
  program_id uuid;
  department_id uuid;
  assignment jsonb;
begin
  if decision not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'The application decision is invalid.';
  end if;
  if coalesce(jsonb_typeof(p_request->'application_ids'), '') <> 'array'
    or jsonb_array_length(p_request->'application_ids') < 1
    or jsonb_array_length(p_request->'application_ids') > 100 then
    raise exception using errcode = '22023', message = 'application_ids must contain 1 to 100 items.';
  end if;
  if (select count(*) from jsonb_array_elements_text(p_request->'application_ids'))
    <> (select count(distinct value) from jsonb_array_elements_text(p_request->'application_ids')) then
    raise exception using errcode = '22023', message = 'application_ids must not contain duplicates.';
  end if;
  if decision = 'reject' and reason is null then
    raise exception using errcode = '22023', message = 'A rejection reason is required.';
  end if;
  if p_request ? 'department_assignments' then
    if decision = 'reject' or jsonb_typeof(p_request->'department_assignments') <> 'array' then
      raise exception using errcode = '22023', message = 'department_assignments are only valid for approvals.';
    end if;
    if (select count(*) from jsonb_array_elements(p_request->'department_assignments'))
      <> (select count(distinct entry->>'application_id')
          from jsonb_array_elements(p_request->'department_assignments') entry) then
      raise exception using errcode = '22023', message = 'department_assignments must not contain duplicates.';
    end if;
    for assignment in select value from jsonb_array_elements(p_request->'department_assignments')
    loop
      if jsonb_typeof(assignment) <> 'object'
        or nullif(assignment->>'application_id', '') is null
        or nullif(assignment->>'department_id', '') is null
        or not exists (
          select 1
          from jsonb_array_elements_text(p_request->'application_ids') selected
          where selected.value = assignment->>'application_id'
        ) then
        raise exception using errcode = '22023', message = 'Each department assignment must target a selected application.';
      end if;
    end loop;
  end if;

  for application_id in
    select value::uuid from jsonb_array_elements_text(p_request->'application_ids')
  loop
    select * into item from public.approval_queue_items
    where id = application_id for update;
    if not found then
      raise exception using errcode = 'P0002', message = 'An application was not found.';
    end if;
    if item.status <> 'pending' then
      raise exception using errcode = '55000', message = 'An application has already been decided.';
    end if;
  end loop;

  for application_id in
    select value::uuid from jsonb_array_elements_text(p_request->'application_ids')
  loop
    select * into item from public.approval_queue_items
    where id = application_id for update;
    payload := item.payload;

    if decision = 'approve' then
      case item.type
        when 'student_registration' then
          insert into public.student_profiles
            (student_id_number, first_name, last_name, middle_name, program_id, registration_source)
          values (payload->>'student_id_number', payload->>'first_name',
            payload->>'last_name', payload->>'middle_name', (payload->>'program_id')::uuid,
            'faculty_applied');
        when 'program_proposal' then
          program_id := nullif(payload->>'program_id', '')::uuid;
          if program_id is null then
            insert into public.programs (name, status, proposed_by)
            values (payload->>'name', 'approved', item.submitted_by);
          else
            update public.programs set name = payload->>'name', status = 'approved'
            where id = program_id;
          end if;
        when 'department_proposal' then
          department_id := nullif(payload->>'department_id', '')::uuid;
          if department_id is null then
            insert into public.departments (name, status, proposed_by)
            values (payload->>'name', 'approved', item.submitted_by);
          else
            update public.departments set name = payload->>'name', status = 'approved'
            where id = department_id;
          end if;
        when 'faculty_account' then
          target_department_id := nullif(payload->>'department_id', '')::uuid;
          if p_request ? 'department_assignments' then
            select (entry->>'department_id')::uuid into department_id
            from jsonb_array_elements(p_request->'department_assignments') entry
            where (entry->>'application_id')::uuid = item.id;
            if found then
              target_department_id := department_id;
              if not exists (
                select 1 from public.departments
                where id = target_department_id and status = 'approved'
              ) then
                raise exception using errcode = '22023', message = 'The assigned department is invalid.';
              end if;
            end if;
          end if;
          if target_department_id is null and nullif(btrim(payload->>'proposed_department_name'), '') is not null then
            insert into public.departments (name, status, proposed_by)
            values (payload->>'proposed_department_name', 'approved', item.submitted_by)
            returning id into target_department_id;
          end if;
          if target_department_id is null then
            raise exception using errcode = '22023', message = 'A faculty account requires a department.';
          end if;
          update public.faculty_profiles
          set full_name = payload->>'full_name',
              email = payload->>'email',
              department_id = target_department_id,
              status = 'active'
          where id = item.submitted_by;
      end case;
    end if;

    update public.approval_queue_items
    set status = case when decision = 'approve' then 'approved' else 'rejected' end,
        decided_by = caller,
        decided_at = now(),
        decision_reason = case when decision = 'reject' then reason else null end
    where id = item.id;

    insert into public.audit_log_entries
      (actor_id, actor_role, action, entity_type, entity_id, metadata)
    values (caller, 'admin', 'application.' || decision, 'application', item.id,
      jsonb_build_object('type', item.type));

    if item.submitted_by is not null then
      insert into public.notifications
        (recipient_id, type, title, body, payload)
      values (item.submitted_by, 'application_decision',
        case when decision = 'approve' then 'Application approved' else 'Application rejected' end,
        case when decision = 'approve' then 'Your application was approved.'
             else 'Your application was rejected: ' || reason end,
        jsonb_build_object('application_id', item.id, 'status', decision));
    end if;
  end loop;

  return query
    select * from public.approval_queue_items
    where id in (select value::uuid from jsonb_array_elements_text(p_request->'application_ids'));
end;
$$;

revoke all on function public.create_review_transaction(uuid, text, jsonb, text, text[], text)
  from public, anon, authenticated;
revoke all on function public.update_review_transaction(uuid, text, jsonb, text, text[], boolean, text)
  from public, anon, authenticated;
revoke all on function public.set_review_status_transaction(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.match_review_embeddings(text, integer)
  from public, anon, authenticated;
revoke all on function public.decide_applications_transaction(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_review_transaction(uuid, text, jsonb, text, text[], text)
  to authenticated;
grant execute on function public.update_review_transaction(uuid, text, jsonb, text, text[], boolean, text)
  to authenticated;
grant execute on function public.set_review_status_transaction(uuid, text, text)
  to authenticated;
grant execute on function public.match_review_embeddings(text, integer)
  to authenticated;
grant execute on function public.decide_applications_transaction(jsonb)
  to authenticated;
