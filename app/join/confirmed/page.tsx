import Link from "next/link";
import styles from "./confirmed.module.css";

function nextFirstOfMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function JoinConfirmedPage() {
  const startDate = nextFirstOfMonth();

  return (
    <div className={styles.confirmedPage}>
      <Link href="/" className={styles.confirmedBack}>
        Back to Mesmer
      </Link>

      <div className={styles.confirmedCard}>
        <div className={styles.confirmedIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className={styles.confirmedTitle}>You&apos;re in</h1>
        <p className={styles.confirmedMessage}>
          You&apos;re ready to join the league. We&apos;ve saved your details and
          your card for the admission fee.
        </p>
        <p className={styles.confirmedHighlight}>
          Your league starts on the 1st of {startDate}.
        </p>
        <Link href="/" className={styles.confirmedCta}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
