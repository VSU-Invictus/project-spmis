create function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create trigger departments_set_updated_at before update on public.departments
  for each row execute function private.set_updated_at();
create trigger programs_set_updated_at before update on public.programs
  for each row execute function private.set_updated_at();
create trigger faculty_profiles_set_updated_at before update on public.faculty_profiles
  for each row execute function private.set_updated_at();
create trigger student_profiles_set_updated_at before update on public.student_profiles
  for each row execute function private.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews
  for each row execute function private.set_updated_at();

create function private.check_student_program()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.program_id = old.program_id then return new; end if;
  end if;
  perform 1 from public.programs
    where id = new.program_id and status = 'approved' for share;
  if not found then
    raise exception using errcode = '23514', message = 'The student program must be approved.';
  end if;
  return new;
end;
$$;

create trigger student_profiles_check_program
  before insert or update of program_id on public.student_profiles
  for each row execute function private.check_student_program();

create function private.reject_audit_mutation()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception using errcode = '42501', message = 'Audit entries are append-only.';
end;
$$;

create trigger audit_log_append_only
  before update or delete or truncate on public.audit_log_entries
  for each statement execute function private.reject_audit_mutation();

create function private.audit_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  caller_id uuid;
  caller_role text;
  affected_id uuid;
begin
  select id, role into caller_id, caller_role
    from public.faculty_profiles where id = auth.uid();

  if tg_op = 'DELETE' then affected_id := old.id;
  else affected_id := new.id;
  end if;

  insert into public.audit_log_entries (actor_id, actor_role, action, entity_type, entity_id)
    values (caller_id, coalesce(caller_role, 'system'),
      tg_argv[0] || '.' || case tg_op
        when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
      tg_argv[0], affected_id);
  return null;
end;
$$;

create trigger departments_audit after insert or update or delete on public.departments
  for each row execute function private.audit_change('department');
create trigger programs_audit after insert or update or delete on public.programs
  for each row execute function private.audit_change('program');
create trigger student_profiles_audit after insert or update or delete on public.student_profiles
  for each row execute function private.audit_change('student');
create trigger faculty_profiles_audit after insert or update or delete on public.faculty_profiles
  for each row execute function private.audit_change('faculty_profile');
create trigger approval_queue_items_audit after insert or update or delete on public.approval_queue_items
  for each row execute function private.audit_change('application');

create function private.snapshot_review()
returns trigger language plpgsql set search_path = ''
as $$
begin
  insert into public.review_versions
    (review_id, body_text_snapshot, body_document_snapshot, tags_snapshot, edited_by)
  values
    (old.id, old.body_text, old.body_document,
     array(select tag from public.review_tags where review_id = old.id order by tag),
     coalesce(auth.uid(), old.owner_id));
  return new;
end;
$$;

create trigger reviews_snapshot_edit
  before update of body_text, body_document on public.reviews
  for each row when (old.body_text is distinct from new.body_text
    or old.body_document is distinct from new.body_document)
  execute function private.snapshot_review();

create function private.remove_inactive_embedding()
returns trigger language plpgsql set search_path = ''
as $$
begin
  delete from public.review_embeddings where review_id = new.id;
  return new;
end;
$$;

create trigger reviews_remove_inactive_embedding
  after update of status on public.reviews
  for each row when (old.status is distinct from new.status and new.status in ('hidden', 'deleted'))
  execute function private.remove_inactive_embedding();

create view public.review_revisions with (security_invoker = true) as
select id, review_id, body_text_snapshot, body_document_snapshot, tags_snapshot, edited_by, edited_at
from public.review_versions;
revoke all on public.review_revisions from public, anon, authenticated;
grant select on public.review_revisions to authenticated;
