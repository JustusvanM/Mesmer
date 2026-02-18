/**
 * Mesmer — Entry point
 */

import { initNavScroll, initNavMobile } from './modules/nav.js';
import { initLeagueRulesAccordion } from './modules/accordion.js';
import { initLeagueCarousel } from './modules/carousel.js';
import { initPricingToggle } from './modules/pricing.js';
import { initScrollAnimations, initSmoothScroll } from './modules/scroll.js';
import { initCursorGlow } from './modules/cursor.js';
import { initHowItWorksSteps } from './modules/how-it-works.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initNavMobile();
  initPricingToggle();
  initCursorGlow();
  initHowItWorksSteps();
  initLeagueCarousel();
  initLeagueRulesAccordion();
  initScrollAnimations();
  initSmoothScroll();
});
