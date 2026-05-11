-- Run this in your Supabase SQL Editor

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('expense', 'income')),
  amount numeric not null,
  description text not null,
  date text not null,
  "createdAt" bigint not null,
  category text
);

-- Enable Row Level Security (RLS)
alter table public.transactions enable row level security;

-- Create a policy to allow all access for the anon key
drop policy if exists "Allow anonymous access" on public.transactions;
drop policy if exists "Allow all access" on public.transactions;

create policy "Allow all access" 
on public.transactions 
for all 
to anon 
using (true) 
with check (true);
