"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import styles from "./contact.module.css";

const REASONS = [
  { value: "", label: "Select one" },
  { value: "accelerator", label: "Accelerator" },
  { value: "lifetime", label: "Lifetime access" },
  { value: "question", label: "Question" },
  { value: "other", label: "Other" },
];

const STAGES = [
  { value: "", label: "Select one" },
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "0-10k", label: "$0 – $10K MRR" },
  { value: "10k-20k", label: "$10K – $20K MRR" },
  { value: "20k-40k", label: "$20K – $40K MRR" },
  { value: "40k-70k", label: "$40K – $70K MRR" },
  { value: "70k-100k", label: "$70K – $100K MRR" },
  { value: "100k-plus", label: "$100K+ MRR" },
];

export default function ContactPage() {
  const [reason, setReason] = useState("");
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
    if (!name.trim() || !email.trim() || !reason || !message.trim()) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
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
        <Link href="/" className={styles.contactBackLink}>
          Back to Mesmer
        </Link>
        <div className={styles.contactContainer}>
          <div className={styles.contactIntro}>
            <h1 className={styles.contactTitle}>
              Get in touch.
            </h1>
            <h2 className={styles.contactSubtitle}>
              Join our accelerator program, get lifetime access or ask your question
            </h2>
            <p className={styles.contactDesc}>
              Use the form to ask any questions about Mesmer.
            </p>

            <div className={styles.contactAcceleratorBox} aria-label="Join our accelerator">
              <h3 className={styles.contactAcceleratorTitle}>Join our accelerator:</h3>
              <ul className={styles.contactAcceleratorList}>
                <li>Based in Dublin</li>
                <li>For early-stage founders</li>
                <li>Programme with mentorship and peers</li>
                <li>Aligned with your league</li>
              </ul>
            </div>
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
                  <label htmlFor="reason">Reason for reaching out*</label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    {REASONS.map((opt) => (
                      <option key={opt.value || "empty"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <label htmlFor="stage">Company stage</label>
                  <select
                    id="stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    disabled={submitting}
                  >
                    {STAGES.map((opt) => (
                      <option key={opt.value || "empty"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.contactField}>
                  <label htmlFor="message">Message*</label>
                  <textarea
                    id="message"
                    placeholder={reason === "accelerator" ? "Tell us about your startup and why you want to join" : "Type your message"}
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
                    !reason ||
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
