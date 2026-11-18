alter table ballots add column if not exists notice_state text;

create table if not exists ballot_mail (
  id integer primary key check (id = 1),
  mode text not null default 'unknown',
  detail text not null default '',
  updated_at timestamptz not null default now()
);

insert into ballot_mail (id, mode, detail)
values (1, 'unknown', '')
on conflict (id) do nothing;
