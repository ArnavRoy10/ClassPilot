-- Run this in Supabase Dashboard → SQL Editor
-- Adds support for owner-created teacher/student login accounts with granular "powers".
-- Safe to run more than once (all additions are guarded with IF NOT EXISTS).

alter table public.teachers
  add column if not exists permissions jsonb not null default '{}'::jsonb;

alter table public.students
  add column if not exists permissions jsonb not null default '{}'::jsonb;

-- Links a profile (login account) back to its teacher directory row.
alter table public.profiles
  add column if not exists teacher_id uuid references public.teachers(id) on delete cascade;

-- profiles.student_id is already used by the student portal; added defensively in case
-- this project's profiles table doesn't have it yet.
alter table public.profiles
  add column if not exists student_id uuid references public.students(id) on delete cascade;

create index if not exists profiles_teacher_id_idx on public.profiles (teacher_id);
create index if not exists profiles_student_id_idx on public.profiles (student_id);

-- Each teacher/student directory row should map to at most one login account.
create unique index if not exists profiles_teacher_id_unique on public.profiles (teacher_id) where teacher_id is not null;
create unique index if not exists profiles_student_id_unique on public.profiles (student_id) where student_id is not null;
