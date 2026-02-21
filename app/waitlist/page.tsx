import Link from "next/link";
import styles from "./waitlist.module.css";

export default function WaitlistPage() {
  return (
    <div className={styles.waitlistPage}>
      <Link href="/" className={styles.waitlistBack}>
        Back to Mesmer
      </Link>

      <div className={styles.waitlistCard}>
        <div className={styles.waitlistIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className={styles.waitlistTitle}>You&apos;re on the list</h1>
        <p className={styles.waitlistMessage}>
          Thanks for joining. We&apos;ll get in touch before your league kicks
          off.
        </p>
        <p className={styles.waitlistHighlight}>
          Your league will start on the 1st of the month.
        </p>
        <Link href="/" className={styles.waitlistCta}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
