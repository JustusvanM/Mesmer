/**
 * How It Works — scroll-triggered active step
 */

export function initHowItWorksSteps() {
  const section = document.getElementById('how-it-works');
  if (!section) return;

  const stepItems = section.querySelectorAll('.step-item');
  if (stepItems.length === 0) return;

  function updateSteps() {
    const vh = window.innerHeight;
    const viewportCenter = vh * 0.45;

    let activeIndex = 0;
    stepItems.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemMid = rect.top + rect.height / 2;
      if (itemMid <= viewportCenter) activeIndex = i;
    });

    stepItems.forEach((item, i) => {
      item.classList.toggle('active', i === activeIndex);
      item.classList.toggle('inactive', i !== activeIndex);
    });
  }

  window.addEventListener('scroll', updateSteps, { passive: true });
  window.addEventListener('resize', updateSteps);
  updateSteps();
}
