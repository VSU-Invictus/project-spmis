-- Synthetic fixtures for local development and permission checks.
insert into public.departments (id, name) values
  ('10000000-0000-4000-8000-000000000001', 'Example Computing'),
  ('10000000-0000-4000-8000-000000000002', 'Example Mathematics');

insert into public.programs (id, name, status) values
  ('20000000-0000-4000-8000-000000000001', 'Example Computer Science', 'approved'),
  ('20000000-0000-4000-8000-000000000002', 'Example Pending Program', 'pending');

insert into auth.users (id, aud, role, email, email_confirmed_at)
values
  ('30000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner@example.test', now()),
  ('30000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'faculty@example.test', now()),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'pending@example.test', now()),
  ('30000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'admin@example.test', now());

insert into public.faculty_profiles (id, email, full_name, department_id, role, status)
values
  ('30000000-0000-4000-8000-000000000001', 'owner@example.test', 'Example Owner', '10000000-0000-4000-8000-000000000001', 'faculty', 'active'),
  ('30000000-0000-4000-8000-000000000002', 'faculty@example.test', 'Example Faculty', '10000000-0000-4000-8000-000000000002', 'faculty', 'active'),
  ('30000000-0000-4000-8000-000000000003', 'pending@example.test', 'Example Pending Faculty', '10000000-0000-4000-8000-000000000001', 'faculty', 'pending'),
  ('30000000-0000-4000-8000-000000000004', 'admin@example.test', 'Example Admin', '10000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.student_profiles (id, student_id_number, first_name, last_name, program_id)
values
  ('40000000-0000-4000-8000-000000000001', 'TEST-001', 'Example', 'Student One', '20000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', 'TEST-002', 'Example', 'Student Two', '20000000-0000-4000-8000-000000000001');

insert into public.reviews (id, student_id, owner_id, status, body_text, body_document, deidentified_text)
select fixture.id::uuid, '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
  fixture.status, fixture.body,
  jsonb_build_object('blocks', jsonb_build_array(jsonb_build_object(
    'type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('text', fixture.body))
  ))),
  fixture.body
from (values
  ('50000000-0000-4000-8000-000000000001', 'active', 'Synthetic research review.'),
  ('50000000-0000-4000-8000-000000000002', 'hidden', 'Synthetic private review.'),
  ('50000000-0000-4000-8000-000000000003', 'deleted', 'Synthetic deleted review.')
) as fixture(id, status, body);

insert into public.tags (tag) values ('research'), ('hidden-test');
insert into public.review_tags (review_id, tag) values
  ('50000000-0000-4000-8000-000000000001', 'research'),
  ('50000000-0000-4000-8000-000000000002', 'hidden-test');

insert into public.review_attachments (review_id, storage_path, mime_type, size_bytes)
values ('50000000-0000-4000-8000-000000000001', 'fixtures/example.pdf', 'application/pdf', 100);

insert into public.approval_queue_items (type, submitted_by, payload) values
  ('faculty_account', '30000000-0000-4000-8000-000000000003',
   '{"full_name":"Example Pending Faculty","email":"pending@example.test","department_id":"10000000-0000-4000-8000-000000000001"}'),
  ('program_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Example Proposed Program"}'),
  ('department_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Example Proposed Department"}'),
  ('student_registration', '30000000-0000-4000-8000-000000000001',
   '{"student_id_number":"TEST-003","first_name":"Example","last_name":"Applicant","program_id":"20000000-0000-4000-8000-000000000001"}');

insert into public.approval_queue_items (type, submitted_by, payload, status, decided_by, decided_at, decision_reason)
values ('program_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Example Rejected Program"}',
        'rejected', '30000000-0000-4000-8000-000000000004', now(), 'Synthetic rejection reason'),
       ('department_proposal', '30000000-0000-4000-8000-000000000001', '{"name":"Example Approved Department"}',
        'approved', '30000000-0000-4000-8000-000000000004', now(), null);
