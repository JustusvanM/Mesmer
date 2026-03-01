# Setup checklist — admission charging & cron

Use this to get everything checked so the join flow, admin emails, and monthly charging work.

---

## Already done

- [x] Stripe keys in `.env` (publishable + secret)
- [x] `CHARGE_ADMISSION_SECRET` in `.env` (your secret)
- [x] `SIGNUP_NOTIFY_EMAIL` in `.env` (admin signup emails)
- [x] Migrations exist: `admission_charged_at`, `charge-admission-monthly` cron

---

## Do these now

### 1. Supabase vault secrets (SQL Editor)

In **Supabase Dashboard → SQL Editor**, run these one by one.

**First:** get your Railway app URL (e.g. `https://your-app-name.up.railway.app` or your custom domain). Use that in the first statement.

```sql
-- Your Railway app URL (no trailing slash) — so the cron can call your API
select vault.create_secret(
  'https://YOUR_APP.up.railway.app',
  'app_url',
  'Next.js app root URL for POST /api/charge-admission'
);

-- Same value as CHARGE_ADMISSION_SECRET in .env
select vault.create_secret(
  'YOUR_CHARGE_ADMISSION_SECRET',
  'charge_admission_secret',
  'Bearer token for /api/charge-admission'
);
```

If you also use the **sync-mrr** cron, create these (replace with your real values):

```sql
select vault.create_secret(
  'https://yyrizvszrllpnkktaabr.supabase.co',
  'project_url',
  'Supabase project URL'
);

select vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD',
  'service_role_key',
  'Service role key'
);
```

- [ ] Created `app_url` in vault
- [ ] Created `charge_admission_secret` in vault

---

### 2. Apply migrations (if not already)

From the project root:

```bash
supabase db push
```

This applies `add_admission_charged_at` and `schedule_charge_admission_monthly` (the cron job).

- [ ] Ran `supabase db push`

---

### 3. Production env (Railway)

Add **the same** `CHARGE_ADMISSION_SECRET` so `/api/charge-admission` works when the cron calls it:

1. Open **Railway Dashboard** → your project → your service.
2. Go to **Variables** (or **Settings** → **Variables**).
3. Add a variable:
   - **Name:** `CHARGE_ADMISSION_SECRET`
   - **Value:** your actual secret (same as in .env)
4. Save; Railway will redeploy with the new env.

- [ ] Added `CHARGE_ADMISSION_SECRET` in Railway Variables

---

### 4. Optional: verify

- **Cron jobs:** Dashboard → **Integrations → Cron** → you should see `charge-admission-monthly` (and `sync-mrr-daily` if you use it).
- **Manual charge test** (from your machine or any terminal):

```bash
curl -X POST "https://YOUR_APP_URL/api/charge-admission" \
  -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET" \
  -H "Content-Type: application/json"
```

Expected: JSON like `{"charged":0,"failed":0,"total":0,"results":[]}` (or with numbers if you have startups to charge).

- [ ] Checked Cron jobs in dashboard
- [ ] (Optional) Tested charge-admission with curl

---

## Quick verification (after Railway deploy)

Replace `YOUR_RAILWAY_URL` with your real app URL (e.g. `https://yourapp.up.railway.app`), then run in a terminal:

```bash
curl -s -X POST "https://YOUR_RAILWAY_URL/api/charge-admission" \
  -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET" \
  -H "Content-Type: application/json"
```

**Everything is OK if you see one of these:**

| Response | Meaning |
|----------|---------|
| `{"charged":0,"failed":0,"message":"No startups with saved payment methods"}` | API works; no startups with cards yet. |
| `{"charged":0,"failed":0,"total":0,"message":"No startups due for a charge..."}` | API works; no one due this period. |
| `{"charged":N,"failed":M,"total":T,"results":[...]}` | API works; it charged (or tried) N+M startups. |

**Something is wrong if you see:**

| Response | Fix |
|----------|-----|
| `{"error":"Unauthorized"}` (401) | `CHARGE_ADMISSION_SECRET` in Railway doesn’t match (re-check Variables). |
| `{"error":"STRIPE_SECRET_KEY not configured"}` (503) | Add `STRIPE_SECRET_KEY` to Railway Variables. |
| Connection error / timeout | Check Railway URL and that the service is running. |

---

## Optional later

- **STRIPE_ENCRYPTION_SECRET:** Replace `dev_placeholder_...` in `.env` with a real value (`openssl rand -hex 32`) if you use the **sync-mrr** Edge Function for encrypted Stripe data.
- **Disable charging:** Run in SQL Editor: `select cron.unschedule('charge-admission-monthly');`

Once 1–3 are done, everything is set: join page saves cards, you get admin emails on signup, and on the **1st of each month at 03:00 UTC** the cron will charge admission (or you can run the API manually anytime).

---

## Is everything filled right? (quick check)

Use this to confirm all required config is set.

**Local `.env`:** SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, CHARGE_ADMISSION_SECRET, RESEND_API_KEY, SIGNUP_NOTIFY_EMAIL. Optional for join/charge: STRIPE_ENCRYPTION_SECRET (only needed for sync-mrr).

**Railway Variables:** Same CHARGE_ADMISSION_SECRET and STRIPE_SECRET_KEY (and any other Supabase/Resend vars your app uses in prod).

**Supabase vault:** `app_url` = https://www.gomesmer.com, `charge_admission_secret` = same as CHARGE_ADMISSION_SECRET.

**Cron:** Integrations → Cron → Jobs → `charge-admission-monthly` present.

**Test:** `curl -s -X POST "https://www.gomesmer.com/api/charge-admission" -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET"` → expect JSON, not 401/503.

---

## Files you don't need to track

- **.next/** — Build output. Added to `.gitignore`. To stop tracking it if already committed: `git rm -r --cached .next`
All app pages (join, contact, terms, privacy) and API routes are in use; nothing to remove.
