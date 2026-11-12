begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(21);

-- Use the synthetic identities from seed.sql.
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select results_eq(
  'select status from public.review_details order by status',
  array['active', 'hidden'],
  'Faculty can read their own hidden review but cannot read deleted reviews'
);
select is(
  (select count(*) from public.search_students(query => 'research', tag => 'research')),
  1::bigint,
  'Student search matches active review text and tag'
);
select throws_ok(
  $$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'Faculty cannot write review text directly'
);

set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000002';
select results_eq(
  'select status from public.review_details',
  array['active'],
  'Faculty cannot read another owner''s hidden review'
);

set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';
select is(public.get_own_profile()->>'status', 'pending', 'Pending faculty can read their own status');
select results_eq(
  $$select full_name, status from public.update_own_profile('Example Pending Name')$$,
  $$values ('Example Pending Name'::text, 'pending'::text)$$,
  'Pending faculty can change their name without changing their status'
);
select is_empty('select id from public.approval_queue_items', 'Pending faculty cannot read approval queues');
select is(
  public.get_student_by_id('40000000-0000-4000-8000-000000000001'),
  null::jsonb, 'Pending faculty cannot read student details'
);

set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select is_empty('select id from public.review_details', 'Admins receive no raw reviews');
select is(
  (select count(*) from public.approval_queue_items),
  6::bigint, 'Admins can read the seeded approval queue'
);
select lives_ok(
  $$insert into public.approval_queue_items (type, payload)
    values ('program_proposal', '{"name":"Example Admin Proposal"}')$$,
  'Admins can create queue entries'
);
select lives_ok(
  $$update public.approval_queue_items set payload = '{"name":"Example Revised Proposal"}'
    where payload->>'name' = 'Example Admin Proposal'$$,
  'Admins can update queue entries'
);
select is(
  (select count(*) from public.approval_queue_items where payload->>'name' = 'Example Revised Proposal'),
  1::bigint, 'Admin queue update changes the intended row'
);
select lives_ok(
  $$delete from public.approval_queue_items where payload->>'name' = 'Example Revised Proposal'$$,
  'Admins can delete queue entries'
);
select is_empty(
  $$select id from public.approval_queue_items where payload->>'name' = 'Example Revised Proposal'$$,
  'The deleted queue entry is gone'
);

set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select throws_ok(
  $$insert into public.approval_queue_items (type, payload) values ('student_registration', '{}')$$,
  '23514', 'Invalid application payload for submission type.', 'Rejects an empty student application'
);
select throws_ok(
  $$insert into public.approval_queue_items (type, payload)
    values ('student_registration', '{"student_id_number":"TEST-004","first_name":"Example","last_name":"Applicant","program_id":"invalid"}')$$,
  '23514', 'Invalid application payload for submission type.', 'Rejects an invalid program UUID'
);
select throws_ok(
  $$insert into public.approval_queue_items (type, payload) values ('program_proposal', '{"name":" "}')$$,
  '23514', 'Invalid application payload for submission type.', 'Rejects a blank proposal name'
);
select throws_ok(
  $$insert into public.approval_queue_items (type, payload)
    values ('department_proposal', '{"name":"Example Department","department_id":null}')$$,
  '23514', 'Invalid application payload for submission type.', 'Rejects an explicit null edit ID'
);
select lives_ok(
  $$insert into public.approval_queue_items (type, payload) values
    ('student_registration', '{"student_id_number":"TEST-004","first_name":"Example","last_name":"Applicant","middle_name":null,"program_id":"20000000-0000-4000-8000-000000000001"}'),
    ('program_proposal', '{"name":"Example New Program"}'),
    ('department_proposal', '{"name":"Example Renamed Department","department_id":"10000000-0000-4000-8000-000000000001"}')$$,
  'Accepts valid student, program, and department applications'
);

reset role;
update public.reviews set body_text = 'Synthetic edited text'
where id = '50000000-0000-4000-8000-000000000001';
select results_eq(
  $$select body_text_snapshot from public.review_versions
    where review_id = '50000000-0000-4000-8000-000000000001'$$,
  array['Synthetic research review.'],
  'A privileged edit preserves the previous review text'
);

select * from finish();
rollback;
