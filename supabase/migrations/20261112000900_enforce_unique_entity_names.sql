create unique index departments_name_unique_idx
  on public.departments (lower(btrim(name)));

create unique index programs_name_unique_idx
  on public.programs (lower(btrim(name)));
