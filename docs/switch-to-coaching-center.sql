-- Run this in Supabase Dashboard → SQL Editor
-- One-time fix: switches your organization from Solo Tutor to Coaching Center,
-- so the Teachers tab stops redirecting to Dashboard.

-- 1. First find your organization id (replace with your login email):
select o.id, o.name, o.type, o.plan
from organizations o
join profiles p on p.organization_id = o.id
where p.email = 'YOUR_LOGIN_EMAIL_HERE';

-- 2. Once you have the id from step 1, update it (replace the id below):
update organizations
set type = 'coaching_center',
    plan = 'Starter',
    max_teachers = 15
where id = 'PASTE_ORGANIZATION_ID_HERE';
