# Cron Setup for MRR Sync and Charge Admission

**Prerequisites:** Enable `pg_cron`, `pg_net`, and `vault` extensions in Dashboard → Database → Extensions (if not already enabled).

---

## When does the monthly charge run?

**Only when you enable it.** The cron job is created by the migration, but it **won’t do anything useful** until you:

1. Add **`CHARGE_ADMISSION_SECRET`** to your `.env` (generate with `openssl rand -hex 24`, paste the value).
2. Add the **vault secrets** in Supabase (`app_url` and `charge_admission_secret` — same value as in .env).

Until then, either the cron doesn’t run successfully (missing vault secrets) or your API rejects the request (missing or wrong secret in .env). So **you choose when to “go live”** by adding those when you’re ready to start charging. You can run the migration anytime; the first time the cron will actually charge people is the **1st of the next month at 03:00 UTC** after you’ve set the vault secrets. You can also **run the charge manually** anytime with curl (see Verify section) without waiting for the 1st.

---

## 1. Vault secrets (all cron jobs)

In the **Supabase SQL Editor**, run (replace with your actual values):

```sql
-- Your Supabase project URL (for Edge Function invocation)
select vault.create_secret(
  'https://yyrizvszrllpnkktaabr.supabase.co',
  'project_url',
  'Supabase project URL for Edge Function invocation'
);

-- Your service role key (from Project Settings → API)
select vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY_HERE',
  'service_role_key',
  'Service role key for Edge Function auth'
);

-- Your Next.js app URL (e.g. https://yourapp.vercel.app) — for charge-admission monthly cron
select vault.create_secret(
  'https://YOUR_NEXT_APP_URL.vercel.app',
  'app_url',
  'Next.js app root URL for POST /api/charge-admission'
);

-- Same value as CHARGE_ADMISSION_SECRET in your .env — used by monthly charge cron
select vault.create_secret(
  'YOUR_CHARGE_ADMISSION_SECRET_FROM_ENV',
  'charge_admission_secret',
  'Bearer token for /api/charge-admission'
);
```

---

## 2. sync-mrr (daily)

The `sync-mrr` function needs `STRIPE_ENCRYPTION_SECRET` (same as your Next.js app):

```bash
supabase secrets set STRIPE_ENCRYPTION_SECRET=your_encryption_secret
```

Or via Dashboard: **Edge Functions** → **sync-mrr** → **Secrets**.

## 3. Deploy the Edge Function

```bash
supabase functions deploy sync-mrr
```

## 4. Run migrations

If not already applied:

```bash
supabase db push
```

This includes:
- `sync-mrr-daily` — runs at 02:00 UTC every day
- `charge-admission-monthly` — runs at **03:00 UTC on the 1st of every month** and POSTs to your Next.js app `/api/charge-admission`, so monthly subscribers get $24 charged automatically and annual subscribers get $228 once when due

## 5. Verify

- **Cron jobs**: Dashboard → Integrations → Cron → Jobs (you should see `sync-mrr-daily` and `charge-admission-monthly`)
- **Manual test (sync-mrr)**: Invoke the function from the Edge Functions dashboard or:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-mrr" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

- **Manual test (charge-admission)**: Run the API with your secret (same as when league starts):

```bash
curl -X POST "https://YOUR_NEXT_APP_URL/api/charge-admission" \
  -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET" \
  -H "Content-Type: application/json"
```

Expected: `{"charged":N,"failed":M,"total":T,"results":[...]}`
