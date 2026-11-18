create table if not exists ballots (
  matric text primary key,
  choice text not null check (choice in ('studio', 'split')),
  finalized boolean not null default false,
  updated_at timestamptz not null default now()
);
