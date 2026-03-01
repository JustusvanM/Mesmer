"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";

const TIERS = [
  { num: 1, range: "$0 – $10K MRR", stats: "20 startups per pod", badge: "Entry" },
  { num: 2, range: "$10K – $20K MRR", stats: "20 startups per pod" },
  { num: 3, range: "$20K – $40K MRR", stats: "20 startups per pod" },
  { num: 4, range: "$40K – $70K MRR", stats: "20 startups per pod" },
  {
    num: 5,
    range: "$70K – $100K MRR",
    stats: "20 startups per pod",
    badge: "Final tier",
    graduate: true,
  },
];

const GAP = 24;
const STEP_Y = 55;
const SWIPE_THRESHOLD = 50;

export function LeagueSystem() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const tierCount = TIERS.length;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 0 ? i : i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i >= tierCount - 1 ? i : i + 1));
  }, [tierCount]);

  const updateLayout = useCallback(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const wrappers = cardRefs.current;
    const firstWrapper = wrappers[0];

    if (!track || !viewport || !firstWrapper) return;

    const cw = firstWrapper.offsetWidth;
    const ch = firstWrapper.offsetHeight;
    const stepX = cw + GAP;
    const vw = viewport.offsetWidth;
    const vh = viewport.offsetHeight;

    // Position card wrappers
    wrappers.forEach((wrapper, i) => {
      if (!wrapper) return;
      wrapper.style.left = `${i * stepX}px`;
      wrapper.style.top = `${(tierCount - 1 - i) * STEP_Y}px`;
    });

    // Center track on active card
    const cardCenterX = activeIndex * stepX + cw / 2;
    const cardCenterY = (tierCount - 1 - activeIndex) * STEP_Y + ch / 2;
    const tx = vw / 2 - cardCenterX;
    const ty = vh / 2 - cardCenterY;
    track.style.transform = `translate(${tx}px, ${ty}px)`;
  }, [activeIndex, tierCount]);

  useLayoutEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useLayoutEffect(() => {
    const handleResize = () => updateLayout();
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleResize);
    // On mobile, layout can run before viewport/media are correct; re-run so Tier 5 (index 0) is centered
    const t = setTimeout(updateLayout, 100);
    const t2 = setTimeout(updateLayout, 400);
    const viewport = viewportRef.current;
    const ro = viewport ? new ResizeObserver(updateLayout) : null;
    if (viewport) ro?.observe(viewport);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      clearTimeout(t);
      clearTimeout(t2);
      if (viewport && ro) ro.unobserve(viewport);
    };
  }, [updateLayout]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const dx = touchStartX.current - touchEndX.current;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) goNext();
    else goPrev();
  }, [goNext, goPrev]);

  return (
    <section className="section league-system" id="league-system">
      <div className="container">
        <h2 className="section-title">The league system</h2>
        <p className="section-subtitle">
          Five tiers. Twenty startups per league. Monthly competitions.
        </p>
        <div className="league-carousel" id="leagueCarousel">
          <button
            type="button"
            className="league-carousel-nav league-carousel-prev"
            aria-label="Previous tier"
            onClick={goPrev}
            disabled={activeIndex <= 0}
          >
            ‹
          </button>
          <button
            type="button"
            className="league-carousel-nav league-carousel-next"
            aria-label="Next tier"
            onClick={goNext}
            disabled={activeIndex >= tierCount - 1}
          >
            ›
          </button>
          <div
            className="league-carousel-viewport"
            ref={viewportRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="league-carousel-track" ref={trackRef}>
              {TIERS.map((t, i) => (
                <div
                  key={t.num}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={`league-tier-wrapper ${activeIndex === i ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`View Tier ${6 - t.num}`}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(i);
                    }
                  }}
                >
                  {activeIndex === i && <div className="beam-column" aria-hidden="true" />}
                  <div className={`league-tier tier-${t.num} ${activeIndex === i ? "active" : ""}`}>
                  <div className="tier-label">
                    <div className="tier-badge-icon">
                      <span className="tier-badge-label">Tier</span>
                      <span className="tier-badge-number">{6 - t.num}</span>
                    </div>
                  </div>
                  <div className="tier-body">
                    <div className="tier-range">{t.range}</div>
                    <div className="tier-stats">{t.stats}</div>
                    <div className="tier-arrows">
                      <span className="arrow-up">
                        ↑ top 3 graduate{t.graduate ? " 🏆" : ""}
                      </span>
                      <span className="arrow-down">↓ bottom 3 reallocate</span>
                    </div>
                  </div>
                  <div className="tier-footer"></div>
                  {t.badge && (
                    <div
                      className={`tier-badge-overlay ${
                        t.num === 1 ? "tier-1-badge" : "tier-5-badge"
                      }`}
                    >
                      {t.badge}
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
