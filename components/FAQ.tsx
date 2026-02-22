"use client";

import { useState } from "react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "Can I cancel at any time?",
    a: "Yes. Monthly subscriptions can be canceled at any time. Of course we hope you stay, but there are no long-term commitments.",
  },
  {
    q: "Can I skip tiers?",
    a: "Yes. If you grow beyond your current band by more than one tier in a month, you skip directly to the appropriate higher league.",
  },
  {
    q: "Do I promote if I exceed the MRR band of my current Tier?",
    a: "Yes. You promote to the next league even if you don't finish in the top 3. Revenue growth is always rewarded.",
  },
  {
    q: "Do I drop to a lower MRR band if I finish in the bottom 3?",
    a: "No. You don't drop to a lower MRR band. Instead, you move to a league with startups closer to your revenue.",
  },
  {
    q: "Do I graduate when I reach Tier 1 and finish in the top 3?",
    a: "Yes. You graduate from the system. You've joined the elite. The journey from $0 to $100K MRR is complete.",
  },
  {
    q: "Is every MRR verified?",
    a: "Yes. We verify every MRR by connecting to each startup's payment provider or accounting tool. League placement is updated automatically on the 1st of each month based on verified revenue.",
  },
];

export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="faq-inner">
          <h2 className="section-title">FAQ</h2>
          <p className="faq-subtitle">Have a question? We have answers.</p>
          <Link
            href="/contact"
            className="btn btn-primary faq-cta"
          >
            Get in touch
          </Link>
          <div className="league-rules accordion faq-accordion">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`rule-card faq-item ${openId === i ? "open" : ""}`}
              >
                <button
                  className="rule-card-header faq-question"
                  type="button"
                  aria-expanded={openId === i}
                  aria-controls={`faq-${i}`}
                  id={`faq-btn-${i}`}
                  onClick={() => setOpenId(openId === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="accordion-icon faq-chevron" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className="rule-card-content faq-answer"
                  id={`faq-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
