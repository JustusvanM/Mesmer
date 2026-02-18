import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import styles from "./terms.module.css";

export const metadata = {
  title: "Terms of Service | Mesmer",
  description: "Terms of service for Mesmer (gomesmer.com).",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className={styles.termsPage}>
        <article className={styles.termsContent}>
          <h1 className={styles.termsTitle}>Terms of Service</h1>
          <p className={styles.termsUpdated}>Last updated: February 2025</p>

          <section className={styles.termsSection}>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using Mesmer (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) at
              gomesmer.com, you agree to be bound by these Terms of Service. If you do
              not agree, do not use our service.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>2. Description of Service</h2>
            <p>
              Mesmer provides a revenue-based startup league platform. Founders join
              tiers based on verified Monthly Recurring Revenue (MRR), compete in
              monthly leagues, and can promote or reallocate based on performance. We
              verify MRR via read-only access to your Stripe (or similar) billing data.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>3. Eligibility</h2>
            <p>
              You must be at least 18 years old and have the authority to enter into
              these terms on behalf of yourself or your company. You must provide
              accurate information when signing up.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>4. Account and Registration</h2>
            <p>
              When you join, you provide company name, email, logo, and a read-only
              Stripe API key. You are responsible for keeping your API key secure and
              for all activity under your account. Do not share your key with others.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>5. Fees and Payment</h2>
            <p>
              Mesmer offers subscription plans (e.g., monthly, annual) and lifetime
              access. Fees are stated at the time of purchase. Refunds are at our
              discretion unless otherwise required by law.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Provide false or misleading MRR or company information</li>
              <li>Misuse or abuse the service or other participants</li>
              <li>Attempt to circumvent MRR verification or league rules</li>
              <li>Use the service for any illegal purpose</li>
              <li>Reverse engineer or scrape our systems</li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h2>7. Intellectual Property</h2>
            <p>
              Mesmer and its content, branding, and technology are owned by us. You
              retain ownership of your company data and logo. By submitting content,
              you grant us a license to use it to provide the service (e.g., displaying
              your logo in league leaderboards unless you choose anonymous mode).
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>8. Disclaimers</h2>
            <p>
              The service is provided &quot;as is&quot;. We do not guarantee uninterrupted
              availability, accuracy of MRR verification, or specific outcomes from
              league participation. League results depend on many factors.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Mesmer shall not be liable for
              any indirect, incidental, special, or consequential damages arising from
              your use of the service. Our total liability is limited to the amount
              you paid us in the twelve months prior to the claim.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>10. Termination</h2>
            <p>
              You may cancel your subscription at any time. We may suspend or
              terminate your access for breach of these terms or for any other reason.
              Upon termination, your right to use the service ends.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>11. Changes</h2>
            <p>
              We may update these terms from time to time. We will post changes on
              this page and update the &quot;Last updated&quot; date. Continued use of the
              service after changes constitutes acceptance.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>12. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:info@gomesmer.com">info@gomesmer.com</a> or through our{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </section>

          <div className={styles.termsBack}>
            <Link href="/" className={styles.termsBackLink}>
              Back to Mesmer
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
