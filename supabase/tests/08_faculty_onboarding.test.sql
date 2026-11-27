begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(24);

-- Synthetic database fixtures only. Real registration and invitation use Supabase Auth APIs.
insert into auth.users (id, aud, role, email, email_confirmed_at) values
  ('31300000-abcd-4000-8000-000000000001', 'authenticated', 'authenticated', 'onboarding-213@example.test', now()),
  ('31300000-abcd-4000-8000-000000000002', 'authenticated', 'authenticated', 'invalid-department-213@example.test', now()),
  ('31300000-abcd-4000-8000-000000000003', 'authenticated', 'authenticated', 'email-only-213@example.test', now());
insert into auth.identities (provider_id, user_id, identity_data, provider)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email), 'google'
from auth.users where id in ('31300000-abcd-4000-8000-000000000001', '31300000-abcd-4000-8000-000000000002');

set local role anon;

select throws_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000001', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-000000000001')$$, '42501', null, 'anonymous users cannot execute the privileged onboarding RPC');

set local role authenticated;
set local request.jwt.claim.sub = '31300000-abcd-4000-8000-000000000001';

select throws_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000001', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-000000000001')$$, '42501', null, 'authenticated users cannot bypass the onboarding Edge Function');

select throws_ok($$select * from public.get_faculty_onboarding_departments('31300000-abcd-4000-8000-000000000001')$$,
  '42501', null, 'clients cannot execute privileged onboarding choices directly');

reset role;
set local request.jwt.claim.sub = '';
set local role service_role;

select is((select count(*) from public.get_faculty_onboarding_departments('31300000-abcd-4000-8000-000000000001')),
  2::bigint, 'verified Google account can load approved choices before creating a profile');
select is((select array_agg(key order by key) from jsonb_object_keys((select to_jsonb(d)
  from public.get_faculty_onboarding_departments('31300000-abcd-4000-8000-000000000001') d limit 1)) key),
  array['id', 'name']::text[], 'onboarding choices expose only IDs and names');
select throws_ok($$select * from public.get_faculty_onboarding_departments('31300000-abcd-4000-8000-000000000003')$$,
  '42501', 'A verified Google account is required for faculty onboarding.', 'email-only identity cannot load onboarding choices');

select throws_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000002', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-999999999999')$$, '23514', 'The faculty department must be approved.', 'invalid department rejects registration');

select is((select count(*) from public.faculty_profiles where id = '31300000-abcd-4000-8000-000000000002'), 0::bigint, 'invalid registration leaves no faculty profile');

select is((select count(*) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000002'), 0::bigint, 'invalid registration leaves no application');

select throws_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000003', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-000000000001')$$, '42501', 'A verified Google account is required for faculty onboarding.', 'email-only identity cannot self-register as Google faculty');

select lives_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000001', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-000000000001')$$, 'verified Google account completes pending onboarding');

select is((select email || ':' || role || ':' || status from public.faculty_profiles where id = '31300000-abcd-4000-8000-000000000001'), 'onboarding-213@example.test:faculty:pending', 'identity email and pending faculty privileges come from server state');

select is((select payload from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000001' and type = 'faculty_account' and status = 'pending'), jsonb_build_object('full_name', 'Synthetic Onboarding Faculty', 'email', 'onboarding-213@example.test', 'department_id', '10000000-0000-4000-8000-000000000001'), 'pending application captures normalized onboarding fields');

select throws_ok($$select public.complete_faculty_onboarding('31300000-abcd-4000-8000-000000000001', ' Synthetic Onboarding Faculty ', '10000000-0000-4000-8000-000000000001')$$, '23505', 'A faculty profile already exists for this account.', 'duplicate onboarding produces a conflict');

select is((select count(*) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000001'), 1::bigint, 'duplicate submission creates no extra application');

-- Inspect protected Auth fixtures as the test owner, without broadening API grants.
reset role;
select is((select count(*) from auth.users where id in ('31300000-abcd-4000-8000-000000000001', '31300000-abcd-4000-8000-000000000002', '31300000-abcd-4000-8000-000000000003')), 3::bigint, 'onboarding never provisions additional Auth users');
set local role service_role;

select throws_ok($$select * from public.match_review_embeddings('31300000-abcd-4000-8000-000000000001', array_fill(0.1::real, array[768])::extensions.vector::text, 1)$$, '42501', 'The caller is not authorized for this operation.', 'pending faculty cannot use privileged AI retrieval');

set local role authenticated;
set local request.jwt.claim.sub = '31300000-abcd-4000-8000-000000000001';

select is(public.get_own_profile()->>'status', 'pending', 'pending faculty can read their onboarding status');

select is((select count(*) from public.student_profiles), 0::bigint, 'pending faculty cannot read students');

select is((select count(*) from public.reviews), 0::bigint, 'pending faculty cannot read reviews');

set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select is((select count(*) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000001' and status = 'pending'), 1::bigint, 'admin sees the pending faculty application');

set local role service_role;
set local request.jwt.claim.sub = '';

select lives_ok($$select * from public.decide_applications_transaction('30000000-0000-4000-8000-000000000004', jsonb_build_object('decision', 'approve', 'application_ids', (select jsonb_agg(id) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000001' and status = 'pending')))$$, 'active admin approves the new faculty application');

set local role authenticated;
set local request.jwt.claim.sub = '31300000-abcd-4000-8000-000000000001';

select is(public.get_own_profile()->>'status', 'active', 'approval activates the same faculty account');

select is((select count(*) from public.student_profiles), 2::bigint, 'approved faculty gain student read access');

reset role;
select * from finish();
rollback;
