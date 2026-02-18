/**
 * Cursor — subtle emerald glow (disabled on touch)
 */

export function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}
