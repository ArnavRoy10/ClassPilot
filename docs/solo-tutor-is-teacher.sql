-- Run this in Supabase Dashboard → SQL Editor
-- Makes a Solo Tutor organization's owner automatically act as their own
-- teacher record, so they can be assigned to classes/schedules/attendance
-- without needing the Teachers management page (which Solo Tutor doesn't get).

-- 1. Trigger: whenever a new owner profile is created for a solo_tutor org,
--    auto-create a matching teachers row and link it back to the profile.
create or replace function public.ensure_owner_is_teacher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_type text;
  new_teacher_id uuid;
begin
  if new.role = 'owner' and new.organization_id is not null and new.teacher_id is null then
    select type into org_type from public.organizations where id = new.organization_id;

    if org_type = 'solo_tutor' then
      insert into public.teachers (full_name, email, subject, status, organization_id)
      values (new.full_name, new.email, 'All subjects', 'active', new.organization_id)
      returning id into new_teacher_id;

      update public.profiles set teacher_id = new_teacher_id where id = new.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ensure_owner_is_teacher on public.profiles;
create trigger trg_ensure_owner_is_teacher
after insert on public.profiles
for each row
execute function public.ensure_owner_is_teacher();

-- 2. One-time backfill for Solo Tutor owners who signed up before this fix.
insert into public.teachers (full_name, email, subject, status, organization_id)
select p.full_name, p.email, 'All subjects', 'active', p.organization_id
from public.profiles p
join public.organizations o on o.id = p.organization_id
where p.role = 'owner'
  and p.teacher_id is null
  and o.type = 'solo_tutor';

update public.profiles p
set teacher_id = t.id
from public.teachers t
where p.role = 'owner'
  and p.teacher_id is null
  and t.organization_id = p.organization_id
  and t.full_name = p.full_name;
