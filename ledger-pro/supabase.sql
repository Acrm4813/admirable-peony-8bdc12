-- Run once in Supabase: SQL Editor > New query > paste > Run
create table if not exists public.ledger (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.ledger enable row level security;
create policy "read own" on public.ledger for select using (auth.uid() = user_id);
create policy "insert own" on public.ledger for insert with check (auth.uid() = user_id);
create policy "update own" on public.ledger for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.ledger for delete using (auth.uid() = user_id);
