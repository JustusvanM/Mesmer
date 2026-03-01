# Security: API keys and secrets

## What is safe on the frontend (client)

Only **one** value is intentionally exposed to the browser:

- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** — Stripe’s **publishable** key (`pk_live_...` or `pk_test_...`). It is designed to be public. It can only create payment methods and SetupIntents; it cannot charge cards or access your Stripe account.

Everything else (Stripe secret key, Supabase keys, Resend, charge-admission secret, etc.) is **server-only** and must never be in client code or in `NEXT_PUBLIC_*` env vars.

---

## Server-only (never in frontend)

These are read only in API routes or server code (e.g. `lib/supabase-server.ts`). They are **never** sent to the browser or bundled into client JS:

| Env var | Used in | Purpose |
|--------|--------|--------|
| `STRIPE_SECRET_KEY` | stripe-setup-intent, onboard, charge-admission | Create SetupIntents, create customers, charge admission |
| `SUPABASE_URL` | lib/supabase-server | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | lib/supabase-server | Server-side Supabase (bypass RLS) |
| `SUPABASE_ANON_KEY` | (not used in this app) | Would be client-safe; we use service role only on server |
| `RESEND_API_KEY` | contact, onboard | Send emails |
| `RESEND_FROM_EMAIL` | contact, onboard | From address |
| `SIGNUP_NOTIFY_EMAIL` | onboard | Admin signup notifications |
| `STRIPE_ENCRYPTION_SECRET` | onboard, sync-mrr | Encrypt/decrypt user Stripe keys at rest |
| `CHARGE_ADMISSION_SECRET` | charge-admission API | Bearer auth for cron / manual charge |

---

## User-provided data (join form)

- **User’s Stripe restricted key (`rk_live_...`)** — Entered in the join form and sent to the server via POST. It is **not** stored in localStorage or in any client storage. The server uses it only to verify MRR and then stores it encrypted. Do not log it or expose it in responses.
- **Payment method** — Card details are handled by Stripe.js (PCI-safe); only a payment method ID is sent to our server.

---

## Checklist

- [x] No secret keys in frontend code; only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is used on the client.
- [x] `.env` is in `.gitignore`; no real secrets in the repo or in docs (placeholders only).
- [x] Charge-admission API is protected by `CHARGE_ADMISSION_SECRET` (Bearer).
- [x] User’s Stripe key is not persisted in localStorage.
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are set in `next.config.mjs`.

---

## If you add new env vars

- **Client-visible:** Use the `NEXT_PUBLIC_` prefix only for values that are safe to be public (e.g. another publishable key or a public URL).
- **Secrets (API keys, passwords, tokens):** Do **not** use `NEXT_PUBLIC_`. Use them only in API routes, Server Components, or `lib/` code that is never imported by client components.
