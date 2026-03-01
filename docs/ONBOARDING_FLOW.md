# Onboarding Flow

Production-safe flow: form → Stripe MRR fetch → encrypt key → store in Supabase → redirect.

## Flow Summary

1. User submits form at `/join` (company name, email, logo, Stripe API key, and — when configured — card for admission fee verification)
2. Form POSTs to `/api/onboard` (no Stripe key in URL or logs)
3. Backend validates Stripe key, fetches MRR from Stripe, encrypts key; when Mesmer Stripe is configured, creates Customer and saves payment method; inserts into `startups`
4. On success → redirect to `/join/confirmed` (you're in; league starts 1st of next month)

## Stripe key (read-only, revenue pull)

We pull revenue using the user’s **Stripe Restricted API key** so we never need full account access.

- **Format**: Must be a **restricted** key starting with `rk_live_` (live) or `rk_test_` (test). Production form accepts only `rk_live_`.
- **Permission**: The key must have **Subscriptions: Read**. Create it in Stripe Dashboard → Developers → API keys → **Restricted keys** → add permission “Subscriptions: Read”.
- **What we do**: We list all active subscriptions (with pagination), sum recurring revenue, and store encrypted key + current MRR. Revenue is **updated** automatically by the daily `sync-mrr` job so MRR stays correct over time.

## Admission fee (Mesmer Stripe)

When `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are set (your Mesmer Stripe account), the join page shows a card verification step (SetupIntent). No charge at signup — we only verify the card; we charge the admission fee when the league starts on the 1st. See `.env.example` for those keys.

## Security

- **Stripe key**: Never logged, never returned, only used server-side
- **Supabase service role**: Used only in API route, never sent to client
- **Encryption**: AES-256-GCM for Stripe key at rest

## Setup

### 1. Generate encryption secret

```bash
openssl rand -hex 32
```

Add to `.env`:

```
STRIPE_ENCRYPTION_SECRET=<your-generated-secret>
```

### 2. Supabase Storage (logos bucket)

The API creates the `logos` bucket automatically on first upload. To create it manually in the dashboard:

- Storage → New bucket → name: `logos`
- Public bucket: Yes (for logo URLs)
- File size limit: 2MB
- Allowed MIME types: `image/*`

### 3. Supabase API keys

For the API route, ensure `SUPABASE_SERVICE_ROLE_KEY` in `.env` is the **service_role** JWT from Project Settings → API (starts with `eyJ...`). The anon key is for client-side only.

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000/join` to test.

## Scheduled MRR Sync

A separate Edge Function `sync-mrr` runs daily at 02:00 UTC to refresh MRR for all Stripe-connected startups. See `supabase/CRON_SETUP.md` for setup.

---

## Future: Leagues

When leagues launch:

- Remove redirect from API route
- After insert, assign startup to league by MRR band
- Reuse same Stripe + encryption logic
