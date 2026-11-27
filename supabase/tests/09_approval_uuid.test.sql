begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

insert into public.approval_queue_items (id, type, submitted_by, payload) values
  ('61200000-abcd-4000-8000-000000000001', 'program_proposal',
    '30000000-0000-4000-8000-000000000001', '{"name":"Synthetic UUID Program"}'),
  ('61200000-abcd-4000-8000-000000000002', 'faculty_account',
    '30000000-0000-4000-8000-000000000003',
    '{"full_name":"Synthetic UUID Faculty","email":"pending@example.test","department_id":"10000000-0000-4000-8000-000000000001"}');

set local request.jwt.claim.sub = '';
set local role service_role;

select throws_ok(
  $$select * from public.decide_applications_transaction(
    '30000000-0000-4000-8000-000000000004',
    '{"decision":"approve","application_ids":["61200000-abcd-4000-8000-000000000001","61200000-ABCD-4000-8000-000000000001"]}'::jsonb)$$,
  '22023', 'application_ids must not contain duplicates.',
  'mixed-case duplicate application UUIDs are rejected before processing'
);

select is((select status from public.approval_queue_items where id = '61200000-abcd-4000-8000-000000000001'),
  'pending', 'duplicate rejection leaves the application pending');
select is((select count(*) from public.notifications where payload->>'application_id' = '61200000-abcd-4000-8000-000000000001'),
  0::bigint, 'duplicate rejection creates no notification');
select is((select count(*) from public.audit_log_entries where entity_id = '61200000-abcd-4000-8000-000000000001' and action = 'application.approve'),
  0::bigint, 'duplicate rejection creates no decision audit entry');

select lives_ok(
  $$select * from public.decide_applications_transaction(
    '30000000-0000-4000-8000-000000000004',
    '{"decision":"approve","application_ids":["61200000-ABCD-4000-8000-000000000001"]}'::jsonb)$$,
  'a unique uppercase UUID is accepted'
);
select is((select count(*) from public.programs where name = 'Synthetic UUID Program'),
  1::bigint, 'uppercase UUID approval creates the program once');
select is((select count(*) from public.notifications where payload->>'application_id' = '61200000-abcd-4000-8000-000000000001'),
  1::bigint, 'uppercase UUID approval creates one notification');
select is((select count(*) from public.audit_log_entries where entity_id = '61200000-abcd-4000-8000-000000000001' and action = 'application.approve'),
  1::bigint, 'uppercase UUID approval creates one decision audit entry');

select throws_ok(
  $$select * from public.decide_applications_transaction(
    '30000000-0000-4000-8000-000000000004',
    '{"decision":"approve","application_ids":["61200000-abcd-4000-8000-000000000002"],"department_assignments":[
      {"application_id":"61200000-abcd-4000-8000-000000000002","department_id":"10000000-0000-4000-8000-000000000001"},
      {"application_id":"61200000-ABCD-4000-8000-000000000002","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$,
  '22023', 'department_assignments must not contain duplicates.',
  'mixed-case duplicate assignment UUIDs are rejected'
);
select is((select status from public.approval_queue_items where id = '61200000-abcd-4000-8000-000000000002'),
  'pending', 'duplicate assignments leave the faculty application pending');

select lives_ok(
  $$select * from public.decide_applications_transaction(
    '30000000-0000-4000-8000-000000000004',
    '{"decision":"approve","application_ids":["61200000-abcd-4000-8000-000000000002"],"department_assignments":[
      {"application_id":"61200000-ABCD-4000-8000-000000000002","department_id":"10000000-0000-4000-8000-000000000002"}]}'::jsonb)$$,
  'assignment membership compares UUID identities rather than text casing'
);
select is((select department_id from public.faculty_profiles where id = '30000000-0000-4000-8000-000000000003'),
  '10000000-0000-4000-8000-000000000002'::uuid, 'the selected department override is applied');
select is((select status from public.approval_queue_items where id = '61200000-abcd-4000-8000-000000000002'),
  'approved', 'the faculty application is approved once');
select is((select count(*) from public.notifications where payload->>'application_id' = '61200000-abcd-4000-8000-000000000002'),
  1::bigint, 'mixed-case assignment approval creates one notification');

select * from finish();
rollback;
