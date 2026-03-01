import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Creates a SetupIntent for card verification (no charge).
 * Used on the join page to save a payment method; we charge when the league starts.
 * Uses Mesmer's Stripe account (STRIPE_SECRET_KEY), not the user's key.
 */
export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey?.startsWith("sk_")) {
    return NextResponse.json(
      { error: "Payment setup is not configured" },
      { status: 503 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);

    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    console.error("SetupIntent create error:", err);
    return NextResponse.json(
      { error: "Could not create payment session" },
      { status: 500 }
    );
  }
}
