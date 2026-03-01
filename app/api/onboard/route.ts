import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { fetchMrrFromStripe } from "@/lib/stripe";
import { encrypt } from "@/lib/encryption";

const LOGOS_BUCKET = "logos";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Mesmer <onboarding@resend.dev>";
const SIGNUP_NOTIFY_EMAIL =
  process.env.SIGNUP_NOTIFY_EMAIL || "justus@gomesmer.com";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_ENCRYPTION_SECRET;
    if (!secret || secret.length < 32) {
      console.error("STRIPE_ENCRYPTION_SECRET is missing or too short");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const stripeKey = (formData.get("stripeKey") as string)?.trim();
    const paymentMethodId = (formData.get("payment_method_id") as string)?.trim() || null;
    const logoFile = formData.get("logo") as File | null;
    const anonymousRaw = formData.get("anonymous");
    const isAnonymous = anonymousRaw === "1" || anonymousRaw === "true";
    const interestedAcceleratorRaw = formData.get("interestedAccelerator");
    const interestedInAccelerator =
      interestedAcceleratorRaw === "1" || interestedAcceleratorRaw === "true";
    const admissionPlan = (formData.get("admission_plan") as string)?.trim() || "monthly";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Company name and email are required" },
        { status: 400 }
      );
    }

    if (!logoFile || logoFile.size === 0 || !logoFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Company logo is required" },
        { status: 400 }
      );
    }

    if (!stripeKey || !stripeKey.trim().startsWith("rk_live_")) {
      return NextResponse.json(
        {
          error:
            "Use a Stripe restricted live key (rk_live_...) with Subscriptions: Read. Create under Developers → API keys → Restricted keys.",
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
    let logoUrl: string | null = null;
    if (logoFile && logoFile.size > 0 && logoFile.type.startsWith("image/")) {
      if (logoFile.size > MAX_LOGO_BYTES) {
        return NextResponse.json(
          { error: "Logo must be under 2MB" },
          { status: 400 }
        );
      }
      const ext = logoFile.name.split(".").pop() || "png";
      const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const { error: bucketError } = await supabase.storage
        .from(LOGOS_BUCKET)
        .upload(filename, logoFile, {
          contentType: logoFile.type,
          upsert: false,
        });

      if (bucketError) {
        if (bucketError.message?.includes("Bucket not found")) {
          await supabase.storage.createBucket(LOGOS_BUCKET, {
            public: true,
            fileSizeLimit: "2MB",
            allowedMimeTypes: ["image/*"],
          });
          const { error: retryError } = await supabase.storage
            .from(LOGOS_BUCKET)
            .upload(filename, logoFile, {
              contentType: logoFile.type,
              upsert: false,
            });
          if (retryError) {
            console.error("Logo upload failed:", retryError.message);
            return NextResponse.json(
              { error: "Failed to upload logo" },
              { status: 500 }
            );
          }
        } else {
          console.error("Logo upload failed:", bucketError.message);
          return NextResponse.json(
            { error: "Failed to upload logo" },
            { status: 500 }
          );
        }
      }

      const { data: urlData } = supabase.storage
        .from(LOGOS_BUCKET)
        .getPublicUrl(filename);
      logoUrl = urlData.publicUrl;
    }

    let currentMrr: number;
    try {
      currentMrr = await fetchMrrFromStripe(stripeKey);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Invalid Stripe API key")) {
        return NextResponse.json(
          { error: "Invalid Stripe API key" },
          { status: 400 }
        );
      }
      if (msg.includes("Failed to fetch")) {
        return NextResponse.json(
          { error: "Failed to fetch subscriptions" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Stripe verification failed" },
        { status: 400 }
      );
    }

    const stripeApiKeyEncrypted = encrypt(stripeKey, secret);
    const now = new Date().toISOString();

    let stripeCustomerId: string | null = null;
    let stripePaymentMethodId: string | null = null;
    const mesmerStripeSecret = process.env.STRIPE_SECRET_KEY;
    if (mesmerStripeSecret?.startsWith("sk_") && paymentMethodId) {
      try {
        const stripe = new Stripe(mesmerStripeSecret);
        const customer = await stripe.customers.create({
          email,
          name,
        });
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        });
        await stripe.customers.update(customer.id, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
        stripeCustomerId = customer.id;
        stripePaymentMethodId = paymentMethodId;
      } catch (stripeErr) {
        console.error("Stripe customer/payment attach failed:", stripeErr);
        return NextResponse.json(
          { error: "Payment method could not be saved. Please try again." },
          { status: 400 }
        );
      }
    }

    const { error: insertError } = await supabase.from("startups").insert({
      name,
      email,
      logo_url: logoUrl,
      stripe_api_key_encrypted: stripeApiKeyEncrypted,
      stripe_connected: true,
      current_mrr: currentMrr,
      mrr_last_updated_at: now,
      is_anonymous: isAnonymous,
      interested_in_accelerator: interestedInAccelerator,
      stripe_customer_id: stripeCustomerId,
      stripe_payment_method_id: stripePaymentMethodId,
      admission_plan: admissionPlan === "annual" ? "annual" : "monthly",
    });

    if (insertError) {
      console.error("Database insert failed:", insertError.message);
      if (
        insertError.code === "23505" ||
        insertError.message?.includes("duplicate key") ||
        insertError.message?.includes("unique constraint")
      ) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    // Send emails via Resend (don't fail signup if email fails)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [SIGNUP_NOTIFY_EMAIL],
          subject: `Company signed up: ${escapeHtml(name)}`,
          html: `
            <h2>New league signup</h2>
            <p><strong>Company:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>MRR (USD):</strong> $${currentMrr.toLocaleString()}</p>
            <p><strong>Anonymous:</strong> ${isAnonymous ? "Yes" : "No"}</p>
            <p><strong>Interested in accelerator:</strong> ${interestedInAccelerator ? "Yes" : "No"}</p>
            <p>You can contact them if there aren&apos;t enough players to begin the league or if tech isn&apos;t ready.</p>
          `,
        });
      } catch (e) {
        console.error("Signup notify email failed:", e);
      }
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [email],
          subject: "You're in — Mesmer league",
          html: `
            <h2>You're in</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>You're ready to join the league. Your league will start on the <strong>1st of the next month.</strong></p>
            <p>We'll charge the admission fee when the league starts.</p>
            <p>— The Mesmer team</p>
          `,
        });
      } catch (e) {
        console.error("Signup confirmation email failed:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboard error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
