begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(29);

-- Seeded reviews (all owned by 30...0001): 50...0001 active, 50...0002 hidden, 50...0003 deleted.

-- ===== 1. body_text writes denied (no INSERT/UPDATE grant on reviews) =====
-- anon
set local role anon;
set local request.jwt.claim.sub = '';
select throws_ok($$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'anon cannot update review text');
select throws_ok($$insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
          'Synthetic insert', '{}'::jsonb, 'Synthetic insert')$$,
  '42501', null, 'anon cannot insert review text');

reset role;
set local role authenticated;

-- pending
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';
select throws_ok($$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'pending cannot update review text');
select throws_ok($$insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003',
          'Synthetic insert', '{}'::jsonb, 'Synthetic insert')$$,
  '42501', null, 'pending cannot insert review text');

-- owner
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select throws_ok($$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'owner cannot update review text');
select throws_ok($$insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
          'Synthetic insert', '{}'::jsonb, 'Synthetic insert')$$,
  '42501', null, 'owner cannot insert review text');

-- non-owner
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000002';
select throws_ok($$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'non-owner cannot update review text');
select throws_ok($$insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002',
          'Synthetic insert', '{}'::jsonb, 'Synthetic insert')$$,
  '42501', null, 'non-owner cannot insert review text');

-- admin
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select throws_ok($$update public.reviews set body_text = 'Synthetic edit'$$,
  '42501', null, 'admin cannot update review text');
select throws_ok($$insert into public.reviews (student_id, owner_id, body_text, body_document, deidentified_text)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000004',
          'Synthetic insert', '{}'::jsonb, 'Synthetic insert')$$,
  '42501', null, 'admin cannot insert review text');

-- ===== 2. visibility matrix (seeded active / hidden / deleted) =====
-- anon: no grant on either object
reset role;
set local role anon;
set local request.jwt.claim.sub = '';
select throws_ok('select id from public.reviews', '42501', null, 'anon cannot read reviews');
select throws_ok('select id from public.review_details', '42501', null, 'anon cannot read review_details');

reset role;
set local role authenticated;

-- owner: active + own hidden, never deleted
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select results_eq('select status from public.reviews order by status',
  array['active', 'hidden'], 'owner reads active and own hidden reviews only');
select results_eq('select status from public.review_details order by status',
  array['active', 'hidden'], 'owner reads active and own hidden review_details only');

-- non-owner: active only
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000002';
select results_eq('select status from public.reviews',
  array['active'], 'non-owner reads active reviews only');
select results_eq('select status from public.review_details',
  array['active'], 'non-owner reads active review_details only');

-- pending: nothing
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000003';
select is_empty('select id from public.reviews', 'pending sees 0 reviews');
select is_empty('select id from public.review_details', 'pending sees 0 review_details');

-- admin: nothing
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select is_empty('select id from public.reviews', 'admin sees 0 reviews');
select is_empty('select id from public.review_details', 'admin sees 0 review_details');

-- deleted review: invisible to every authenticated identity
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';
select is_empty($$select id from public.reviews where status = 'deleted'$$, 'owner cannot read deleted review');
select is_empty($$select id from public.review_details where status = 'deleted'$$, 'owner cannot read deleted review_details');

-- ===== 3. review_embeddings unreadable by API roles =====
reset role;
set local role anon;
set local request.jwt.claim.sub = '';
select throws_ok('select review_id from public.review_embeddings', '42501', null, 'anon cannot read embeddings');
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000002';
select throws_ok('select review_id from public.review_embeddings', '42501', null, 'non-owner cannot read embeddings');
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';
select throws_ok('select review_id from public.review_embeddings', '42501', null, 'admin cannot read embeddings');

-- ===== 4. embedding lifecycle (as postgres) =====
reset role;
-- seeded hidden/deleted reviews have no embeddings
select is((select count(*) from public.review_embeddings
           where review_id in ('50000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000003')),
  0::bigint, 'seeded hidden and deleted reviews have 0 embeddings');

-- active review keeps its embedding
insert into public.review_embeddings (review_id, embedding)
values ('50000000-0000-4000-8000-000000000001', '[0,0,0]'::extensions.vector);
select is((select count(*) from public.review_embeddings
           where review_id = '50000000-0000-4000-8000-000000000001'),
  1::bigint, 'active review has an embedding row');

-- active -> hidden removes it
update public.reviews set status = 'hidden' where id = '50000000-0000-4000-8000-000000000001';
select is((select count(*) from public.review_embeddings
           where review_id = '50000000-0000-4000-8000-000000000001'),
  0::bigint, 'embedding removed on active -> hidden');

-- back to active, re-embed, then active -> deleted
update public.reviews set status = 'active' where id = '50000000-0000-4000-8000-000000000001';
insert into public.review_embeddings (review_id, embedding)
values ('50000000-0000-4000-8000-000000000001', '[0,0,0]'::extensions.vector);
update public.reviews set status = 'deleted' where id = '50000000-0000-4000-8000-000000000001';
select is((select count(*) from public.review_embeddings
           where review_id = '50000000-0000-4000-8000-000000000001'),
  0::bigint, 'embedding removed on active -> deleted');

select * from finish();
rollback;