begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);
create temporary table reservation_tokens (label text primary key, token uuid);
grant select, insert on reservation_tokens to service_role;

set local role authenticated;
select throws_ok($$select public.reserve_faculty_invitation('30000000-0000-4000-8000-000000000004',
  'reserved-213@example.test', '10000000-0000-4000-8000-000000000001')$$,
  '42501', null, 'clients cannot reserve invitation emails directly');
select throws_ok($$select public.finish_faculty_invitation('reserved-213@example.test', gen_random_uuid())$$,
  '42501', null, 'clients cannot release invitation reservations');

set local request.jwt.claim.sub = '';
set local role service_role;
select lives_ok($$insert into reservation_tokens values ('first', public.reserve_faculty_invitation(
  '30000000-0000-4000-8000-000000000004', ' Reserved-213@Example.Test ',
  '10000000-0000-4000-8000-000000000001'))$$, 'active admin reserves a normalized email');
select throws_ok($$select public.reserve_faculty_invitation('30000000-0000-4000-8000-000000000004',
  'reserved-213@example.test', '10000000-0000-4000-8000-000000000001')$$,
  '23505', 'An invitation is already in progress for this email address.', 'overlapping request receives a conflict');
select is(public.finish_faculty_invitation('reserved-213@example.test', gen_random_uuid()), false,
  'incorrect request token cannot release the reservation');
select throws_ok($$select public.reserve_faculty_invitation('30000000-0000-4000-8000-000000000004',
  'reserved-213@example.test', '10000000-0000-4000-8000-000000000001')$$,
  '23505', 'An invitation is already in progress for this email address.', 'reservation survives incorrect cleanup');
select is(public.finish_faculty_invitation('reserved-213@example.test', (select token from reservation_tokens where label = 'first')),
  true, 'matching request token releases its reservation');
select lives_ok($$insert into reservation_tokens values ('second', public.reserve_faculty_invitation(
  '30000000-0000-4000-8000-000000000004', 'reserved-213@example.test',
  '10000000-0000-4000-8000-000000000001'))$$, 'known-failed invitation can be retried after release');

reset role;
update private.faculty_invitation_reservations set expires_at = now() - interval '1 second'
where email = 'reserved-213@example.test';
set local role service_role;
select lives_ok($$insert into reservation_tokens values ('replacement', public.reserve_faculty_invitation(
  '30000000-0000-4000-8000-000000000004', 'reserved-213@example.test',
  '10000000-0000-4000-8000-000000000001'))$$, 'expired reservation can be recovered');
select is(public.finish_faculty_invitation('reserved-213@example.test', (select token from reservation_tokens where label = 'second')),
  false, 'stale cleanup cannot release the replacement reservation');
select is(public.finish_faculty_invitation('reserved-213@example.test', (select token from reservation_tokens where label = 'replacement')),
  true, 'replacement request can release its own reservation');
select throws_ok($$select public.reserve_faculty_invitation('30000000-0000-4000-8000-000000000001',
  'faculty-reserved-213@example.test', '10000000-0000-4000-8000-000000000001')$$,
  '42501', 'The caller is not authorized for this operation.', 'active faculty cannot reserve invitations');

reset role;
select * from finish();
rollback;
