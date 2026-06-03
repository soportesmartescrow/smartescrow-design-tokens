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

/** Muestra los submenús como `position:fixed` ALINEADOS BAJO SU ITEM al hacer hover.
 *  Esencial cuando el menú vive en un contenedor con overflow (p. ej. `.main-menu` con
 *  `overflow-x:auto`, que fuerza a recortar en vertical): un submenú `absolute` quedaría
 *  recortado; `fixed` escapa de cualquier overflow ancestro.
 *  cfg: { item, panel, gap=0, viewportGap=8, toggleDisplay=true }
 *   - gap: separación vertical entre el item y el submenú (0 = pegado, evita el "hueco"
 *     que dispararía mouseleave antes de alcanzar el panel).
 *   - toggleDisplay: si true, el propio kit muestra/oculta el panel (display block/none),
 *     así es autosuficiente y no hace falta JS externo para el hover de escritorio. */
export function positionSubmenus(cfg = {}) {
  const { item, panel, gap = 0, viewportGap = 8, toggleDisplay = true } = cfg;
  if (!item || !panel) return;
  $all(item).forEach((it) => {
    const sub = it.querySelector(panel);
    if (!sub) return;
    sub.style.position = 'fixed';
    sub.style.zIndex = '999999';
    sub.style.margin = '0';
    const place = () => {
      const r = it.getBoundingClientRect();
      sub.style.left = r.left + 'px';
      sub.style.top = (r.bottom + gap) + 'px';
      const sr = sub.getBoundingClientRect();          // re-clamp al viewport tras medir
      if (sr.right > window.innerWidth - viewportGap) {
        sub.style.left = Math.max(viewportGap, window.innerWidth - sr.width - viewportGap) + 'px';
      }
    };
    it.addEventListener('mouseenter', () => { if (toggleDisplay) sub.style.display = 'block'; place(); });
    it.addEventListener('mouseleave', () => { if (toggleDisplay) sub.style.display = 'none'; });
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
