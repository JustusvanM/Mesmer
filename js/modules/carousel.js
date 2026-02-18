/**
 * League Carousel — diagonal stair layout
 */

export function initLeagueCarousel() {
  const carousel = document.getElementById('leagueCarousel');
  const viewport = carousel?.querySelector('.league-carousel-viewport');
  const track = document.getElementById('leagueCarouselTrack');
  if (!carousel || !viewport || !track) return;

  const tiers = track.querySelectorAll('.league-tier');
  const tierCount = tiers.length;
  const GAP = 24;
  const STEP_Y = 55;

  let currentIndex = 2;

  function positionCards() {
    const cw = tiers[0]?.offsetWidth || 300;
    const stepX = cw + GAP;
    tiers.forEach((tier, i) => {
      tier.style.left = `${i * stepX}px`;
      tier.style.top = `${(tierCount - 1 - i) * STEP_Y}px`;
    });
  }

  function goToIndex(index) {
    currentIndex = Math.min(Math.max(0, index), tierCount - 1);
    const cw = tiers[0]?.offsetWidth || 300;
    const ch = tiers[0]?.offsetHeight || 300;
    const stepX = cw + GAP;
    const cardCenterX = currentIndex * stepX + cw / 2;
    const cardCenterY = (tierCount - 1 - currentIndex) * STEP_Y + ch / 2;
    const vw = viewport.offsetWidth;
    const vh = viewport.offsetHeight;
    const tx = vw / 2 - cardCenterX;
    const ty = vh / 2 - cardCenterY;

    track.style.transform = `translate(${tx}px, ${ty}px)`;

    tiers.forEach((tier, idx) => tier.classList.toggle('active', idx === currentIndex));
  }

  function updateCarousel() {
    positionCards();
    goToIndex(currentIndex);
  }

  tiers.forEach((tier, i) => {
    tier.setAttribute('role', 'button');
    tier.setAttribute('tabindex', '0');
    tier.setAttribute('aria-label', `View Tier ${i + 1}`);
    tier.addEventListener('click', () => goToIndex(i));
    tier.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToIndex(i);
      }
    });
  });

  updateCarousel();
  window.addEventListener('load', updateCarousel);
  window.addEventListener('resize', updateCarousel);
}
