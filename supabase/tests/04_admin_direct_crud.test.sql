begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(34);

-- Seed a pending department and an unlinked auth.users row as superuser.
insert into public.departments (id, name, status)
values ('10000000-0000-4000-8000-000000000099', 'Example Pending Department', 'pending');

insert into auth.users (id, aud, role, email, email_confirmed_at)
values ('30000000-0000-4000-8000-000000000099', 'authenticated', 'authenticated', 'existing.auth@example.test', now());

-- ===== 1. Admin direct faculty create/delete & student delete (30...0004) =====
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select lives_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('  New.Faculty@example.test  ', 'Example Direct Faculty', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  'admin can directly create a faculty profile without supplying id or status'
);

select is(
  (select email || ':' || status from public.faculty_profiles where email = 'new.faculty@example.test'),
  'new.faculty@example.test:active',
  'admin-created faculty email is normalized and status defaults to active'
);

reset role;
select ok(
  exists (
    select 1 from public.faculty_profiles f
    join auth.users u on u.id = f.id
    where f.email = 'new.faculty@example.test' and lower(u.email) = 'new.faculty@example.test'
  ),
  'admin-created faculty profile links to a provisioned auth.users row'
);
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select ok(
  exists (
    select 1 from public.audit_log_entries a
    join public.faculty_profiles f on f.id = a.entity_id
    where f.email = 'new.faculty@example.test'
      and a.action = 'faculty_profile.created'
      and a.actor_role = 'admin'
  ),
  'admin faculty creation writes a faculty_profile.created audit entry'
);

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('NEW.FACULTY@example.test', 'Duplicate Faculty', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  '23505', null, 'duplicate faculty email fails with unique violation (409)'
);

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('not-an-email', 'Invalid Email Faculty', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  '23514', 'A valid faculty email address is required.', 'invalid faculty email fails with check violation'
);

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('pending.dept@example.test', 'Pending Dept Faculty', '10000000-0000-4000-8000-000000000099', 'faculty')$$,
  '23514', 'The faculty department must be approved.', 'creating faculty in a pending department is rejected'
);

select throws_ok(
  $$update public.faculty_profiles set department_id = '10000000-0000-4000-8000-000000000099'
    where email = 'new.faculty@example.test'$$,
  '23514', 'The faculty department must be approved.', 'updating faculty to a pending department is rejected'
);

select throws_ok(
  $$update public.faculty_profiles set email = 'invalid-email'
    where email = 'new.faculty@example.test'$$,
  '23514', 'A valid faculty email address is required.', 'updating faculty to an invalid email is rejected'
);

select lives_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role, status)
    values ('explicit.pending@example.test', 'Explicit Pending Faculty', '10000000-0000-4000-8000-000000000001', 'faculty', 'pending')$$,
  'admin insert respects explicit pending status when supplied'
);

select is(
  (select status from public.faculty_profiles where email = 'explicit.pending@example.test'),
  'pending',
  'explicit pending status was persisted'
);

select lives_ok(
  $$delete from public.faculty_profiles where email = 'new.faculty@example.test'$$,
  'admin can delete an unreferenced faculty profile'
);

select is_empty(
  $$select id from public.faculty_profiles where email = 'new.faculty@example.test'$$,
  'deleted faculty profile is removed'
);

select ok(
  exists (
    select 1 from public.audit_log_entries
    where action = 'faculty_profile.deleted' and actor_role = 'admin'
  ),
  'admin faculty deletion writes a faculty_profile.deleted audit entry'
);

select throws_ok(
  $$delete from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000001'$$,
  '23503', null, 'deleting a faculty member with authored reviews is blocked by FK (409)'
);

select lives_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('Existing.Auth@example.test', 'Example Linked Auth Faculty', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  'admin can create a faculty profile matching a pre-existing auth.users email'
);

select is(
  (select id from public.faculty_profiles where email = 'existing.auth@example.test'),
  '30000000-0000-4000-8000-000000000099'::uuid,
  'faculty profile links to the existing auth.users row instead of creating a new one'
);

select throws_ok(
  $$delete from public.faculty_profiles where id = auth.uid()$$,
  '23503', 'Administrators cannot delete their own active profile.',
  'admin self-deletion attempt raises 23503 conflict'
);

select is(
  (select count(*) from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000004'),
  1::bigint,
  'admin cannot delete their own active profile'
);

select throws_ok(
  $$delete from public.student_profiles where student_id_number = 'TEST-001'$$,
  '23503', null, 'deleting a student with existing reviews is blocked by FK (409)'
);

select lives_ok(
  $$delete from public.student_profiles where student_id_number = 'TEST-002'$$,
  'admin can delete an unreferenced student'
);

select is_empty(
  $$select id from public.student_profiles where student_id_number = 'TEST-002'$$,
  'deleted student is removed'
);

select ok(
  exists (
    select 1 from public.audit_log_entries
    where action = 'student.deleted' and actor_role = 'admin'
  ),
  'admin student deletion writes a student.deleted audit entry'
);

-- ===== 2. Active faculty cannot create/delete faculty or delete students =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('unauth.faculty@example.test', 'Unauthorized Faculty', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  '42501', null, 'active faculty cannot directly insert into faculty_profiles'
);

select lives_ok(
  $$delete from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000002'$$,
  'active faculty delete on faculty_profiles is filtered by RLS'
);

select lives_ok(
  $$delete from public.student_profiles where student_id_number = 'TEST-001'$$,
  'active faculty delete on student_profiles is filtered by RLS'
);

-- ===== 3. Pending faculty cannot create or delete faculty or delete students =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('pending.attempt@example.test', 'Pending Attempt', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  '42501', null, 'pending faculty cannot directly insert into faculty_profiles'
);

select lives_ok(
  $$delete from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000002'$$,
  'pending faculty delete on faculty_profiles is filtered by RLS'
);

select lives_ok(
  $$delete from public.student_profiles where student_id_number = 'TEST-001'$$,
  'pending faculty delete on student_profiles is filtered by RLS'
);

-- ===== 4. Confirm non-admin deletes left rows untouched =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select is(
  (select count(*) from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000002'),
  1::bigint,
  'seeded faculty profile remains intact after non-admin delete attempt'
);

select is(
  (select count(*) from public.student_profiles where student_id_number = 'TEST-001'),
  1::bigint,
  'seeded student profile remains intact after non-admin delete attempt'
);

-- ===== 5. Anon cannot insert faculty or delete students =====
reset role;
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$insert into public.faculty_profiles (email, full_name, department_id, role)
    values ('anon.attempt@example.test', 'Anon Attempt', '10000000-0000-4000-8000-000000000001', 'faculty')$$,
  '42501', null, 'anon cannot insert into faculty_profiles'
);

select throws_ok(
  $$delete from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000002'$$,
  '42501', null, 'anon cannot delete from faculty_profiles'
);

select throws_ok(
  $$delete from public.student_profiles where student_id_number = 'TEST-001'$$,
  '42501', null, 'anon cannot delete from student_profiles'
);

select * from finish();
rollback;
