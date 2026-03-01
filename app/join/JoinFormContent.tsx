"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";

const JOIN_FORM_STORAGE_KEY = "mesmer-join-form";
const ADMISSION_FEE_MONTHLY = 24;
const ADMISSION_FEE_ANNUAL_PER_MONTH = 19;

type JoinFormContentProps = {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  stripeKey: string;
  setStripeKey: (v: string) => void;
  logoFile: File | null;
  logoLabel: string;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  interestedInAccelerator: boolean;
  setInterestedInAccelerator: (v: boolean) => void;
  anonymousMode: boolean;
  setAnonymousMode: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  showStripeHelp: boolean;
  setShowStripeHelp: (v: boolean) => void;
  clientSecret: string | null;
  paymentRequired: boolean;
  stripeKeyUrl: string;
  styles: Record<string, string>;
};

export function JoinFormContent({
  name,
  setName,
  email,
  setEmail,
  stripeKey,
  setStripeKey,
  logoFile,
  logoLabel,
  handleLogoChange,
  interestedInAccelerator,
  setInterestedInAccelerator,
  anonymousMode,
  setAnonymousMode,
  error,
  setError,
  submitting,
  setSubmitting,
  showStripeHelp,
  setShowStripeHelp,
  clientSecret,
  paymentRequired,
  stripeKeyUrl,
  styles: css,
}: JoinFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isAnnual, setIsAnnual] = useState(false);
  const [savePaymentConsent, setSavePaymentConsent] = useState(false);

  const doOnboard = async (paymentMethodId: string | null) => {
    const trimmedKey = stripeKey.trim();
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("interestedAccelerator", interestedInAccelerator ? "1" : "0");
    formData.append("anonymous", anonymousMode ? "1" : "0");
    formData.append("stripeKey", trimmedKey);
    formData.append("admission_plan", isAnnual ? "annual" : "monthly");
    if (paymentMethodId) formData.append("payment_method_id", paymentMethodId);
    if (logoFile) formData.append("logo", logoFile);

    const res = await fetch("/api/onboard", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }
    try {
      localStorage.removeItem(JOIN_FORM_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.href = "/join/confirmed";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      if (paymentRequired && clientSecret && stripe && elements) {
        const { error: confirmError, setupIntent } = await stripe.confirmSetup({
          elements,
          clientSecret,
          confirmParams: {
            return_url: typeof window !== "undefined" ? `${window.location.origin}/join/confirmed` : undefined,
            payment_method_data: {
              billing_details: { name: name.trim(), email: email.trim() },
            },
          },
          redirect: "if_required",
        });
        if (confirmError) {
          setError(confirmError.message || "Card verification failed");
          setSubmitting(false);
          return;
        }
        const paymentMethodId = setupIntent?.payment_method;
        if (typeof paymentMethodId !== "string") {
          setError("Could not save payment method");
          setSubmitting(false);
          return;
        }
        await doOnboard(paymentMethodId);
      } else {
        await doOnboard(null);
      }
    } catch {
      setError("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <form className={css.joinForm} onSubmit={handleSubmit} noValidate>
      <div className={css.joinField}>
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
      <div className={css.joinField}>
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
      <div className={css.joinField}>
        <label htmlFor="logo">Company logo*</label>
        <div className={css.joinFileWrap}>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            className={css.joinFileInput}
            onChange={handleLogoChange}
            required
            disabled={submitting}
          />
          <span className={css.joinFileLabel}>{logoLabel}</span>
        </div>
      </div>

      <div
        className={css.joinStripeKeyWrap}
        onMouseEnter={() => setShowStripeHelp(true)}
        onMouseLeave={() => setShowStripeHelp(false)}
      >
        <div className={css.joinField}>
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
            className={error && error.includes("Stripe") ? css.invalid : ""}
          />
        </div>
        {showStripeHelp && (
          <div className={css.joinStripeHelpPopover}>
            <a href={stripeKeyUrl} target="_blank" rel="noopener noreferrer" className={css.joinInstructionLink}>
              <strong>Click here to create a read-only API key</strong>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <ol className={css.joinInstructionList}>
              <li>Scroll down and click &apos;Create key&apos;</li>
              <li>Don&apos;t change the permissions</li>
              <li>Don&apos;t delete the key or we can&apos;t refresh revenue</li>
            </ol>
            <p className={css.joinInstructionNote}>
              Use Read-only permissions for Subscriptions and Customers to maintain account security.
            </p>
          </div>
        )}
      </div>

      <div className={css.joinAcceleratorToggleWrap}>
        <label className={css.joinAnonymousLabel}>
          <input
            type="checkbox"
            checked={interestedInAccelerator}
            onChange={(e) => setInterestedInAccelerator(e.target.checked)}
            disabled={submitting}
            className={css.joinAnonymousCheck}
          />
          <span className={css.joinAnonymousSwitch} aria-hidden />
          <span className={css.joinAnonymousContent}>
            <span className={css.joinAnonymousText}>Interested in the accelerator</span>
            <Link href="/contact" className={css.joinReadMore}>Read more</Link>
          </span>
        </label>
      </div>
      <div className={css.joinAnonymousWrap}>
        <label className={css.joinAnonymousLabel}>
          <input
            type="checkbox"
            checked={anonymousMode}
            onChange={(e) => setAnonymousMode(e.target.checked)}
            disabled={submitting}
            className={css.joinAnonymousCheck}
          />
          <span className={css.joinAnonymousSwitch} aria-hidden />
          <span className={css.joinAnonymousContent}>
            <span className={css.joinAnonymousText}>Play anonymously</span>
          </span>
        </label>
      </div>

      <div className={css.joinPaymentWrap}>
        <div className={css.joinPaymentHeader}>
          <h3 className={css.joinPaymentTitle}>Admission fee</h3>
          <div className={css.joinPaymentHeaderRight}>
            <span className={css.joinPaymentPrice}>
              <span className={css.joinPaymentAmount}>${isAnnual ? ADMISSION_FEE_ANNUAL_PER_MONTH : ADMISSION_FEE_MONTHLY}</span><span className={css.joinPaymentPeriod}>/month</span>
            </span>
            <div
              className={css.joinPaymentToggle}
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                className={`${css.joinPaymentToggleBtn} ${!isAnnual ? css.joinPaymentToggleBtnActive : ""}`}
                onClick={() => setIsAnnual(false)}
                aria-pressed={!isAnnual}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`${css.joinPaymentToggleBtn} ${isAnnual ? css.joinPaymentToggleBtnActive : ""}`}
                onClick={() => setIsAnnual(true)}
                aria-pressed={isAnnual}
              >
                Annual
              </button>
            </div>
          </div>
        </div>
        <p className={css.joinPaymentNote}>
          We save your card to charge the admission fee when your league starts—no charge now.
        </p>
        <div className={css.joinPaymentElement}>
          <PaymentElement options={{ layout: "tabs", paymentMethodOrder: ["card"] }} />
        </div>
        <label className={css.joinPaymentConsentLabel}>
          <input
            type="checkbox"
            checked={savePaymentConsent}
            onChange={(e) => setSavePaymentConsent(e.target.checked)}
            disabled={submitting}
            className={css.joinPaymentConsentCheck}
            required
          />
          <span className={css.joinPaymentConsentSwitch} aria-hidden />
          <span className={css.joinPaymentConsentText}>
            Save my payment method for future use. I agree that Mesmer may charge my card for the admission fee when my league starts and per my chosen billing (monthly or annual), as described in the{" "}
            <Link href="/terms" className={css.joinPaymentConsentLink}>Terms of Service</Link>.
          </span>
        </label>
      </div>

      {error && <p className={css.joinError}>{error}</p>}

      <button
        type="submit"
        className={css.joinSubmit}
        disabled={
          submitting ||
          !name.trim() ||
          !email.trim() ||
          !logoFile ||
          !stripeKey.trim() ||
          (paymentRequired && !!clientSecret && !stripe) ||
          (paymentRequired && !!clientSecret && !savePaymentConsent)
        }
      >
        {submitting ? "Joining…" : "Join your league"}
      </button>
    </form>
  );
}
