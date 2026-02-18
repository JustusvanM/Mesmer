/**
 * Accordion — league rules / FAQ
 */

export function initLeagueRulesAccordion() {
  const cards = document.querySelectorAll('.league-rules .rule-card');
  cards.forEach((card) => {
    const header = card.querySelector('.rule-card-header');
    if (!header) return;
    header.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpening = !card.classList.contains('open');
      cards.forEach((c) => {
        c.classList.remove('open');
        const h = c.querySelector('.rule-card-header');
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (isOpening) {
        card.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
