/**
 * Pricing — billing toggle (monthly/annual)
 */

export function initPricingToggle() {
  const toggle = document.querySelector('.pricing-billing-toggle');
  const btns = toggle?.querySelectorAll('.pricing-toggle-btn');
  const priceEl = document.querySelector('[data-pricing-admission] .price-amount');
  const savingsEl = document.querySelector('[data-pricing-savings]');
  if (!toggle || !btns?.length || !priceEl) return;

  function updatePricing(period) {
    const isAnnual = period === 'annual';
    priceEl.textContent = isAnnual ? '$19' : '$24';
    if (savingsEl) {
      savingsEl.classList.toggle('visible', isAnnual);
      savingsEl.setAttribute('aria-hidden', !isAnnual);
    }
  }

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      btns.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      updatePricing(period);
    });
  });

  updatePricing('monthly');
}
