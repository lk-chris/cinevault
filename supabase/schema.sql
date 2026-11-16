-- ========================================================
-- Cinevault Complete Database Schema & Security Setup
-- ========================================================

-- 1. PROFILES TABLE (Must be created first)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. AUTO-SYNC NEW USERS TO PROFILES
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. IS_ADMIN HELPER FUNCTION
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and not coalesce(disabled, false)
  );
$$;

-- 4. PROFILES RLS POLICIES
alter table public.profiles enable row level security;

drop policy if exists "own or admin read" on public.profiles;
create policy "own or admin read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "admin edit" on public.profiles;
create policy "admin edit"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "admin all" on public.profiles;
create policy "admin all"
  on public.profiles for all
  using (public.is_admin());

-- 5. AI USAGE TABLE & POLICIES
create table if not exists public.ai_usage (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  prompt text,
  model text,
  tokens_in int default 0,
  tokens_out int default 0,
  latency_ms int default 0,
  ok boolean default true,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

drop policy if exists "admin read usage" on public.ai_usage;
create policy "admin read usage"
  on public.ai_usage for select
  using (public.is_admin());

drop policy if exists "allow insert ai_usage" on public.ai_usage;
create policy "allow insert ai_usage"
  on public.ai_usage for insert
  with check (true);

-- 6. REVIEWS TABLE & POLICIES
create table if not exists public.reviews (
  id bigserial primary key,
  title text not null,
  rating numeric not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "anyone can submit reviews" on public.reviews;
create policy "anyone can submit reviews"
  on public.reviews for insert
  with check (true);

drop policy if exists "read approved or admin" on public.reviews;
create policy "read approved or admin"
  on public.reviews for select
  using (status = 'approved' or public.is_admin());

drop policy if exists "admin manage reviews" on public.reviews;
create policy "admin manage reviews"
  on public.reviews for all
  using (public.is_admin());

-- 7. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
notify pgrst, 'reload schema';
