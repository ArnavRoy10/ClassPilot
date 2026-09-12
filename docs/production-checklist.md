# Production Checklist

## Environment validation
- Do not use `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` in production; auth callbacks use the current site origin.
- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin and register that exact URL plus `/auth/callback` in Supabase Auth redirect settings.
- Keep publishable/anon keys client-visible only; never expose `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, Razorpay secrets, or Resend keys to browser bundles.

## Required server variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and server-side Stripe price IDs
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `RAZORPAY_PLAN_*` values for Test Mode
- `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN`

## Before accepting customers
- Confirm Supabase RLS and grants on every public tenant table.
- Test ABC Academy versus XYZ Coaching with owner, admin, teacher, student, and parent accounts.
- Verify portal linked-student access and unpublished-result privacy.
- Register and test Stripe and Razorpay webhook endpoints with signature verification enabled.
- Confirm duplicate webhook delivery is harmless.
- Run typecheck and production build; lint is currently unavailable because no `lint` script exists. Complete browser smoke tests for login, signup, dashboard, portal, billing, and communications.
- Configure verified email sender DNS and provider rate limits.
- Review backups, retention, monitoring, and incident-response contacts.
