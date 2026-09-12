# ClassPilot Production Security Audit

## 2026-09-08 hardening pass
- Removed the development-only Supabase redirect override from signup.
- Added explicit Supabase client configuration guards for server and browser clients.
- Removed `images.unoptimized` so production image optimization is not disabled globally.
- Confirmed secrets remain server-only in payment, admin Supabase, and email routes.
- Remaining release gates are operational: configure canonical HTTPS redirects, verify Supabase Auth allowlists, test RLS with two organizations, register payment webhooks, and validate provider DNS/rate limits.

## Scope
This audit covers the existing Next.js App Router, Supabase multi-tenant data access, authentication boundaries, billing webhooks, communication sending, and production configuration. The existing UI and architecture were preserved.

## Fixes applied
- Removed the public Supabase URL from the server-only service-role client configuration.
- Sanitized billing, communication, and Razorpay error responses so provider/database details are not returned to browsers.
- Made Razorpay webhook parsing fail closed and require the provider event ID before idempotency claiming.
- Preserved signed webhook verification and owner-only billing creation.
- Preserved organization-scoped communication queries and RLS-backed message storage.
- Added baseline response security headers in `next.config.mjs`.

## Database and RLS
Subscription, webhook-event, communication-message, communication-recipient, and message-template tables are organization-scoped and use RLS. Webhook event IDs are unique to prevent duplicate subscription mutations. Before launch, review every existing public table with Supabase advisors and confirm policies cover SELECT, INSERT, UPDATE, and DELETE for each role.

## Remaining risks
The repository contains legacy client-side CRUD pages that should be migrated to server actions or authenticated route handlers before accepting untrusted organization IDs. Portal-specific linked-student policies must be verified against the live schema and tested with two real tenants. Razorpay requires test credentials, plan IDs, and a registered webhook endpoint; Stripe requires its webhook secret and price IDs.

## Onboarding and conversion pass
- Refined the homepage positioning around the day-to-day operating system for coaching centers.
- Clarified pricing language around the 14-day trial, no-card start, and plan changes.
- Added a real first-login setup checklist driven by tenant-scoped student, teacher, and batch counts.
- Replaced the legacy sample-data banner with truthful workspace setup guidance.
- The checklist is skippable in-session and disappears automatically once the workspace has its core records.

## QA remediation pass
- Added a server-side auth gate to the application layout so authenticated pages cannot render without a valid organization-backed context.
- Expanded proxy protection to include nested routes, `/communications`, and `/portal`, avoiding prefix collisions such as `/settings-old`.
- Fixed Razorpay webhook idempotency handling so database failures are not treated as duplicate events.
- Sanitized message-template errors and fail the message queue when recipient persistence fails.

## Public launch surfaces
- Repaired footer links for contact, privacy, terms, security, and data policy.
- Added clearly labeled privacy, terms, and security pages with contact paths for review before publishing as final legal policy.
- Updated root metadata, canonical URL support, Open Graph, Twitter card, and keyword metadata.
- Removed misleading sample-data/product claims from the public footer copy.

## Founder console
- Added `/founder`, a server-rendered, read-only operations view for explicitly allowlisted founder emails.
- Added `FOUNDER_ADMIN_EMAILS` as a server-only comma-separated allowlist; the route redirects non-allowlisted users to login.
- Founder queries use the Supabase service-role client only on the server and never expose that credential to the browser.
- Added `founder_admin_audit_logs` with forced RLS, no client grants, and service-role-only writes for access auditing.
- The console reports organizations, profiles, active/trial subscriptions, and recent admin events without adding customer-data mutation controls.

## Product analytics
- Added organization-scoped `product_events` with forced RLS, actor scoping, milestone deduplication, and indexes.
- Instrumented student creation and attendance recording as the first meaningful activation events; failures are non-blocking and never include secrets or message content.
- Added founder event totals and a customer-health view with New, Active, At Risk, and Inactive thresholds.
- Supabase catalog verification confirmed `product_events` exists with row security and forced row security enabled.

## Verification status
- `pnpm exec tsc --noEmit`: passed.
- `pnpm run build`: passed with the Next.js 16 middleware-to-proxy deprecation warning.
- `pnpm run lint`: unavailable because the project has no `lint` script.
- Browser smoke test: protected `/communications` redirected to `/login?next=%2Fcommunications`; mobile login rendered successfully at 390x844 in dark mode.
- Still required before launch: authenticated two-tenant testing using ABC Academy and XYZ Coaching; reads, updates, deletes, exports, portal results, notifications, and billing must never cross organization boundaries.
