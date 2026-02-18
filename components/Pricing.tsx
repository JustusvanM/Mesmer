"use client";

import Link from "next/link";
import { useState } from "react";

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <h2 className="section-title">Easy pricing</h2>
        <p className="section-subtitle">Choose how you want to compete.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div
              className="pricing-billing-toggle"
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                className={`pricing-toggle-btn ${!annual ? "active" : ""}`}
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`pricing-toggle-btn ${annual ? "active" : ""}`}
                onClick={() => setAnnual(true)}
                aria-pressed={annual}
              >
                Annual
              </button>
            </div>
            <h3 className="pricing-card-title">Admission</h3>
            <p className="pricing-card-desc">
              Monthly access to your competition. Compete and promote each
              season.
            </p>
            <div className="pricing-card-price" data-pricing-admission>
              <span className="price-amount">{annual ? "$19" : "$24"}</span>
              <span className="price-period">/month</span>
              <span
                className={`pricing-savings ${annual ? "visible" : ""}`}
                data-pricing-savings
                aria-hidden={!annual}
              >
                Save $60/year
              </span>
            </div>
            <Link href="/join" className="btn btn-primary pricing-cta">
              Join your league
            </Link>
            <div className="pricing-features">
              <p className="pricing-features-title">What&apos;s included</p>
              <ul>
                <li>Monthly league competition</li>
                <li>Real-time leaderboard</li>
                <li>Basic support</li>
              </ul>
            </div>
          </div>
          <div className="pricing-card pricing-card-featured">
            <h3 className="pricing-card-title">Lifetime access</h3>
            <p className="pricing-card-desc">
              One-time purchase. Compete forever. No recurring fees.
            </p>
            <div className="pricing-card-price">
              <span className="price-amount">Custom</span>
            </div>
            <Link
              href="/contact"
              className="btn btn-secondary pricing-cta"
            >
              Contact us
            </Link>
            <div className="pricing-features">
              <p className="pricing-features-title">
                Everything in admission, plus
              </p>
              <ul>
                <li>Unlimited access</li>
                <li>No monthly fees</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
