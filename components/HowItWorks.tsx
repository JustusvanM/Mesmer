import Link from "next/link";

const STEPS = [
  {
    title: "Verify revenue",
    desc: "Connect your billing system via secure API. Automated verification ensures every startup's MRR is real.",
  },
  {
    title: "Get placed in your tier",
    desc: "On the 1st of each month, you're allocated into a league of 20 startups within your MRR range.",
  },
  {
    title: "Compete for a month",
    desc: "Bi-weekly revenue snapshots. Real-time leaderboard. Every deal closed, the league table is updated.",
  },
  {
    title: "Promote, reallocate, or graduate",
    desc: "top 3 graduate. bottom 3 reallocate. Exceed your band? Skip tiers. Reach 100K MRR? You graduate.",
  },
];

export function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">
      <div className="how-it-works-inner">
        <div className="how-it-works-intro">
          <div className="how-it-works-intro-inner">
            <h2 className="how-it-works-title">How it works</h2>
            <p className="how-it-works-desc">
              Verify your MRR, get placed in your corresponding tier, compete in
              this league for a month, then promote or reallocate.
            </p>
            <Link href="/join" className="btn btn-primary how-it-works-cta">
              Join your league
            </Link>
          </div>
        </div>
        <div className="how-it-works-steps">
          <div className="steps-spine-wrap" aria-hidden="true">
            <div className="steps-spine-line"></div>
          </div>
          <div className="step-list">
            {STEPS.map((step, i) => (
              <div key={i} className="step-item" data-step={i}>
                <div className="step-node">
                  <span className="step-node-dot"></span>
                </div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
