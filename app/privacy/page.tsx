import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import styles from "./privacy.module.css";

export const metadata = {
  title: "Privacy Policy | Mesmer",
  description: "Privacy policy for Mesmer (gomesmer.com). Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className={styles.privacyPage}>
        <article className={styles.privacyContent}>
          <h1 className={styles.privacyTitle}>Privacy Policy</h1>
          <p className={styles.privacyUpdated}>Last updated: February 2025</p>

          <section className={styles.privacySection}>
            <h2>1. Introduction</h2>
            <p>
              Mesmer (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates gomesmer.com. This
              privacy policy explains how we collect, use, and protect your personal
              information when you use our service.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>2. Information We Collect</h2>
            <p>We collect information you provide when:</p>
            <ul>
              <li>
                <strong>Joining a league:</strong> Company name, company email, company
                logo, and a Stripe API key (read-only) to verify your MRR. We encrypt
                your Stripe key before storage.
              </li>
              <li>
                <strong>Contacting us:</strong> Name, email, company stage, and message.
                Optional newsletter signup.
              </li>
              <li>
                <strong>Anonymous mode:</strong> If you choose to play anonymously, we
                still store your company details for operations but display only your
                MRR (not your name or logo) in league leaderboards.
              </li>
            </ul>
          </section>

          <section className={styles.privacySection}>
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To place you in the appropriate MRR-based league tier</li>
              <li>To verify your monthly recurring revenue via Stripe</li>
              <li>To display league leaderboards (or anonymously, per your choice)</li>
              <li>To respond to your contact and support requests</li>
              <li>To send newsletters, if you opt in</li>
              <li>To improve our service and website</li>
            </ul>
          </section>

          <section className={styles.privacySection}>
            <h2>4. Third-Party Services</h2>
            <p>We use the following third parties:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> Database and storage (hosted data)
              </li>
              <li>
                <strong>Stripe:</strong> MRR verification. We use a read-only API key you
                provide; we do not store your full Stripe credentials.
              </li>
            </ul>
            <p>
              These services have their own privacy policies. We recommend reviewing
              them.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>5. Data Security</h2>
            <p>
              We encrypt sensitive data (including your Stripe API key) and use
              industry-standard measures to protect your information. No system is
              completely secure; we strive to keep your data safe.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>6. Your Rights</h2>
            <p>You may:</p>
            <ul>
              <li>Request access to or correction of your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing or newsletter communications</li>
              <li>Withdraw consent where we rely on it</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href="mailto:info@gomesmer.com">info@gomesmer.com</a>.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed
              to provide the service. You may request deletion at any time.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will post the
              updated version on this page and update the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className={styles.privacySection}>
            <h2>9. Contact Us</h2>
            <p>
              For questions about this privacy policy or your data, contact us at{" "}
              <a href="mailto:info@gomesmer.com">info@gomesmer.com</a> or through
              our <Link href="/contact">contact page</Link>.
            </p>
          </section>

          <div className={styles.privacyBack}>
            <Link href="/" className={styles.privacyBackLink}>
              Back to Mesmer
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
