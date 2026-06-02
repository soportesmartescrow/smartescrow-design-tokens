/* ============================================================
 * SmartEscrow — Navbar mechanics (build GLOBAL/clásica, sin módulos)
 * ------------------------------------------------------------
 * Igual que navbar.js pero como IIFE que expone window.SeNavbar,
 * para cargarse con <script src> en plataformas SIN bundler
 * (p. ej. EasyAdmin via addJsFile). Misma API:
 *   SeNavbar.init({ relocate, submenus, responsive })
 *
 * Sin fetch ni lógica de negocio.
 * ============================================================ */
(function (global) {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function relocateNodes(moves) {
    (moves || []).forEach(function (m) {
      try {
        var targets = $all(m.from);
        var idx = m.index != null ? m.index : 0;
        var node = targets[idx] != null ? targets[idx] : targets[0];
        var dest = $(m.to);
        if (node && dest && node.parentNode && !dest.contains(node)) dest.appendChild(node);
      } catch (e) { /* defensivo */ }
    });
  }

  function positionSubmenus(cfg) {
    cfg = cfg || {};
    if (!cfg.item || !cfg.panel) return;
    var top = cfg.top != null ? cfg.top : 50;
    var offsetX = cfg.offsetX != null ? cfg.offsetX : -80;
    var gap = cfg.gap != null ? cfg.gap : 10;
    $all(cfg.item).forEach(function (it) {
      var sub = it.querySelector(cfg.panel);
      if (!sub) return;
      sub.style.position = 'fixed';
      sub.style.zIndex = '999999';
      sub.style.margin = '0';
      it.addEventListener('mouseenter', function (e) {
        sub.style.left = ((e.clientX || 0) + offsetX) + 'px';
        sub.style.top = top + 'px';
        var rect = sub.getBoundingClientRect();
        if (rect.right > window.innerWidth) sub.style.left = (window.innerWidth - rect.width - gap) + 'px';
        if (rect.bottom > window.innerHeight) sub.style.top = (window.innerHeight - rect.height - gap) + 'px';
      });
    });
  }

  function setupResponsive(cfg) {
    cfg = cfg || {};
    var openClass = cfg.openClass || 'active';
    var btn = cfg.toggle ? $(cfg.toggle) : null;
    var ov = cfg.overlay ? $(cfg.overlay) : null;
    var panel = cfg.mobile ? $(cfg.mobile) : null;
    if (!btn || !panel) return;
    function open() { panel.classList.add(openClass); if (ov) ov.classList.add(openClass); }
    function close() { panel.classList.remove(openClass); if (ov) ov.classList.remove(openClass); }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      panel.classList.contains(openClass) ? close() : open();
    });
    if (ov) ov.addEventListener('click', close);
  }

  function initNavbar(config) {
    config = config || {};
    function run() {
      if (config.relocate) relocateNodes(config.relocate);
      if (config.submenus) positionSubmenus(config.submenus);
      if (config.responsive) setupResponsive(config.responsive);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }

  global.SeNavbar = {
    init: initNavbar,
    relocateNodes: relocateNodes,
    positionSubmenus: positionSubmenus,
    setupResponsive: setupResponsive,
  };
})(window);
