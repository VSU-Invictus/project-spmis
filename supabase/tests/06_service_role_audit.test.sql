begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(10);

-- Isolate entries created by this test from synthetic seed history.
create temporary table prior_audit_ids as select id from public.audit_log_entries;

-- The seed includes additional faculty applications for the Admin queue badge.
-- Approve only the four base examples used by this audit attribution test.
create temporary table audit_test_application_ids as
select id
from public.approval_queue_items
where status = 'pending'
  and (
    (type = 'faculty_account' and submitted_by = '30000000-0000-4000-8000-000000000003')
    or (type in ('program_proposal', 'department_proposal', 'student_registration')
      and submitted_by = '30000000-0000-4000-8000-000000000001')
  );

-- Simulate an Edge Function using service_role, without a caller JWT subject.
set local request.jwt.claim.sub = '';
set local role service_role;

select lives_ok(
  $$select * from public.decide_applications_transaction(
    '30000000-0000-4000-8000-000000000004',
    jsonb_build_object('decision', 'approve', 'application_ids',
      (select jsonb_agg(id) from audit_test_application_ids))
  )$$,
  'service-role admin approves all four synthetic application types without a user JWT'
);

reset role;
select is(
  current_setting('app.actor_id', true),
  '30000000-0000-4000-8000-000000000004',
  'verified RPC actor is available to triggers within the transaction'
);

select is(
  (select count(*) from public.audit_log_entries
   where id not in (select id from prior_audit_ids)
     and action in ('student.created', 'program.created', 'department.created', 'faculty_profile.updated')),
  4::bigint,
  'approvals produce student, program, department and faculty audit side effects'
);

select is(
  (select count(*) from public.audit_log_entries
   where id not in (select id from prior_audit_ids)
     and (actor_id is distinct from '30000000-0000-4000-8000-000000000004'::uuid
       or actor_role is distinct from 'admin')),
  0::bigint,
  'every approval audit entry identifies the acting admin instead of system or submitter'
);

select is(
  (select count(*) from public.audit_log_entries
   where id not in (select id from prior_audit_ids) and action = 'application.updated'),
  4::bigint,
  'all four application-row updates produce attributed audit entries'
);

select is(
  (select count(*) from public.audit_log_entries
   where id not in (select id from prior_audit_ids) and action = 'application.approve'),
  4::bigint,
  'explicit application decision audit entries are retained'
);

-- An unset/empty transaction actor must preserve direct authenticated attribution.
select set_config('app.actor_id', '', true);
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select lives_ok(
  $$insert into public.programs (name) values ('Synthetic JWT Audit Fallback')$$,
  'direct admin writes continue to work with empty transaction actor'
);

select is(
  (select a.actor_id::text || ':' || a.actor_role
   from public.audit_log_entries a join public.programs p on p.id = a.entity_id
   where p.name = 'Synthetic JWT Audit Fallback' and a.action = 'program.created'),
  '30000000-0000-4000-8000-000000000004:admin',
  'audit trigger falls back to the authenticated admin JWT'
);

-- A transaction actor must never override an authenticated caller's identity.
select set_config('app.actor_id', '30000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$update public.programs set name = 'Synthetic JWT Audit Precedence'
    where name = 'Synthetic JWT Audit Fallback'$$,
  'direct admin write succeeds with a different transaction actor configured'
);

select is(
  (select a.actor_id::text || ':' || a.actor_role
   from public.audit_log_entries a join public.programs p on p.id = a.entity_id
   where p.name = 'Synthetic JWT Audit Precedence' and a.action = 'program.updated'),
  '30000000-0000-4000-8000-000000000004:admin',
  'verified JWT identity takes precedence over a conflicting app.actor_id'
);

select * from finish();
rollback;
