begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

-- ===== 1. Active faculty (authenticated) cannot execute any transactional RPC =====
set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';

select throws_ok(
  $$select public.create_review_transaction(
      '30000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000001',
      'Direct RPC bypass attempt',
      '{"blocks":[{"type":"paragraph","content":[{"text":"Direct RPC bypass attempt"}]}]}'::jsonb,
      'Direct RPC bypass attempt',
      array['bypass'],
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768))
    )$$,
  '42501',
  'permission denied for function create_review_transaction',
  'authenticated faculty cannot directly execute create_review_transaction'
);

select throws_ok(
  $$select public.update_review_transaction(
      '30000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      'Direct RPC update attempt',
      '{"blocks":[{"type":"paragraph","content":[{"text":"Direct RPC update attempt"}]}]}'::jsonb,
      'Direct RPC update attempt',
      array['bypass'],
      true,
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768))
    )$$,
  '42501',
  'permission denied for function update_review_transaction',
  'authenticated faculty cannot directly execute update_review_transaction'
);

select throws_ok(
  $$select public.set_review_status_transaction(
      '30000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      'hide',
      null
    )$$,
  '42501',
  'permission denied for function set_review_status_transaction',
  'authenticated faculty cannot directly execute set_review_status_transaction'
);

select throws_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000001',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  '42501',
  'permission denied for function match_review_embeddings',
  'authenticated faculty cannot directly execute match_review_embeddings'
);

select throws_ok(
  $$select * from public.decide_applications_transaction(
      '30000000-0000-4000-8000-000000000001',
      '{"application_ids":["60000000-0000-4000-8000-000000000001"],"decision":"approve"}'::jsonb
    )$$,
  '42501',
  'permission denied for function decide_applications_transaction',
  'authenticated faculty cannot directly execute decide_applications_transaction'
);

-- ===== 2. Active admin (authenticated) cannot execute match_review_embeddings or decide_applications_transaction =====
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000004';

select throws_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000004',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  '42501',
  'permission denied for function match_review_embeddings',
  'authenticated admin cannot directly execute match_review_embeddings'
);

select throws_ok(
  $$select * from public.decide_applications_transaction(
      '30000000-0000-4000-8000-000000000004',
      '{"application_ids":["60000000-0000-4000-8000-000000000001"],"decision":"approve"}'::jsonb
    )$$,
  '42501',
  'permission denied for function decide_applications_transaction',
  'authenticated admin cannot directly execute decide_applications_transaction'
);

-- ===== 3. Anonymous role cannot execute transactional RPCs =====
set local role anon;

select throws_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000001',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  '42501',
  'permission denied for function match_review_embeddings',
  'anon cannot execute match_review_embeddings'
);

-- ===== 4. service_role can execute RPCs and actor-role checks are enforced =====
reset role;
set local role service_role;

select throws_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000004',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  '42501',
  'The caller is not authorized for this operation.',
  'service_role match_review_embeddings rejects admin actor so admins receive no review text'
);

select throws_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000003',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  '42501',
  'The caller is not authorized for this operation.',
  'service_role match_review_embeddings rejects pending faculty actor'
);

select lives_ok(
  $$select * from public.match_review_embeddings(
      '30000000-0000-4000-8000-000000000001',
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768)),
      5
    )$$,
  'service_role match_review_embeddings succeeds for active faculty actor'
);

select lives_ok(
  $$select public.create_review_transaction(
      '30000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000001',
      'Service role verified review',
      '{"blocks":[{"type":"paragraph","content":[{"text":"Service role verified review"}]}]}'::jsonb,
      'Service role verified review',
      array['verified'],
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768))
    )$$,
  'service_role create_review_transaction succeeds for active faculty actor'
);

select throws_ok(
  $$select public.create_review_transaction(
      '30000000-0000-4000-8000-000000000003',
      '40000000-0000-4000-8000-000000000001',
      'Pending actor review attempt',
      '{"blocks":[{"type":"paragraph","content":[{"text":"Pending actor review attempt"}]}]}'::jsonb,
      'Pending actor review attempt',
      array['pending'],
      (select '[' || string_agg('0', ',') || ']' from generate_series(1, 768))
    )$$,
  '42501',
  'The caller is not authorized for this operation.',
  'service_role create_review_transaction rejects pending faculty actor'
);

select throws_ok(
  $$select * from public.decide_applications_transaction(
      '30000000-0000-4000-8000-000000000001',
      '{"application_ids":["60000000-0000-4000-8000-000000000001"],"decision":"approve"}'::jsonb
    )$$,
  '42501',
  'The caller is not authorized for this operation.',
  'service_role decide_applications_transaction rejects non-admin faculty actor'
);

select * from finish();
rollback;
