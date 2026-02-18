import Link from "next/link";

export function CTA() {
  return (
    <section className="section cta-section" id="join">
      <div className="cta-bg"></div>
      <div className="cta-logos" aria-hidden="true">
        {[1, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className={`cta-logo cta-logo-${n}`}>
            <svg
              className="cta-logo-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="8" />
            </svg>
          </div>
        ))}
      </div>
      <div className="container">
        <div className="cta-content">
          <span className="cta-badge">
            <span className="cta-badge-dot" aria-hidden="true"></span>
            Live on Mesmer
          </span>
          <h2 className="cta-title">Compete on verified MRR</h2>
          <p className="cta-subtitle">
            Join monthly leagues. Climb the ranks. Reach 100K MRR.
          </p>
          <div className="cta-buttons">
            <Link href="/join" className="btn btn-primary btn-xl">
              Join your league
            </Link>
            <Link
              href="/contact"
              className="btn btn-cta-secondary btn-xl"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
