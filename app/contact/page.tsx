"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import styles from "./contact.module.css";

const STAGES = [
  "Select One",
  "Pre-revenue",
  "Tier 1 – $0–$10K MRR",
  "Tier 2 – $10K–$20K MRR",
  "Tier 3 – $20K–$40K MRR",
  "Tier 4 – $40K–$70K MRR",
  "Tier 5 – $70K–$100K MRR",
  "Beyond ($100K+ MRR)",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("");
  const [message, setMessage] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          stage: stage || undefined,
          message: message.trim(),
          newsletter,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      <Nav />
      <main className={styles.contactPage}>
        <div className={styles.contactContainer}>
          <div className={styles.contactIntro}>
            <h1 className={styles.contactTitle}>Get in touch.</h1>
            <h2 className={styles.contactSubtitle}>Questions about Mesmer?</h2>
            <p className={styles.contactDesc}>
              Whether you want lifetime access, have questions about the league
              system, or want to partner with us, we&apos;re here.
            </p>
            <Link href="/" className={styles.contactBackLink}>
              Back to Mesmer
            </Link>
          </div>

          <div className={styles.contactFormWrap}>
            {submitted ? (
              <div className={styles.contactSuccess}>
                <p>Thanks for reaching out. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form
                className={styles.contactForm}
                onSubmit={handleSubmit}
                noValidate
              >
                <div className={styles.contactField}>
                  <label htmlFor="name">Name*</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className={styles.contactField}>
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className={styles.contactField}>
                  <label htmlFor="stage">What stage is your company?</label>
                  <select
                    id="stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    disabled={submitting}
                  >
                    {STAGES.map((opt) => (
                      <option key={opt} value={opt === "Select One" ? "" : opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.contactField}>
                  <label htmlFor="message">Message*</label>
                  <textarea
                    id="message"
                    placeholder="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    disabled={submitting}
                  />
                </div>
                <label className={styles.contactCheckLabel}>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    disabled={submitting}
                    className={styles.contactCheck}
                  />
                  <span>Sign up to newsletter</span>
                </label>
                {error && (
                  <p className={styles.contactError}>{error}</p>
                )}
                <button
                  type="submit"
                  className={styles.contactSubmit}
                  disabled={
                    submitting ||
                    !name.trim() ||
                    !email.trim() ||
                    !message.trim()
                  }
                >
                  {submitting ? "Sending…" : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
