-- UUID identity is case-insensitive; reject duplicates before any decision side effects.
create or replace function public.decide_applications_transaction(
  p_actor_id uuid,
  p_request jsonb
)
returns setof public.approval_queue_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := private.require_service_actor(p_actor_id, 'admin');
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
  perform set_config('app.actor_id', p_actor_id::text, true);
  if decision not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'The application decision is invalid.';
  end if;
  if coalesce(jsonb_typeof(p_request->'application_ids'), '') <> 'array'
    or jsonb_array_length(p_request->'application_ids') < 1
    or jsonb_array_length(p_request->'application_ids') > 100 then
    raise exception using errcode = '22023', message = 'application_ids must contain 1 to 100 items.';
  end if;
  if (select count(*) from jsonb_array_elements_text(p_request->'application_ids'))
    <> (select count(distinct value::uuid) from jsonb_array_elements_text(p_request->'application_ids')) then
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
      <> (select count(distinct (entry->>'application_id')::uuid)
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
          where selected.value::uuid = (assignment->>'application_id')::uuid
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
