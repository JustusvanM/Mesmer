import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with service role. Use ONLY on the server.
 * Never expose this client or its key to the client bundle.
 */
export function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key);
}
