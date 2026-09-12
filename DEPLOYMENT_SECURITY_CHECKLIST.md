# Production Security Checklist

- [ ] Configure Stripe price IDs and webhook signing secret.
- [ ] If using Razorpay, configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `RAZORPAY_PLAN_SOLO`, `RAZORPAY_PLAN_STARTER`, `RAZORPAY_PLAN_GROWTH`, `RAZORPAY_PLAN_PRO` in Test Mode first.
- [ ] Register both webhook endpoints over HTTPS.
- [ ] Confirm Supabase RLS is enabled for every exposed application table.
- [ ] Test two organizations with separate owner, student, teacher, fee, result, timetable, and announcement records.
- [ ] Confirm non-owner users cannot access billing mutations.
- [ ] Confirm invalid webhook signatures and replayed event IDs are rejected or ignored.
- [ ] Run `pnpm exec tsc --noEmit` and resolve the remaining pre-existing errors before release.
- [ ] Review response headers on the deployed HTTPS origin.
