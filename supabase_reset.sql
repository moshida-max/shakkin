-- =============================
-- shakkin 完全リセット & 再セットアップ
-- Supabase SQL Editorで実行する
-- =============================

-- 既存テーブルを削除（順番重要）
drop table if exists rep_entries cascade;
drop table if exists memberships cascade;
drop table if exists groups cascade;
drop table if exists profiles cascade;

-- ★ auth.usersへのFK不要（ログインなし設計）

create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default '名無し',
  avatar text not null default 'bear',
  created_at timestamptz default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exercise_name text not null,
  created_by uuid not null,
  invite_code text not null unique,
  created_at timestamptz default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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

create table rep_entries (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships(id) on delete cascade,
  date date not null,
  reps integer not null,
  created_at timestamptz default now()
);

-- RLS有効化（全テーブル）
alter table profiles enable row level security;
alter table groups enable row level security;
alter table memberships enable row level security;
alter table rep_entries enable row level security;

-- 全操作を許可（ログインなしアプリのため）
create policy "allow_all" on profiles for all using (true) with check (true);
create policy "allow_all" on groups for all using (true) with check (true);
create policy "allow_all" on memberships for all using (true) with check (true);
create policy "allow_all" on rep_entries for all using (true) with check (true);

-- 確認
select 'セットアップ完了！' as result;
