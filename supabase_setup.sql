-- =============================================
-- shakkin セットアップSQL
-- Supabase SQL Editorで全部貼り付けて実行する
-- =============================================

-- 1. テーブル作成（存在しない場合のみ）

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '名無し',
  avatar text not null default 'bear',
  created_at timestamptz default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exercise_name text not null,
  created_by uuid not null references auth.users(id),
  invite_code text not null unique,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  initial_reps integer not null default 10,
  start_date date not null,
  state text not null default 'normal',
  debt_balance integer not null default 0,
  savings_balance integer not null default 0,
  consecutive_clear_days integer not null default 0,
  total_cleared_reps integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, group_id)
);

create table if not exists rep_entries (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships(id) on delete cascade,
  date date not null,
  reps integer not null,
  created_at timestamptz default now()
);

-- 2. RLS有効化
alter table profiles enable row level security;
alter table groups enable row level security;
alter table memberships enable row level security;
alter table rep_entries enable row level security;

-- 3. RLSポリシー（一旦全部削除して再作成）

-- profiles
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- groups
drop policy if exists "groups_select" on groups;
drop policy if exists "groups_insert" on groups;
drop policy if exists "groups_delete" on groups;
create policy "groups_select" on groups for select using (true);
create policy "groups_insert" on groups for insert with check (auth.uid() = created_by);
create policy "groups_delete" on groups for delete using (auth.uid() = created_by);

-- memberships
drop policy if exists "memberships_select" on memberships;
drop policy if exists "memberships_insert" on memberships;
drop policy if exists "memberships_update" on memberships;
drop policy if exists "memberships_delete" on memberships;
create policy "memberships_select" on memberships for select using (true);
create policy "memberships_insert" on memberships for insert with check (auth.uid() = user_id);
create policy "memberships_update" on memberships for update using (auth.uid() = user_id);
create policy "memberships_delete" on memberships for delete using (auth.uid() = user_id);

-- rep_entries
drop policy if exists "rep_entries_select" on rep_entries;
drop policy if exists "rep_entries_insert" on rep_entries;
drop policy if exists "rep_entries_delete" on rep_entries;
create policy "rep_entries_select" on rep_entries for select using (true);
create policy "rep_entries_insert" on rep_entries for insert with check (
  auth.uid() = (select user_id from memberships where id = membership_id)
);
create policy "rep_entries_delete" on rep_entries for delete using (
  auth.uid() = (select user_id from memberships where id = membership_id)
);

-- 4. 確認
select 'OK: テーブルとRLSポリシーのセットアップ完了' as result;
select tablename, rowsecurity from pg_tables
  where schemaname = 'public'
  order by tablename;
