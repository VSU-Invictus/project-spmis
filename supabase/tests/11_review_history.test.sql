begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(25);

create temporary table baseline as
select count(*) as revisions from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002';
grant select on baseline to service_role;

set local request.jwt.claim.sub = '';
set local role service_role;

select lives_ok($$select public.update_review_transaction('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'Synthetic private review.', '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic private review."}]}]}', 'Synthetic private review.', array['updated-tag'], true, null)$$, 'tag-only edit succeeds');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002'), (select revisions + 1 from baseline), 'edit 1 creates exactly one revision');

select is((select body_text_snapshot from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' order by id desc limit 1), 'Synthetic private review.', 'tag-only revision captures old text');

select is((select body_document_snapshot from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' order by id desc limit 1), '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic private review."}]}]}'::jsonb, 'tag-only revision captures old document');

select is((select tags_snapshot from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' order by id desc limit 1), array['hidden-test']::text[], 'tag-only revision captures old tags');

select is((select edited_by from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' order by id desc limit 1), '30000000-0000-4000-8000-000000000001'::uuid, 'revision identifies verified owner without a user JWT');

select is((select array_agg(tag order by tag) from public.review_tags where review_id = '50000000-0000-4000-8000-000000000002'), array['updated-tag']::text[], 'tag-only edit replaces current tags');

select lives_ok($$select public.update_review_transaction('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'Synthetic edited history.', '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic edited history."}]}]}', 'Synthetic edited history.', array['second-tag'], true, null)$$, 'combined body and tag edit succeeds');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002'), (select revisions + 2 from baseline), 'edit 2 creates exactly one revision');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' and tags_snapshot = array['updated-tag']::text[] and body_text_snapshot = 'Synthetic private review.'), 1::bigint, 'combined edit saves the previous body and tags exactly once');

select lives_ok($$select public.update_review_transaction('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'Synthetic edited history.', '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic edited history."}]}]}', 'Synthetic edited history.', '{}'::text[], true, null)$$, 'explicit empty tags clears tags');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002'), (select revisions + 3 from baseline), 'edit 3 creates exactly one revision');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' and tags_snapshot = array['second-tag']::text[]), 1::bigint, 'clear operation snapshots the tags being removed');

select is((select count(*) from public.review_tags where review_id = '50000000-0000-4000-8000-000000000002'), 0::bigint, 'explicit empty tags leaves no current tags');

select lives_ok($$select public.update_review_transaction('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'Synthetic omitted tags edit.', '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic edited history."}]}]}', 'Synthetic omitted tags edit.', null, false, null)$$, 'body edit with omitted tags succeeds');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002'), (select revisions + 4 from baseline), 'edit 4 creates exactly one revision');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002' and tags_snapshot = '{}'::text[]), 1::bigint, 'revision after clearing records an empty tag snapshot');

select is((select count(*) from public.review_tags where review_id = '50000000-0000-4000-8000-000000000002'), 0::bigint, 'omitted tags preserve the empty set');

select throws_ok($$select public.update_review_transaction('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 'Synthetic failed edit.', '{"blocks":[{"type":"paragraph","content":[{"text":"Synthetic edited history."}]}]}', 'Synthetic failed edit.', array['duplicate','duplicate'], true, null)$$, '23505', null, 'failed tag replacement rolls back the whole edit');

select is((select count(*) from public.review_versions where review_id = '50000000-0000-4000-8000-000000000002'), (select revisions + 4 from baseline), 'failed edit creates no additional revision');

select is((select body_text from public.reviews where id = '50000000-0000-4000-8000-000000000002'), 'Synthetic omitted tags edit.', 'failed edit preserves prior content');

select lives_ok($$select public.update_review_transaction(
  '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002',
  'Synthetic retained tags.', '{"blocks":[]}', 'Synthetic retained tags.',
  array['retained-tag'], true, null)$$, 'restoring a nonempty tag set succeeds');

select lives_ok($$select public.update_review_transaction(
  '30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002',
  'Synthetic final edit.', '{"blocks":[]}', 'Synthetic final edit.',
  null, false, null)$$, 'omitted tags permit a body edit with existing tags');

select is((select array_agg(tag order by tag) from public.review_tags
  where review_id = '50000000-0000-4000-8000-000000000002'),
  array['retained-tag']::text[], 'omitted tags preserve an existing nonempty set');

select is((select count(*) from public.review_versions
  where review_id = '50000000-0000-4000-8000-000000000002'),
  (select revisions + 6 from baseline), 'six successful edits create exactly six revisions');

reset role;
select * from finish();
rollback;
