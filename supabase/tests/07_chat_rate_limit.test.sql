begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(10);

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-4000-8000-000000000001';

select throws_ok(
  $$select public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000001')$$,
  '42501', 'permission denied for function consume_chat_rate_limit',
  'authenticated users cannot directly execute the rate-limit RPC'
);

select throws_ok(
  $$select * from private.chat_rate_limit_requests$$,
  '42501', 'permission denied for table chat_rate_limit_requests',
  'authenticated users cannot read rate-limit timestamps'
);

set local role anon;
select throws_ok(
  $$select public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000001')$$,
  '42501', 'permission denied for function consume_chat_rate_limit',
  'anonymous users cannot directly execute the rate-limit RPC'
);

reset role;
set local role service_role;

select is(
  public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000001'),
  true,
  'service_role records the first active faculty request'
);

select is(
  (select count(*) from generate_series(1, 19) as request(n)
   where public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000001')),
  19::bigint,
  'service_role accepts requests 2 through 20 across separate RPC calls'
);

select is(
  public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000001'),
  false,
  'service_role rejects request 21 in the same sliding window'
);

reset role;
select is(
  (select count(*) from private.chat_rate_limit_requests
   where actor_id = '30000000-0000-4000-8000-000000000001'),
  20::bigint,
  'a rejected request does not add a timestamp'
);

insert into private.chat_rate_limit_requests (actor_id, requested_at)
values ('30000000-0000-4000-8000-000000000004', pg_catalog.clock_timestamp() - interval '2 minutes');
set local role service_role;

select is(
  public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000004'),
  true,
  'active admins can consume their own rate-limit allowance'
);

reset role;
select is(
  (select count(*) from private.chat_rate_limit_requests
   where requested_at <= pg_catalog.clock_timestamp() - interval '1 minute'),
  0::bigint,
  'expired timestamps are pruned on the next RPC call'
);

set local role service_role;
select throws_ok(
  $$select public.consume_chat_rate_limit('30000000-0000-4000-8000-000000000003')$$,
  '42501', 'The caller is not authorized for this operation.',
  'pending faculty cannot consume a chat rate-limit allowance'
);

select * from finish();
rollback;
