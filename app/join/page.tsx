"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import styles from "./join.module.css";

const JOIN_FORM_STORAGE_KEY = "mesmer-join-form";

const STRIPE_KEY_URL =
  "https://dashboard.stripe.com/apikeys/create?name=TrustMRR&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_plan_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_file_read&permissions%5B%5D=rak_product_read";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLabel, setLogoLabel] = useState("Upload logo");
  const [interestedInAccelerator, setInterestedInAccelerator] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStripeHelp, setShowStripeHelp] = useState(false);

  const MAX_LOGO_SIZE_MB = 2;

  // Restore form from localStorage on mount (answers persist until user reaches waitlist)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(JOIN_FORM_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (typeof data.name === "string") setName(data.name);
      if (typeof data.email === "string") setEmail(data.email);
      if (typeof data.stripeKey === "string") setStripeKey(data.stripeKey);
      if (typeof data.logoLabel === "string") setLogoLabel(data.logoLabel);
      if (typeof data.interestedInAccelerator === "boolean") setInterestedInAccelerator(data.interestedInAccelerator);
      if (typeof data.anonymousMode === "boolean") setAnonymousMode(data.anonymousMode);
    } catch {
      // ignore invalid stored data
    }
  }, []);

  // Persist form to localStorage when fields change (saved until successful submit → waitlist)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        JOIN_FORM_STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          stripeKey,
          logoLabel,
          interestedInAccelerator,
          anonymousMode,
        })
      );
    } catch {
      // ignore quota / private mode
    }
  }, [name, email, stripeKey, logoLabel, interestedInAccelerator, anonymousMode]);

  const MAX_LOGO_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_LOGO_BYTES) {
      setError(`Logo must be under ${MAX_LOGO_SIZE_MB}MB`);
      e.target.value = "";
      setLogoFile(null);
      setLogoLabel("Upload logo");
      return;
    }
    setError(null);
    setLogoFile(file ?? null);
    setLogoLabel(file ? file.name : "Upload logo");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedKey = stripeKey.trim();
    if (!trimmedKey.startsWith("rk_live_")) {
      setError("Please enter a valid Stripe restricted key (must start with rk_live_)");
      return;
    }

    if (!name.trim() || !email.trim() || !logoFile) {
      setError("Company name, email, and logo are required");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("interestedAccelerator", interestedInAccelerator ? "1" : "0");
      formData.append("anonymous", anonymousMode ? "1" : "0");
      formData.append("stripeKey", trimmedKey);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/onboard", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      try {
        localStorage.removeItem(JOIN_FORM_STORAGE_KEY);
      } catch {
        // ignore
      }
      window.location.href = "/waitlist";
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Nav />
      <main className={styles.joinPage}>
        <Link href="/" className={styles.joinBackLink}>
          Back to Mesmer
        </Link>
        <div className={styles.joinContainer}>
          <div className={styles.joinIntro}>
            <h1 className={styles.joinTitle}>Join your league.</h1>
            <h2 className={styles.joinSubtitle}>Enter your details and climb the ranks.</h2>
            <p className={styles.joinDesc}>
              Connect your Stripe to verify your MRR and we&apos;ll place you in the right
              tier. Twenty startups. One month. Promotion or relegation.
            </p>
          </div>

          <div className={styles.joinFormWrap}>
            <form
          className={styles.joinForm}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={styles.joinField}>
            <label htmlFor="company">Company name*</label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Your company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className={styles.joinField}>
            <label htmlFor="email">Company email*</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className={styles.joinField}>
            <label htmlFor="logo">Company logo*</label>
            <div className={styles.joinFileWrap}>
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                className={styles.joinFileInput}
                onChange={handleLogoChange}
                required
                disabled={submitting}
              />
              <span className={styles.joinFileLabel}>{logoLabel}</span>
            </div>
          </div>
          <div
            className={styles.joinStripeKeyWrap}
            onMouseEnter={() => setShowStripeHelp(true)}
            onMouseLeave={() => setShowStripeHelp(false)}
          >
            <div className={styles.joinField}>
              <label htmlFor="stripeKey">MRR in USD (Stripe API Key)*</label>
              <input
                type="text"
                id="stripeKey"
                name="stripeKey"
                placeholder="rk_live_..."
                title="Live key required (no test keys)"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                required
                autoComplete="off"
                disabled={submitting}
                className={error && error.includes("Stripe") ? styles.invalid : ""}
              />
            </div>
            {showStripeHelp && (
              <div className={styles.joinStripeHelpPopover}>
                <a
                  href={STRIPE_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.joinInstructionLink}
                >
                  <strong>Click here to create a read-only API key</strong>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <ol className={styles.joinInstructionList}>
                  <li>Scroll down and click &apos;Create key&apos;</li>
                  <li>Don&apos;t change the permissions</li>
                  <li>Don&apos;t delete the key or we can&apos;t refresh revenue</li>
                </ol>
                <p className={styles.joinInstructionNote}>
                  Use Read-only permissions for Subscriptions and Customers to
                  maintain account security.
                </p>
              </div>
            )}
          </div>

          <div className={styles.joinAcceleratorToggleWrap}>
            <label className={styles.joinAnonymousLabel}>
              <input
                type="checkbox"
                checked={interestedInAccelerator}
                onChange={(e) => setInterestedInAccelerator(e.target.checked)}
                disabled={submitting}
                className={styles.joinAnonymousCheck}
              />
              <span className={styles.joinAnonymousSwitch} aria-hidden />
              <span className={styles.joinAnonymousContent}>
                <span className={styles.joinAnonymousText}>Interested in the accelerator</span>
                <Link href="/contact" className={styles.joinReadMore}>Read more</Link>
              </span>
            </label>
          </div>
          <div className={styles.joinAnonymousWrap}>
            <label className={styles.joinAnonymousLabel}>
              <input
                type="checkbox"
                checked={anonymousMode}
                onChange={(e) => setAnonymousMode(e.target.checked)}
                disabled={submitting}
                className={styles.joinAnonymousCheck}
              />
              <span className={styles.joinAnonymousSwitch} aria-hidden />
              <span className={styles.joinAnonymousContent}>
                <span className={styles.joinAnonymousText}>Play anonymously</span>
              </span>
            </label>
          </div>

          {error && <p className={styles.joinError}>{error}</p>}

          <button
            type="submit"
            className={styles.joinSubmit}
            disabled={
              submitting ||
              !name.trim() ||
              !email.trim() ||
              !logoFile ||
              !stripeKey.trim()
            }
          >
            {submitting ? "Joining…" : "Join your league"}
          </button>
        </form>

        <p className={styles.joinLegal}>
          By joining, you agree to our <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
