begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select throws_ok($$select public.validate_faculty_invitation('30000000-0000-4000-8000-000000000004', 'invite-213@example.test', '10000000-0000-4000-8000-000000000001')$$, '42501', null, 'clients cannot execute invitation preflight directly');

reset role;
set local request.jwt.claim.sub = '';
set local role service_role;
select throws_ok($$select public.validate_faculty_invitation('30000000-0000-4000-8000-000000000001', 'invite-213@example.test', '10000000-0000-4000-8000-000000000001')$$, '42501', 'The caller is not authorized for this operation.', 'faculty cannot invite accounts');

select throws_ok($$select public.validate_faculty_invitation('30000000-0000-4000-8000-000000000004', 'OWNER@EXAMPLE.TEST', '10000000-0000-4000-8000-000000000001')$$, '23505', 'An account already exists for this email address.', 'duplicate email is rejected case-insensitively');

select throws_ok($$select public.validate_faculty_invitation('30000000-0000-4000-8000-000000000004', 'invite-213@example.test', '10000000-0000-4000-8000-999999999999')$$, '23514', 'The faculty department must be approved.', 'invalid departments fail before Auth invitation');

select lives_ok($$select public.validate_faculty_invitation('30000000-0000-4000-8000-000000000004', 'invite-213@example.test', '10000000-0000-4000-8000-000000000001')$$, 'active admin can preflight a unique valid invitation');

reset role;
-- Synthetic fixture simulation; the endpoint must use inviteUserByEmail in real flows.
select lives_ok($$insert into auth.users (id, aud, role, email, invited_at, raw_user_meta_data) values ('31300000-abcd-4000-8000-000000000011', 'authenticated', 'authenticated', 'invite-213@example.test', now(), '{"spmis_faculty_invitation":true,"spmis_invited_by":"30000000-0000-4000-8000-000000000004","full_name":"Synthetic Invited Faculty","department_id":"10000000-0000-4000-8000-000000000001","role":"admin","status":"active"}')$$, 'Auth invitation creates its public records atomically');

select is((select role || ':' || status from public.faculty_profiles where id = '31300000-abcd-4000-8000-000000000011'), 'faculty:pending', 'untrusted metadata cannot grant admin or active privileges');

select is((select count(*) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000011' and type = 'faculty_account' and status = 'pending'), 1::bigint, 'invitation creates exactly one pending application');

select is((select count(*) from public.audit_log_entries where entity_id = '31300000-abcd-4000-8000-000000000011' and action = 'faculty_profile.created' and actor_id = '30000000-0000-4000-8000-000000000004' and actor_role = 'admin'), 1::bigint, 'invitation creation is attributed to the verified inviter');

select throws_ok($$insert into auth.users (id, aud, role, email, invited_at, raw_user_meta_data) values ('31300000-abcd-4000-8000-000000000012', 'authenticated', 'authenticated', 'bad-invite-213@example.test', now(), '{"spmis_faculty_invitation":true,"spmis_invited_by":"30000000-0000-4000-8000-000000000004","full_name":"Synthetic Invited Faculty","department_id":"10000000-0000-4000-8000-999999999999","role":"admin","status":"active"}')$$, '23514', 'The faculty department must be approved.', 'invalid invitation rolls back Auth creation');

select is((select count(*) from auth.users where id = '31300000-abcd-4000-8000-000000000012'), 0::bigint, 'failed invitation leaves no Auth user');

insert into auth.users (id, aud, role, email, raw_user_meta_data) values ('31300000-abcd-4000-8000-000000000013', 'authenticated', 'authenticated', 'later-invite-213@example.test', '{"spmis_faculty_invitation":true,"spmis_invited_by":"30000000-0000-4000-8000-000000000004","full_name":"Synthetic Invited Faculty","department_id":"10000000-0000-4000-8000-000000000001","role":"admin","status":"active"}');
select is((select count(*) from public.faculty_profiles where id = '31300000-abcd-4000-8000-000000000013'), 0::bigint, 'signup metadata alone cannot invoke the invitation trigger');

select lives_ok($$update auth.users set invited_at = now() where id = '31300000-abcd-4000-8000-000000000013'$$, 'setting the trusted Auth invitation timestamp also provisions the pending account');

update auth.users set invited_at = now() where id = '31300000-abcd-4000-8000-000000000013';
select is((select count(*) from public.approval_queue_items where submitted_by = '31300000-abcd-4000-8000-000000000013'), 1::bigint, 'repeated invitation timestamp updates do not duplicate applications');

select * from finish();
rollback;
