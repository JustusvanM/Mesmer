# Cron Setup for MRR Sync

The `sync-mrr` Edge Function runs daily at 02:00 UTC via pg_cron. Before it can run, you must:

**Prerequisites:** Enable `pg_cron`, `pg_net`, and `vault` extensions in Dashboard → Database → Extensions (if not already enabled).

## 1. Create Vault Secrets

In the **Supabase SQL Editor**, run (replace with your actual values):

```sql
-- Your project URL (e.g. https://yyrizvszrllpnkktaabr.supabase.co)
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
```

## 2. Set Edge Function Secrets

The `sync-mrr` function needs `STRIPE_ENCRYPTION_SECRET` (same as your Next.js app):

```bash
supabase secrets set STRIPE_ENCRYPTION_SECRET=your_encryption_secret
```

Or via Dashboard: **Edge Functions** → **sync-mrr** → **Secrets**.

## 3. Deploy the Edge Function

```bash
supabase functions deploy sync-mrr
```

## 4. Run the Migration

If not already applied:

```bash
supabase db push
```

Or run the migration SQL manually in the SQL Editor.

## 5. Verify

- **Cron jobs**: Dashboard → Integrations → Cron → Jobs
- **Manual test**: Invoke the function from the Edge Functions dashboard or:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-mrr" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Expected response: `{"processed":N,"updated":M,"failed":Z}`
