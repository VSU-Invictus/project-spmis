begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

-- ===== 1. departments.name =====
select throws_ok($$insert into public.departments (name) values ('')$$,
  '23514', null, 'blank department name rejected');
select throws_ok($$insert into public.departments (name) values ('   ')$$,
  '23514', null, 'whitespace-only department name rejected');
select throws_ok($$insert into public.departments (name) values (repeat('x', 201))$$,
  '23514', null, '201-char department name rejected');
select lives_ok($$insert into public.departments (name) values (repeat('x', 200))$$,
  '200-char department name accepted (boundary)');
select throws_ok($$insert into public.departments (name) values ('EXAMPLE COMPUTING')$$,
  '23505', null, 'case-variant duplicate department name rejected');

-- ===== 2. programs.name =====
select throws_ok($$insert into public.programs (name) values ('')$$,
  '23514', null, 'blank program name rejected');
select throws_ok($$insert into public.programs (name) values ('   ')$$,
  '23514', null, 'whitespace-only program name rejected');
select throws_ok($$insert into public.programs (name) values (repeat('y', 201))$$,
  '23514', null, '201-char program name rejected');
select lives_ok($$insert into public.programs (name) values (repeat('y', 200))$$,
  '200-char program name accepted (boundary)');
select throws_ok($$insert into public.programs (name) values ('EXAMPLE COMPUTER SCIENCE')$$,
  '23505', null, 'case-variant duplicate program name rejected');

-- ===== 3. student_profiles.student_id_number =====
-- Program 20...0001 is approved, so the program trigger passes and the unique index decides.
select throws_ok($$insert into public.student_profiles
    (student_id_number, first_name, last_name, program_id)
  values ('TEST-001', 'Example', 'Applicant', '20000000-0000-4000-8000-000000000001')$$,
  '23505', null, 'duplicate student ID rejected');
select throws_ok($$insert into public.student_profiles
    (student_id_number, first_name, last_name, program_id)
  values (repeat('9', 51), 'Example', 'Applicant', '20000000-0000-4000-8000-000000000001')$$,
  '23514', null, '51-char student ID rejected');
select throws_ok($$insert into public.student_profiles
    (student_id_number, first_name, last_name, program_id)
  values ('', 'Example', 'Applicant', '20000000-0000-4000-8000-000000000001')$$,
  '23514', null, 'blank student ID rejected');
select lives_ok($$insert into public.student_profiles
    (student_id_number, first_name, last_name, program_id)
  values ('TEST-900', 'Example', 'Applicant', '20000000-0000-4000-8000-000000000001')$$,
  'a valid, unique student ID is accepted');

select * from finish();
rollback;