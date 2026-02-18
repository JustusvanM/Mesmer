-- Enable extensions for cron and HTTP (enable via Dashboard if migration fails)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule sync-mrr Edge Function daily at 02:00 UTC
-- Prerequisite: Run vault setup (see CRON_SETUP.md) before first run
select cron.schedule(
  'sync-mrr-daily',
  '0 2 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/sync-mrr',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := jsonb_build_object(),
    timeout_milliseconds := 60000
  ) as request_id;
  $$
);
