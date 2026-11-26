create function private.validate_application_payload()
returns trigger language plpgsql set search_path = ''
as $$
declare
  payload jsonb := new.payload;
  id_key text;
  valid boolean;
  uuid_pattern constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
begin
  -- Faculty account provisioning has its own workflow.
  if new.type = 'faculty_account' then
    return new;
  end if;

  if jsonb_typeof(payload) = 'object' then
    case new.type
      when 'student_registration' then
        valid :=
          payload - array['student_id_number', 'first_name', 'last_name', 'middle_name', 'program_id'] = '{}'::jsonb
          and jsonb_typeof(payload->'student_id_number') = 'string'
          and char_length(payload->>'student_id_number') <= 50
          and payload->>'student_id_number' ~ '[^[:space:]]'
          and jsonb_typeof(payload->'first_name') = 'string'
          and char_length(payload->>'first_name') <= 200
          and payload->>'first_name' ~ '[^[:space:]]'
          and jsonb_typeof(payload->'last_name') = 'string'
          and char_length(payload->>'last_name') <= 200
          and payload->>'last_name' ~ '[^[:space:]]'
          and (not (payload ? 'middle_name') or jsonb_typeof(payload->'middle_name') in ('string', 'null'))
          and jsonb_typeof(payload->'program_id') = 'string'
          and payload->>'program_id' ~* uuid_pattern;
      when 'program_proposal', 'department_proposal' then
        id_key := case new.type when 'program_proposal' then 'program_id' else 'department_id' end;
        valid :=
          payload - array['name', id_key] = '{}'::jsonb
          and jsonb_typeof(payload->'name') = 'string'
          and char_length(payload->>'name') <= 200
          and payload->>'name' ~ '[^[:space:]]'
          and (not (payload ? id_key) or (
            jsonb_typeof(payload->id_key) = 'string' and payload->>id_key ~* uuid_pattern
          ));
      else
        valid := false;
    end case;
  end if;

  if valid is distinct from true then
    raise exception using errcode = '23514', message = 'Invalid application payload for submission type.';
  end if;
  return new;
end;
$$;

revoke all on function private.validate_application_payload() from public;

create trigger approval_queue_items_validate_payload
  before insert or update of type, payload on public.approval_queue_items
  for each row execute function private.validate_application_payload();
