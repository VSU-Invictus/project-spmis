begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(9);

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
