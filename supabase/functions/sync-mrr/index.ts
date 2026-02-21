import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
import scrypt from "npm:scrypt-js@3.0.1";

const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

interface StartupRow {
  id: string;
  stripe_api_key_encrypted: string | null;
}

interface SyncResult {
  processed: number;
  updated: number;
  failed: number;
}

/**
 * Decrypt a Stripe key encrypted with Node's encrypt() (AES-256-GCM + scrypt).
 * Compatible with lib/encryption.ts format.
 */
async function decrypt(
  ciphertext: string,
  secret: string
): Promise<string> {
  const combined = Uint8Array.from(
    atob(ciphertext),
    (c) => c.charCodeAt(0)
  );

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const secretBytes = new TextEncoder().encode(secret.normalize("NFKC"));
  const saltArr = Array.from(salt);
  const keyBytes = scrypt.syncScrypt(
    secretBytes,
    saltArr,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    KEY_LENGTH
  );

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const ciphertextWithTag = new Uint8Array(encrypted.length + authTag.length);
  ciphertextWithTag.set(encrypted);
  ciphertextWithTag.set(authTag, encrypted.length);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: TAG_LENGTH * 8,
    },
    key,
    ciphertextWithTag
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Compute MRR from Stripe subscriptions.
 */
function computeMrr(subscriptions: Stripe.Subscription[]): number {
  let totalCents = 0;

  for (const sub of subscriptions) {
    const items = sub.items?.data ?? [];
    for (const item of items) {
      const price = item.price;
      if (!price?.recurring) continue;

      const unitAmount = price.unit_amount ?? 0;
      const quantity = item.quantity ?? 1;
      const interval = price.recurring.interval;
      const intervalCount = price.recurring.interval_count ?? 1;

      let monthlyMultiplier: number;
      if (interval === "month") {
        monthlyMultiplier = 1 / intervalCount;
      } else if (interval === "year") {
        monthlyMultiplier = 1 / (12 * intervalCount);
      } else if (interval === "week") {
        monthlyMultiplier = (4 + 1 / 3) / intervalCount;
      } else if (interval === "day") {
        monthlyMultiplier = 30 / intervalCount;
      } else {
        continue;
      }

      const itemMonthlyCents = Math.round(
        unitAmount * quantity * monthlyMultiplier
      );
      totalCents += itemMonthlyCents;
    }
  }

  const mrrDollars = totalCents / 100;
  return Math.round(mrrDollars);
}

Deno.serve(async (req: Request): Promise<Response> => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const encryptionSecret = Deno.env.get("STRIPE_ENCRYPTION_SECRET");

  if (!url || !serviceRoleKey || !encryptionSecret) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(url, serviceRoleKey);
  const result: SyncResult = { processed: 0, updated: 0, failed: 0 };

  try {
    const { data: startups, error: fetchError } = await supabase
      .from("startups")
      .select("id, stripe_api_key_encrypted")
      .eq("stripe_connected", true);

    if (fetchError) {
      console.error("Failed to fetch startups:", fetchError.message);
      return new Response(
        JSON.stringify({ error: "Database query failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const rows = (startups ?? []) as StartupRow[];

    for (const row of rows) {
      result.processed += 1;

      if (!row.stripe_api_key_encrypted) {
        result.failed += 1;
        await supabase
          .from("startups")
          .update({ stripe_connected: false })
          .eq("id", row.id);
        console.error(`Startup ${row.id}: No encrypted key stored`);
        continue;
      }

      let stripeKey: string;
      try {
        stripeKey = await decrypt(row.stripe_api_key_encrypted, encryptionSecret);
      } catch (err) {
        result.failed += 1;
        await supabase
          .from("startups")
          .update({ stripe_connected: false })
          .eq("id", row.id);
        console.error(`Startup ${row.id}: Decrypt failed`);
        continue;
      }

      let mrr: number;
      try {
        const stripe = new Stripe(stripeKey, {
          apiVersion: "2026-01-28.clover",
        });

        const allSubs: Stripe.Subscription[] = [];
        for await (const sub of stripe.subscriptions.list({
          status: "active",
          expand: ["data.items", "data.items.data.price"],
          limit: 100,
        })) {
          allSubs.push(sub);
        }
        mrr = computeMrr(allSubs);
      } catch (err) {
        result.failed += 1;
        await supabase
          .from("startups")
          .update({ stripe_connected: false })
          .eq("id", row.id);
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Startup ${row.id}: Stripe failed - ${msg}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from("startups")
        .update({
          current_mrr: mrr,
          mrr_last_updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        result.failed += 1;
        console.error(`Startup ${row.id}: Update failed - ${updateError.message}`);
      } else {
        result.updated += 1;
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({ error: "Sync failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
