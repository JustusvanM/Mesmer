import Link from "next/link";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-headline">
            Compete on <span className="highlight">verified MRR</span>.{" "}
            <span className="hero-climb-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero-climb-arrow.png" alt="" className="hero-climb-icon" />
            </span>{" "}
            Climb the ranks.
          </h1>
          <p className="hero-subheadline">
            Join monthly competition where founders compete based on real,
            verified revenue. Twenty startups. One month. Promotion or
            relegation.
          </p>
          <div className="hero-ctas">
            <Link href="/join" className="btn btn-primary btn-lg">
              Join your league
            </Link>
            <a href="#pricing" className="btn btn-secondary btn-lg">
              See pricing
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-mock">
            <div className="mock-header">
              <span className="mock-title">Your league</span>
              <span className="mock-details">$20K – $40K MRR · 20 startups</span>
            </div>
            <div className="mock-leaderboard">
              {[
                { rank: 1, company: "Acme Labs", mrr: "$42,100", pct: 100, promote: true },
                { rank: 2, company: "Nova Systems", mrr: "$41,200", pct: 100, promote: true },
                { rank: 3, company: "You", mrr: "$40,500", pct: 100, promote: true, bold: true },
                { rank: 4, company: "Signal Inc", mrr: "$39,200", pct: 96 },
                { rank: 5, company: "Flow Tech", mrr: "$37,500", pct: 91 },
                { rank: 6, company: "DataFlow", mrr: "$35,800", pct: 87 },
                { rank: 7, company: "CloudBase", mrr: "$34,100", pct: 83 },
                { rank: 8, company: "Vertex Labs", mrr: "$32,400", pct: 79 },
                { rank: 9, company: "Pulse.io", mrr: "$30,700", pct: 75 },
                { rank: 10, company: "Apex Dev", mrr: "$29,000", pct: 70 },
                { rank: 11, company: "Nexus Tools", mrr: "$27,300", pct: 66 },
                { rank: 12, company: "Stride SaaS", mrr: "$25,600", pct: 62 },
                { rank: 13, company: "Forge Stack", mrr: "$23,900", pct: 58 },
                { rank: 14, company: "Lambda Works", mrr: "$22,200", pct: 54 },
                { rank: 15, company: "Prism Labs", mrr: "$21,500", pct: 51 },
                { rank: 16, company: "Atlas Dev", mrr: "$20,800", pct: 50 },
                { rank: 17, company: "Spark Tech", mrr: "$20,500", pct: 50 },
                { rank: 18, company: "Zenith Co", mrr: "$20,300", pct: 50, relegate: true },
                { rank: 19, company: "Orbit Inc", mrr: "$20,200", pct: 50, relegate: true },
                { rank: 20, company: "Nova Point", mrr: "$20,100", pct: 50, relegate: true },
              ].map((r) => (
                <div
                  key={r.rank}
                  className={`leaderboard-row rank-${r.rank} ${r.promote ? "promote" : ""} ${r.relegate ? "relegate" : ""}`}
                >
                  <span className="rank">{r.rank}</span>
                  <span className="company">{r.bold ? <strong>{r.company}</strong> : r.company}</span>
                  <span className="mrr">{r.mrr}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mock-footer" />
            <div className="mock-activity-overlay">
              <div className="mock-activity-header">
                Updates{" "}
                <span className="mock-badge-wrap">
                  <span className="live-dot" aria-hidden="true" />
                  <span className="mock-badge">Live</span>
                </span>
              </div>
              <div className="mock-activity-items">
                <div className="activity-item">
                  <span className="activity-icon">↑</span>
                  <span><strong>Acme Labs</strong> closed +$900 MRR deal</span>
                  <span className="activity-time">2h ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">↑</span>
                  <span><strong>Nova Systems</strong> updated MRR</span>
                  <span className="activity-time">5h ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">↑</span>
                  <span><strong>You</strong> closed +$1,350 MRR deal</span>
                  <span className="activity-time">1d ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">↑</span>
                  <span><strong>Signal Inc</strong> updated MRR</span>
                  <span className="activity-time">1d ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
