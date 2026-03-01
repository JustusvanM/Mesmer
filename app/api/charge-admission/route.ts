import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const ADMISSION_MONTHLY_CENTS = 2400; // $24 per month (charged each month when you run this API)
const ADMISSION_ANNUAL_CENTS = 22800; // $19 × 12 = $228 once (12 months upfront)

/** Minimum days between charges for monthly plan (run charge-admission on the 1st each month). */
const MONTHLY_BILLING_INTERVAL_DAYS = 28;

/**
 * Charge admission fee for one or all startups that have a saved payment method.
 * - **Monthly plan:** charge $24 each time you run this (e.g. on the 1st of every month). We only charge again if the last charge was 28+ days ago.
 * - **Annual plan:** charge $228 once (12 months upfront). We only charge if they have never been charged.
 * Secured by CHARGE_ADMISSION_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.CHARGE_ADMISSION_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!secret || bearer !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret?.startsWith("sk_")) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured" },
      { status: 503 }
    );
  }

  let body: { startupId?: string } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    // empty body is ok
  }

  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("startups")
    .select("id, name, email, stripe_customer_id, stripe_payment_method_id, admission_plan, admission_charged_at")
    .not("stripe_customer_id", "is", null)
    .not("stripe_payment_method_id", "is", null);

  if (body.startupId) {
    query = query.eq("id", body.startupId);
  }

  const { data: startups, error: selectError } = await query;

  if (selectError) {
    console.error("Charge admission: select error", selectError);
    return NextResponse.json(
      { error: "Failed to load startups" },
      { status: 500 }
    );
  }

  if (!startups?.length) {
    return NextResponse.json({
      charged: 0,
      failed: 0,
      message: body.startupId ? "Startup not found or has no payment method" : "No startups with saved payment methods",
    });
  }

  const now = new Date();
  const cutoffForMonthly = new Date(now.getTime() - MONTHLY_BILLING_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

  const toCharge = startups.filter((s) => {
    const plan = s.admission_plan === "annual" ? "annual" : "monthly";
    const chargedAt = s.admission_charged_at ? new Date(s.admission_charged_at as string) : null;

    if (plan === "annual") {
      return !chargedAt; // annual: charge only once
    }
    // monthly: charge if never charged, or last charge was 28+ days ago
    return !chargedAt || chargedAt < cutoffForMonthly;
  });

  if (!toCharge.length) {
    return NextResponse.json({
      charged: 0,
      failed: 0,
      total: 0,
      message: "No startups due for a charge (monthly: already charged this period; annual: already charged once).",
    });
  }

  const stripe = new Stripe(stripeSecret);
  const results: { id: string; status: "succeeded" | "failed"; error?: string }[] = [];

  for (const s of toCharge) {
    const customerId = s.stripe_customer_id as string;
    const paymentMethodId = s.stripe_payment_method_id as string;
    const plan = s.admission_plan === "annual" ? "annual" : "monthly";
    const amountCents = plan === "annual" ? ADMISSION_ANNUAL_CENTS : ADMISSION_MONTHLY_CENTS;

    try {
      await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `Mesmer admission (${plan}) – ${s.name || s.email}`,
      });
      await supabase
        .from("startups")
        .update({ admission_charged_at: new Date().toISOString() })
        .eq("id", s.id);
      results.push({ id: s.id, status: "succeeded" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Charge admission failed for startup ${s.id}:`, message);
      results.push({ id: s.id, status: "failed", error: message });
    }
  }

  const charged = results.filter((r) => r.status === "succeeded").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    charged,
    failed,
    total: results.length,
    results,
  });
}
