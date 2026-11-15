begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(31);

-- ===== 1. pending faculty (30...0003) =====
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';
select is(public.get_own_profile()->>'email', 'pending@example.test', 'pending reads own profile');
select is((select count(*) from public.faculty_profiles), 1::bigint, 'pending sees only own faculty_profiles row');
select is_empty('select id from public.student_profiles', 'pending sees 0 student_profiles');
select is_empty('select id from public.reviews', 'pending sees 0 reviews');
select is_empty($$select id from public.approval_queue_items where submitted_by <> auth.uid()$$,
  'pending sees 0 approval_queue_items of other users');

-- ===== 2. active faculty (30...0001) =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select lives_ok($$select public.update_own_profile('Example Active Name')$$,
  'active faculty can call update_own_profile');
select is(public.get_own_profile()->>'full_name', 'Example Active Name',
  'update_own_profile changed the name');

-- escalation attempts are silent no-ops (only the admin update policy exists)
select lives_ok($$update public.faculty_profiles set role = 'admin' where id = auth.uid()$$,
  'role escalation attempt raises no error');
select lives_ok($$update public.faculty_profiles set status = 'pending' where id = auth.uid()$$,
  'status change attempt raises no error');
select is(public.get_own_profile()->>'role', 'faculty', 'role is unchanged after the attempt');
select is(public.get_own_profile()->>'status', 'active', 'status is unchanged after the attempt');
select is((select count(*) from public.faculty_profiles), 1::bigint,
  'active faculty sees only own faculty_profiles row');

-- ===== 3. admin (30...0004) =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select ok((select count(*) from public.faculty_profiles) >= 4, 'admin can SELECT faculty_profiles');
select ok((select count(*) from public.student_profiles) >= 2, 'admin can SELECT student_profiles');
select ok((select count(*) from public.departments) >= 2, 'admin can SELECT departments');
select ok((select count(*) from public.programs) >= 2, 'admin can SELECT programs');
select ok((select count(*) from public.audit_log_entries) >= 0, 'admin can SELECT audit_log_entries');

select lives_ok($$update public.faculty_profiles set full_name = 'Example Renamed Faculty'
  where id = '30000000-0000-4000-8000-000000000002'$$, 'admin can UPDATE faculty_profiles');
select is((select full_name from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000002'),
  'Example Renamed Faculty', 'admin faculty_profiles update changed the row');

select lives_ok($$update public.student_profiles set first_name = 'Renamed'
  where student_id_number = 'TEST-002'$$, 'admin can UPDATE student_profiles');
select is((select first_name from public.student_profiles where student_id_number = 'TEST-002'),
  'Renamed', 'admin student_profiles update changed the row');

select lives_ok($$update public.departments set name = 'Example Computing Renamed'
  where id = '10000000-0000-4000-8000-000000000001'$$, 'admin can UPDATE departments');
select is((select name from public.departments where id = '10000000-0000-4000-8000-000000000001'),
  'Example Computing Renamed', 'admin departments update changed the row');

select lives_ok($$update public.programs set name = 'Example Computer Science Renamed'
  where id = '20000000-0000-4000-8000-000000000001'$$, 'admin can UPDATE programs');
select is((select name from public.programs where id = '20000000-0000-4000-8000-000000000001'),
  'Example Computer Science Renamed', 'admin programs update changed the row');

-- admin mutations were audited
select ok((select count(*) from public.audit_log_entries) >= 4, 'admin updates created audit entries');

-- audit log is append-only: no update grant, so it fails with 42501
select throws_ok($$update public.audit_log_entries set action = 'tampered'$$,
  '42501', null, 'admin cannot UPDATE audit_log_entries');

-- admin cannot mutate reviews
select throws_ok($$update public.reviews set status = 'hidden'$$,
  '42501', null, 'admin cannot UPDATE reviews');
select throws_ok($$delete from public.reviews$$,
  '42501', null, 'admin cannot DELETE reviews');

-- ===== 4. anon =====
reset role;
set local role anon;
set local request.jwt.claim.sub = '';
select throws_ok('select id from public.faculty_profiles', '42501', null, 'anon cannot read faculty_profiles');
select throws_ok('select id from public.student_profiles', '42501', null, 'anon cannot read student_profiles');

select * from finish();
rollback;