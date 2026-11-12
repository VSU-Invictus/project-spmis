create extension if not exists vector with schema extensions;

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) <= 200 and name ~ '[^[:space:]]'),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  proposed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (like public.departments including all);

create table public.faculty_profiles (
  id uuid primary key references auth.users (id),
  email text not null unique,
  full_name text not null check (char_length(full_name) <= 200 and full_name ~ '[^[:space:]]'),
  department_id uuid not null references public.departments (id),
  role text not null default 'faculty' check (role in ('faculty', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departments add foreign key (proposed_by) references public.faculty_profiles (id);
alter table public.programs add foreign key (proposed_by) references public.faculty_profiles (id);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id_number text not null unique
    check (char_length(student_id_number) <= 50 and student_id_number ~ '[^[:space:]]'),
  first_name text not null check (char_length(first_name) <= 200 and first_name ~ '[^[:space:]]'),
  last_name text not null check (char_length(last_name) <= 200 and last_name ~ '[^[:space:]]'),
  middle_name text,
  program_id uuid not null references public.programs (id),
  registration_source text not null default 'admin_direct'
    check (registration_source in ('admin_direct', 'faculty_applied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id),
  owner_id uuid not null references public.faculty_profiles (id),
  body_text text not null check (body_text ~ '[^[:space:]]'),
  body_document jsonb not null check (jsonb_typeof(body_document) = 'object'),
  deidentified_text text not null,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_versions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id),
  body_text_snapshot text not null,
  body_document_snapshot jsonb not null check (jsonb_typeof(body_document_snapshot) = 'object'),
  tags_snapshot text[] not null default '{}',
  edited_by uuid not null references public.faculty_profiles (id),
  edited_at timestamptz not null default now()
);

create table public.tags (
  tag text primary key check (char_length(tag) between 1 and 50 and tag = lower(tag) and tag !~ '[[:space:]]')
);

create table public.review_tags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id),
  tag text not null references public.tags (tag),
  unique (review_id, tag)
);

create table public.review_embeddings (
  review_id uuid primary key references public.reviews (id),
  embedding extensions.vector not null,
  generated_at timestamptz not null default now()
);

create table public.review_attachments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id),
  storage_path text not null unique check (storage_path ~ '[^[:space:]]'),
  mime_type text not null check (mime_type ~ '[^[:space:]]'),
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table public.approval_queue_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('faculty_account', 'student_registration', 'program_proposal', 'department_proposal')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  submitted_by uuid references public.faculty_profiles (id) default auth.uid(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by uuid references public.faculty_profiles (id),
  decision_reason text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  check (
    (status = 'pending' and decided_by is null and decided_at is null and decision_reason is null)
    or (status = 'approved' and decided_by is not null and decided_at is not null)
    or (status = 'rejected' and decided_by is not null and decided_at is not null
        and decision_reason is not null and decision_reason ~ '[^[:space:]]')
  )
);

create table public.audit_log_entries (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.faculty_profiles (id),
  actor_role text not null check (actor_role in ('faculty', 'admin', 'system')),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb check (metadata is null or jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.faculty_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.review_versions enable row level security;
alter table public.tags enable row level security;
alter table public.review_tags enable row level security;
alter table public.review_embeddings enable row level security;
alter table public.review_attachments enable row level security;
alter table public.approval_queue_items enable row level security;
alter table public.audit_log_entries enable row level security;
