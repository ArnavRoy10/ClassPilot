# ClassPilot production readiness

Use this checklist before inviting real coaching centers or accepting live payments. Items marked **manual** require a deployment owner to verify in Vercel, Supabase, Razorpay, Stripe, DNS, or a real mailbox.

## Verified in code

- [x] Authenticated routes refresh Supabase sessions and protect app, portal, founder, and admin paths.
- [x] Founder/admin operations use server-side authorization and do not expose service-role credentials to the browser.
- [x] Supabase-owned tables use RLS; founder-only tables also revoke direct Data API access from `anon` and `authenticated`.
- [x] Razorpay webhooks verify the raw-body HMAC signature before parsing and claim event IDs for duplicate delivery protection.
- [x] Razorpay checkout rejects missing configuration and detects test/live key prefixes.
- [x] Production response headers include content-type sniffing, referrer, HSTS, frame, permissions, and cross-origin protections.
- [x] The signup callback honors the Vercel preview redirect proxy when it is configured.

## Manual deployment checks

- [ ] **Environment variables:** configure production-only values for `NEXT_PUBLIC_SITE_URL`, Supabase URL/publishable key, server-only Supabase service role, Stripe keys, Razorpay keys/plan IDs/webhook secret, and Resend values. Never expose secret values through `NEXT_PUBLIC_*`.
- [ ] **Supabase Auth URLs:** set the deployed site URL and exact `/auth/callback` redirect allowlist, plus the Vercel preview redirect proxy where preview testing is required.
- [ ] **Razorpay:** create live plans, switch to `rzp_live_*` keys, configure the deployed webhook URL, use the matching live webhook secret, and run one controlled payment/cancellation test.
- [ ] **Stripe:** configure production webhook endpoint and signing secret if Stripe is enabled for the deployment; verify checkout and cancellation with test mode before live mode.
- [ ] **Domain and TLS:** verify the production domain, HTTPS certificate, apex/www redirect, and canonical URL metadata.
- [ ] **Email:** verify the Resend sending domain, SPF, DKIM, DMARC, reply-to address, and confirmation email delivery to a real mailbox.
- [ ] **Backups:** confirm Supabase backup/restore policy and perform a documented restore drill before storing real customer data.
- [ ] **Monitoring:** confirm Vercel logs, Supabase logs, payment provider webhook logs, and an alert path for failed payments/auth/email delivery.

## Real-world smoke test

- [ ] Sign up with a real mailbox, confirm email, and complete workspace setup.
- [ ] Create a student, batch, attendance entry, fee record, test, result, and announcement as an owner.
- [ ] Verify a teacher sees only permitted academic surfaces.
- [ ] Verify a student/parent portal sees only its own linked data.
- [ ] Verify a second organization cannot read or mutate the first organization's records.
- [ ] Verify billing limits, checkout, webhook update, cancellation, and renewal behavior.
- [ ] Verify founder lead creation, activity logging, organization linking, and deletion.
- [ ] Verify mobile and desktop layouts for auth, dashboard, billing, portal, and founder/admin paths.

## Release evidence

Record the deployment URL, commit or build identifier, date, tester, provider mode, and the result of every manual test above. Do not label the deployment production-ready until the manual and real-world sections are complete.
