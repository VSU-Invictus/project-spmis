begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

insert into public.approval_queue_items (id, type, submitted_by, payload) values
  ('61210000-abcd-4000-8000-000000000001', 'student_registration', '30000000-0000-4000-8000-000000000001', '{"student_id_number":"TEST-212-ASSIGNMENT","first_name":"Synthetic","last_name":"Assignment","program_id":"20000000-0000-4000-8000-000000000001"}'),
  ('61210000-abcd-4000-8000-000000000002', 'program_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Synthetic Assignment Program"}'),
  ('61210000-abcd-4000-8000-000000000003', 'department_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Synthetic Assignment Department"}'),
  ('61210000-abcd-4000-8000-000000000004', 'faculty_account', '30000000-0000-4000-8000-000000000003', '{"full_name":"Synthetic Assignment Faculty","email":"pending@example.test","department_id":"10000000-0000-4000-8000-000000000001"}');

create temporary table baseline as
select (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.approval_queue_items r) as approval_queue_items,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.faculty_profiles r) as faculty_profiles,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.student_profiles r) as student_profiles,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.programs r) as programs,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.departments r) as departments,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.audit_log_entries r) as audit_log_entries,
       (select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.notifications r) as notifications;
grant select on baseline to service_role;

set local request.jwt.claim.sub = '';
set local role service_role;

select throws_ok($$select * from public.decide_applications_transaction('30000000-0000-4000-8000-000000000004', '{"decision":"approve","application_ids":["61210000-abcd-4000-8000-000000000001","61210000-abcd-4000-8000-000000000002","61210000-abcd-4000-8000-000000000003","61210000-abcd-4000-8000-000000000004"],"department_assignments":[{"application_id":"61210000-abcd-4000-8000-000000000001","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$, '22023',
  'Department assignments must target faculty account applications.',
  'student_registration cannot receive a department assignment in a mixed batch');

select throws_ok($$select * from public.decide_applications_transaction('30000000-0000-4000-8000-000000000004', '{"decision":"approve","application_ids":["61210000-abcd-4000-8000-000000000001","61210000-abcd-4000-8000-000000000002","61210000-abcd-4000-8000-000000000003","61210000-abcd-4000-8000-000000000004"],"department_assignments":[{"application_id":"61210000-abcd-4000-8000-000000000002","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$, '22023',
  'Department assignments must target faculty account applications.',
  'program_proposal cannot receive a department assignment in a mixed batch');

select throws_ok($$select * from public.decide_applications_transaction('30000000-0000-4000-8000-000000000004', '{"decision":"approve","application_ids":["61210000-abcd-4000-8000-000000000001","61210000-abcd-4000-8000-000000000002","61210000-abcd-4000-8000-000000000003","61210000-abcd-4000-8000-000000000004"],"department_assignments":[{"application_id":"61210000-abcd-4000-8000-000000000003","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$, '22023',
  'Department assignments must target faculty account applications.',
  'department_proposal cannot receive a department assignment in a mixed batch');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.approval_queue_items r), (select approval_queue_items from baseline),
  'invalid assignment batches preserve approval_queue_items');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.faculty_profiles r), (select faculty_profiles from baseline),
  'invalid assignment batches preserve faculty_profiles');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.student_profiles r), (select student_profiles from baseline),
  'invalid assignment batches preserve student_profiles');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.programs r), (select programs from baseline),
  'invalid assignment batches preserve programs');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.departments r), (select departments from baseline),
  'invalid assignment batches preserve departments');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.audit_log_entries r), (select audit_log_entries from baseline),
  'invalid assignment batches preserve audit_log_entries');

select is((select coalesce(jsonb_agg(to_jsonb(r) order by r.id), '[]'::jsonb) from public.notifications r), (select notifications from baseline),
  'invalid assignment batches preserve notifications');

select lives_ok($$select * from public.decide_applications_transaction('30000000-0000-4000-8000-000000000004', '{"decision":"approve","application_ids":["61210000-abcd-4000-8000-000000000001","61210000-abcd-4000-8000-000000000002","61210000-abcd-4000-8000-000000000003","61210000-abcd-4000-8000-000000000004"],"department_assignments":[{"application_id":"61210000-abcd-4000-8000-000000000004","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$, 'valid mixed batch accepts a faculty-only department override');

select is((select department_id from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000003'),
  '10000000-0000-4000-8000-000000000002'::uuid, 'faculty receives the selected department');

select is((select count(*) from public.approval_queue_items where id = any(array['61210000-abcd-4000-8000-000000000001','61210000-abcd-4000-8000-000000000002','61210000-abcd-4000-8000-000000000003','61210000-abcd-4000-8000-000000000004']::uuid[]) and status = 'approved'),
  4::bigint, 'valid mixed batch approves all four application types');

select is((select count(*) from public.notifications where (payload->>'application_id') = any(array['61210000-abcd-4000-8000-000000000001','61210000-abcd-4000-8000-000000000002','61210000-abcd-4000-8000-000000000003','61210000-abcd-4000-8000-000000000004' ]::text[])),
  4::bigint, 'valid mixed batch creates exactly one notification per application');

reset role;
select * from finish();
rollback;
