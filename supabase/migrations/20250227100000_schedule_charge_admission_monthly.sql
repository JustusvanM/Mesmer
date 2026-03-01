-- Run charge-admission on the 1st of every month at 03:00 UTC.
-- This charges monthly-plan startups $24 (if 28+ days since last charge) and annual-plan startups $228 once.
-- Prerequisite: Create vault secrets app_url and charge_admission_secret (see CRON_SETUP.md).

select cron.schedule(
  'charge-admission-monthly',
  '0 3 1 * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/charge-admission',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'charge_admission_secret')
    ),
    body := jsonb_build_object(),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);
