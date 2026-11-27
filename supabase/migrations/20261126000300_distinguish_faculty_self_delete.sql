-- Preserve HTTP 409 / SQLSTATE 23503 and append-only attribution references.
-- Clients can distinguish this guard from a normal FK conflict using the hint.
create or replace function private.prevent_faculty_self_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id = auth.uid() then
    raise exception using
      errcode = '23503',
      message = 'Administrators cannot delete their own active profile.',
      hint = 'FACULTY_SELF_DELETE_FORBIDDEN';
  end if;
  return old;
end;
$$;
