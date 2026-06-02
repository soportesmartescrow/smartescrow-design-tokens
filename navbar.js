/* ============================================================
 * SmartEscrow — Navbar mechanics (vanilla, framework-agnostic)
 * ------------------------------------------------------------
 * Mecánica reutilizable del patrón "sidebar → navbar horizontal":
 *   - reubicar nodos del DOM dentro del header,
 *   - posicionar submenús (fixed) al hover/foco para escapar del header,
 *   - comportamiento responsive (botón móvil + overlay + panel).
 *
 * NO contiene lógica de negocio ni fetches: solo movimiento/posición.
 * Cada plataforma pasa SUS selectores en la config (EasyAdmin, etc.).
 *
 * Uso:
 *   import { initNavbar } from '@smartescrow/design-system/navbar.js'
 *   initNavbar({ relocate: [...], submenus: {...}, responsive: {...} })
 *
 * También disponible como window.SeNavbar.init(config) sin bundler.
 * ============================================================ */

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

/** Mueve nodos a un contenedor del header.
 *  moves: [{ from, to, index? }]  (from/to = selectores; index opcional del match de `from`) */
export function relocateNodes(moves = []) {
  moves.forEach(({ from, to, index = 0 }) => {
    try {
      const targets = $all(from);
      const node = targets[index] != null ? targets[index] : targets[0];
      const dest = $(to);
      if (node && dest && node.parentNode && !dest.contains(node)) {
        dest.appendChild(node);
      }
    } catch (e) { /* defensivo: nunca romper el render */ }
  });
}

/** Posiciona los submenús como fixed, cerca del item, sin salirse del viewport.
 *  cfg: { item, panel, top=50, offsetX=-80, gap=10 } */
export function positionSubmenus(cfg = {}) {
  const { item, panel, top = 50, offsetX = -80, gap = 10 } = cfg;
  if (!item || !panel) return;
  $all(item).forEach((it) => {
    const sub = it.querySelector(panel);
    if (!sub) return;
    sub.style.position = 'fixed';
    sub.style.zIndex = '999999';
    sub.style.margin = '0';
    it.addEventListener('mouseenter', (e) => {
      const x = (e.clientX || 0) + offsetX;
      sub.style.left = x + 'px';
      sub.style.top = top + 'px';
      const rect = sub.getBoundingClientRect();
      if (rect.right > window.innerWidth) sub.style.left = (window.innerWidth - rect.width - gap) + 'px';
      if (rect.bottom > window.innerHeight) sub.style.top = (window.innerHeight - rect.height - gap) + 'px';
    });
  });
}

/** Comportamiento responsive: botón abre panel móvil + overlay; overlay cierra.
 *  cfg: { toggle, overlay, mobile, openClass='active' } */
export function setupResponsive(cfg = {}) {
  const { toggle, overlay, mobile, openClass = 'active' } = cfg;
  const btn = toggle ? $(toggle) : null;
  const ov = overlay ? $(overlay) : null;
  const panel = mobile ? $(mobile) : null;
  if (!btn || !panel) return;
  const open = () => { panel.classList.add(openClass); if (ov) ov.classList.add(openClass); };
  const close = () => { panel.classList.remove(openClass); if (ov) ov.classList.remove(openClass); };
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    panel.classList.contains(openClass) ? close() : open();
  });
  if (ov) ov.addEventListener('click', close);
}

/** Orquesta todo. Ejecuta cuando el DOM está listo. */
export function initNavbar(config = {}) {
  const run = () => {
    if (config.relocate) relocateNodes(config.relocate);
    if (config.submenus) positionSubmenus(config.submenus);
    if (config.responsive) setupResponsive(config.responsive);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}

const SeNavbar = { init: initNavbar, relocateNodes, positionSubmenus, setupResponsive };

// Exposición global opcional para consumo sin bundler.
if (typeof window !== 'undefined') window.SeNavbar = SeNavbar;

export default SeNavbar;
