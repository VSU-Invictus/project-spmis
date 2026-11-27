begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(11);

-- Model the state seen after a concurrent unhide commits: active, but the
-- edit started while hidden and therefore did not generate an embedding.
insert into public.review_embeddings (review_id, embedding)
values ('50000000-0000-4000-8000-000000000001',
  array_fill(0.1::real, array[768])::extensions.vector)
on conflict (review_id) do update set embedding = excluded.embedding;

create temporary table original_review as
select to_jsonb(r) as value from public.reviews r
where id = '50000000-0000-4000-8000-000000000001';
create temporary table original_counts as
select (select count(*) from public.review_versions) as revisions,
       (select count(*) from public.audit_log_entries) as audits;

set local request.jwt.claim.sub = '';
set local role service_role;

select throws_ok(
  $$select public.update_review_transaction(
    '30000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    'Synthetic rejected edit.', '{"blocks":[]}', 'Synthetic rejected edit.',
    array['replacement'], true, null)$$,
  '55000', 'The review is active and requires a fresh embedding. Retry the edit.',
  'active review rejects an edit without an embedding with a retryable conflict'
);

reset role;
select is((select to_jsonb(r) from public.reviews r
  where id = '50000000-0000-4000-8000-000000000001'),
  (select value from original_review), 'conflict preserves the entire review row');
select is((select array_agg(tag order by tag) from public.review_tags
  where review_id = '50000000-0000-4000-8000-000000000001'),
  array['research']::text[], 'conflict preserves tags');
select is((select count(*) from public.review_versions),
  (select revisions from original_counts), 'conflict creates no revision');
select is((select count(*) from public.audit_log_entries),
  (select audits from original_counts), 'conflict creates no audit entry');
select is((select embedding::text from public.review_embeddings
  where review_id = '50000000-0000-4000-8000-000000000001'),
  (array_fill(0.1::real, array[768])::extensions.vector)::text,
  'conflict preserves the previous embedding');

set local role service_role;
select lives_ok(
  $$select public.update_review_transaction(
    '30000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    'Synthetic hidden edit.', '{"blocks":[]}', 'Synthetic hidden edit.',
    null, false, null)$$,
  'hidden review still accepts an edit without an embedding'
);
select is((select count(*) from public.review_embeddings
  where review_id = '50000000-0000-4000-8000-000000000002'),
  0::bigint, 'hidden edit does not create an embedding');
select lives_ok(
  $$select public.update_review_transaction(
    '30000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    'Synthetic retried edit.', '{"blocks":[]}', 'Synthetic retried edit.',
    null, false, array_fill(0.2::real, array[768])::extensions.vector::text)$$,
  'retry with a fresh embedding succeeds for an active review'
);
select is((select embedding::text from public.review_embeddings
  where review_id = '50000000-0000-4000-8000-000000000001'),
  (array_fill(0.2::real, array[768])::extensions.vector)::text,
  'successful retry replaces the embedding');
select is((select body_text from public.reviews
  where id = '50000000-0000-4000-8000-000000000001'),
  'Synthetic retried edit.', 'successful retry saves the new content');

reset role;
select * from finish();
rollback;
