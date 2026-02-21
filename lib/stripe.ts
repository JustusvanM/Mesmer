import Stripe from "stripe";

/**
 * Fetch active subscriptions and compute monthly recurring revenue (MRR) in USD.
 * Uses the user's Stripe restricted (read-only) key.
 *
 * Required key: Stripe Restricted API key (rk_live_... or rk_test_...) with
 * "Subscriptions: Read" permission so we can list subscriptions and pull revenue.
 * Create under: Stripe Dashboard → Developers → API keys → Restricted keys.
 *
 * Logic:
 * - Fetches all active subscriptions (paginated) so revenue is complete.
 * - Only recurring prices; one-time charges are excluded.
 * - interval = "year" → divide by 12 for monthly equivalent
 * - interval = "month" → use as-is
 * - interval = "week" → multiply by ~4.33 for monthly
 * - unit_amount (cents) × quantity → convert to dollars
 */
export async function fetchMrrFromStripe(stripeApiKey: string): Promise<number> {
  if (!stripeApiKey || typeof stripeApiKey !== "string") {
    throw new Error("Invalid Stripe API key");
  }

  const trimmed = stripeApiKey.trim();
  const isRestrictedKey =
    trimmed.startsWith("rk_live_") || trimmed.startsWith("rk_test_");
  if (!isRestrictedKey) {
    throw new Error(
      "Use a Stripe restricted key (rk_live_... or rk_test_...) with Subscriptions: Read. Create one under Developers → API keys → Restricted keys."
    );
  }

  const stripe = new Stripe(trimmed, { apiVersion: "2026-01-28.clover" });

  const subscriptions: Stripe.Subscription[] = [];
  try {
    for await (const sub of stripe.subscriptions.list({
      status: "active",
      expand: ["data.items", "data.items.data.price"],
      limit: 100,
    })) {
      subscriptions.push(sub);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe API request failed";
    if (
      message.includes("Invalid API Key") ||
      message.includes("authentication") ||
      message.includes("401") ||
      message.includes("permission") ||
      message.includes("authorization")
    ) {
      throw new Error(
        "Invalid Stripe API key or missing permission. Use a restricted key with Subscriptions: Read."
      );
    }
    throw new Error("Failed to fetch subscriptions");
  }

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
