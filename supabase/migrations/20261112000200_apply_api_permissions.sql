create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.actor_kind()
returns text language sql stable security definer set search_path = ''
as $$
  select case
    when status = 'active' and role = 'admin' then 'admin'
    when status = 'active' and role = 'faculty' then 'faculty'
    when status = 'pending' and role = 'faculty' then 'pending'
  end
  from public.faculty_profiles where id = (select auth.uid())
$$;

revoke all on function private.actor_kind() from public;
grant execute on function private.actor_kind() to authenticated;

revoke all on public.departments from public, anon, authenticated;
revoke all on public.programs from public, anon, authenticated;
revoke all on public.faculty_profiles from public, anon, authenticated;
revoke all on public.student_profiles from public, anon, authenticated;
revoke all on public.reviews from public, anon, authenticated;
revoke all on public.review_versions from public, anon, authenticated;
revoke all on public.tags from public, anon, authenticated;
revoke all on public.review_tags from public, anon, authenticated;
revoke all on public.review_embeddings from public, anon, authenticated;
revoke all on public.review_attachments from public, anon, authenticated;
revoke all on public.approval_queue_items from public, anon, authenticated;
revoke all on public.audit_log_entries from public, anon, authenticated;

grant select on public.departments, public.programs, public.faculty_profiles,
  public.student_profiles, public.review_versions, public.tags, public.review_tags,
  public.approval_queue_items, public.audit_log_entries to authenticated;
grant select (id, student_id, owner_id, body_text, body_document, status, created_at, updated_at)
  on public.reviews to authenticated;
grant select (id, review_id, mime_type, size_bytes, created_at)
  on public.review_attachments to authenticated;
grant insert (name), update (name), delete on public.departments, public.programs to authenticated;
grant insert (student_id_number, first_name, last_name, middle_name, program_id),
  update (student_id_number, first_name, last_name, middle_name, program_id)
  on public.student_profiles to authenticated;
grant update (email, full_name, department_id, role, status) on public.faculty_profiles to authenticated;
grant insert (type, payload) on public.approval_queue_items to authenticated;

create policy departments_read on public.departments for select to authenticated
  using ((select private.actor_kind()) = 'admin'
    or ((select private.actor_kind()) = 'faculty' and status = 'approved'));
create policy departments_admin on public.departments for all to authenticated
  using ((select private.actor_kind()) = 'admin')
  with check ((select private.actor_kind()) = 'admin');

create policy programs_read on public.programs for select to authenticated
  using ((select private.actor_kind()) = 'admin'
    or ((select private.actor_kind()) = 'faculty' and status = 'approved'));
create policy programs_admin on public.programs for all to authenticated
  using ((select private.actor_kind()) = 'admin')
  with check ((select private.actor_kind()) = 'admin');

create policy faculty_profiles_read on public.faculty_profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.actor_kind()) = 'admin');
create policy faculty_profiles_admin_update on public.faculty_profiles for update to authenticated
  using ((select private.actor_kind()) = 'admin')
  with check ((select private.actor_kind()) = 'admin');

create policy student_profiles_read on public.student_profiles for select to authenticated
  using ((select private.actor_kind()) in ('faculty', 'admin'));
create policy student_profiles_admin_insert on public.student_profiles for insert to authenticated
  with check ((select private.actor_kind()) = 'admin');
create policy student_profiles_admin_update on public.student_profiles for update to authenticated
  using ((select private.actor_kind()) = 'admin')
  with check ((select private.actor_kind()) = 'admin');

create policy reviews_faculty_read on public.reviews for select to authenticated
  using ((select private.actor_kind()) = 'faculty'
    and (status = 'active' or (status = 'hidden' and owner_id = (select auth.uid()))));

create policy review_versions_visible_parent on public.review_versions for select to authenticated
  using (exists (select 1 from public.reviews where reviews.id = review_versions.review_id));

create policy review_tags_visible_parent on public.review_tags for select to authenticated
  using (exists (select 1 from public.reviews where reviews.id = review_tags.review_id));

create policy review_attachments_visible_parent on public.review_attachments for select to authenticated
  using (exists (select 1 from public.reviews where reviews.id = review_attachments.review_id));

create policy tags_visible_active_review on public.tags for select to authenticated
  using (exists (
    select 1 from public.review_tags rt join public.reviews r on r.id = rt.review_id
    where rt.tag = tags.tag and r.status = 'active'
  ));

create policy queue_read on public.approval_queue_items for select to authenticated
  using ((select private.actor_kind()) = 'admin' or (
    submitted_by = (select auth.uid()) and (
      (select private.actor_kind()) = 'faculty' or
      ((select private.actor_kind()) = 'pending' and type = 'faculty_account')
    )
  ));
create policy queue_faculty_submit on public.approval_queue_items for insert to authenticated
  with check ((select private.actor_kind()) = 'faculty'
    and submitted_by = (select auth.uid())
    and type in ('student_registration', 'program_proposal', 'department_proposal'));

create policy audit_admin_read on public.audit_log_entries for select to authenticated
  using ((select private.actor_kind()) = 'admin');
