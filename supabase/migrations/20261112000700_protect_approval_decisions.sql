-- Client-side admin CRUD is for queue maintenance. Decisions go through
-- the privileged workflow that applies the outcome and notifies the submitter.
revoke update (status, decided_by, decision_reason, decided_at)
  on public.approval_queue_items from authenticated;

alter policy queue_admin_update on public.approval_queue_items
  using ((select private.actor_kind()) = 'admin' and status = 'pending')
  with check ((select private.actor_kind()) = 'admin' and status = 'pending');

alter policy queue_admin_delete on public.approval_queue_items
  using ((select private.actor_kind()) = 'admin' and status = 'pending');

-- Preserve the published tag lookup alongside the four RPCs required by #152.
create function public.suggest_review_tags(prefix text default '')
returns table (tag text) language sql stable security invoker set search_path = ''
as $$
  select t.tag from public.tags t
  where private.actor_kind() = 'faculty'
    and starts_with(t.tag, lower(prefix))
$$;

revoke all on function public.suggest_review_tags(text) from public, anon, authenticated;
grant execute on function public.suggest_review_tags(text) to authenticated;
