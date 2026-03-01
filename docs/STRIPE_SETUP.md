# Stripe setup — complete checklist

This doc ties the **Setup Intents** flow (save payment method, charge later) to your join flow and what you need to do.

---

## What’s already implemented

1. **SetupIntent (save card, no charge)**  
   - `POST /api/stripe-setup-intent` creates a SetupIntent with `usage: "off_session"` and `payment_method_types: ["card"]`.  
   - Join page uses Stripe Elements + `confirmSetup()` so the card is verified and we get a `payment_method` id.

2. **Customer + attach**  
   - After signup, `/api/onboard` creates a Stripe Customer (your Mesmer account), attaches the payment method, and saves `stripe_customer_id` and `stripe_payment_method_id` (and `admission_plan`: monthly or annual) in `startups`.

3. **Compliance**  
   - “Save my payment method for future use” checkbox and copy that we charge when the league starts.  
   - Terms of Service link for agreement.

- **Monthly plan:** Charge **$24** each time you run the API. We only charge if they have never been charged, or if their last charge (`admission_charged_at`) was **28+ days ago**. So run this on the **1st of every month** (e.g. via cron) and monthly subscribers get $24 charged each month.
- **Annual plan:** Charge **$228** once (12 months upfront). We only charge if `admission_charged_at` is null; after that they are never charged again by this endpoint until you add annual-renewal logic.

---

## What you need to do

### 1. Add Stripe API keys to `.env`

From [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys):

```env
# Publishable key (starts with pk_test_ or pk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Secret key (starts with sk_test_ or sk_live_) — never expose this
STRIPE_SECRET_KEY=sk_live_xxx
```

Use test keys (`pk_test_...`, `sk_test_...`) for local/testing; switch to live when you go live.

### 2. Run Supabase migrations

So that `startups` has the Stripe and admission columns:

```bash
supabase db push
```

Or run the SQL in the Supabase SQL editor (in order):

- `supabase/migrations/20250226100000_add_stripe_payment_method.sql` — `stripe_customer_id`, `stripe_payment_method_id`
- `supabase/migrations/20250226200000_add_admission_plan.sql` — `admission_plan` (monthly/annual)
- `supabase/migrations/20250227000000_add_admission_charged_at.sql` — `admission_charged_at` (avoid double-charge)

### 3. (Optional) Charge when league starts

Generate a secret and add it to `.env`:

```bash
openssl rand -hex 24
```

```env
CHARGE_ADMISSION_SECRET=that_hex_string
```

When you’re ready to charge (e.g. on the 1st when the league starts), you can either:

**Option A — Automatic (recommended):** Use the **Supabase cron** that runs on the **1st of every month at 03:00 UTC**. It POSTs to your Next.js `/api/charge-admission` with your secret. So monthly subscribers get **$24 charged every month** automatically; annual subscribers get **$228** once when due. See **`supabase/CRON_SETUP.md`**: add the vault secrets `app_url` (your Next.js app URL) and `charge_admission_secret` (same as `CHARGE_ADMISSION_SECRET` in .env), then run `supabase db push` so the `charge-admission-monthly` cron is scheduled.

**Option B — Manual:** Call the API yourself when you want to run a charge:

- **Charge all eligible startups:**
  ```bash
  curl -X POST https://your-domain.com/api/charge-admission \
    -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET" \
    -H "Content-Type: application/json"
  ```
- **Charge one startup:**
  ```bash
  curl -X POST https://your-domain.com/api/charge-admission \
    -H "Authorization: Bearer YOUR_CHARGE_ADMISSION_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"startupId": "uuid-of-startup"}'
  ```

Response includes `charged`, `failed`, `total`, and per-startup `results` (e.g. card declined → 402 from Stripe is in `results[].error`).

---

## User flow (summary)

1. User fills join form (company, email, logo, MRR Stripe key, monthly/annual, optional toggles).  
2. User enters card in the payment section and checks “Save my payment method for future use.”  
3. Submit → we confirm the SetupIntent (card verified, no charge), then onboard: create Customer, attach payment method, insert/update `startups` with `stripe_customer_id`, `stripe_payment_method_id`, `admission_plan`.  
4. When the league starts, call `/api/charge-admission` (e.g. on the 1st). **Monthly** subscribers are charged **$24**; we charge again next month if 28+ days have passed. **Annual** subscribers are charged **$228** once. We set `admission_charged_at` after each successful charge.

---

## Supabase tables (startups)

| Column | Purpose |
|--------|--------|
| `id`, `name`, `email`, `logo_url` | Onboarding |
| `stripe_api_key_encrypted`, `stripe_connected`, `current_mrr`, `mrr_last_updated_at` | Their Stripe (MRR verification + cron sync) |
| `stripe_customer_id`, `stripe_payment_method_id` | Your Stripe (admission: save card, charge later) |
| `admission_plan` | `'monthly'` or `'annual'` — determines charge amount |
| `admission_charged_at` | Set after first successful admission charge; null = not yet charged (avoids double-charge) |
| `is_anonymous`, `interested_in_accelerator` | Join form options |
| `current_league_id`, `league_band`, etc. | League system (future) |

Run all migrations so these columns exist.

---

## Could we do it easier?

- **Stripe Products/Prices** — You could create two Products (Monthly $24, Annual $228) and use Checkout or Payment Links. That would move “what to charge” into the Dashboard but add another layer. For “charge once when league starts” with two fixed amounts, the current approach (fixed amounts in code + PaymentIntent) is simpler.
- **Stripe Subscriptions** — If you wanted Stripe to auto-charge monthly/yearly, you’d use Subscriptions. Then you don’t run `/api/charge-admission` yourself; Stripe bills on a schedule. Your current “one charge when league starts” is simpler for now.
- **Single table** — Everything lives in `startups`; no extra tables needed for admission. When you add leagues (assigning startups to leagues), you might add more tables; for admission only, the current schema is enough.

---

## Stripe docs references

- [Setup Intents](https://docs.stripe.com/setup-intents) — save payment method without charging.  
- [Save a customer's payment method without making a payment](https://docs.stripe.com/payments/save-and-reuse) — Checkout Session in setup mode; we use Setup Intents + Elements for an embedded flow.  
- [Charge the payment method later](https://docs.stripe.com/payments/save-and-reuse#charge-the-payment-method-later) — PaymentIntent with `off_session: true`, `confirm: true`.
