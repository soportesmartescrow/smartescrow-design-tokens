/* ============================================================
 * Pronto Pago — Design Tokens (fuente de verdad)
 * ------------------------------------------------------------
 * Identidad ProntoPago: slate + verde, tipografía Poppins.
 * Hermano de `public/css/se-tokens.css` (DS SmartEscrow azul/lima):
 * MISMA arquitectura y naming `--se-*`, VALORES propios de ProntoPago.
 *
 * Este archivo es la ÚNICA fuente de verdad. De aquí se generan:
 *   - assets/design-tokens/tokens.css   (artefacto portable, vía build-tokens.mjs)
 *   - el tema Vuetify light/dark         (vía vuetify-theme.mjs)
 *
 * Tras editar, regenerar el CSS:  npm run build:tokens
 * ============================================================ */

/* --- helpers de referencia ---------------------------------
 * En la capa semántica un valor puede ser:
 *   ref('green.500')                  -> var(--se-green-500)            (resuelve a #87bd78 para Vuetify)
 *   ref('slate.600', { brand:'primary' }) -> var(--brand-primary, var(--se-slate-600))
 *   raw('#ffffff')                    -> literal tal cual
 *   raw('rgba(0,0,0,.46)')            -> literal
 */
export const ref = (path, opts = {}) => ({ __ref: path, brand: opts.brand ?? null });
export const raw = (value) => ({ __raw: value });

/* ============================================================
 * 1. PRIMITIVOS — paleta cruda (valores EXACTOS hoy en uso)
 * ============================================================ */
export const primitives = {
  color: {
    /* Slate — familia de marca / superficies oscuras.
     * Valores reales encontrados en app.js, SCSS y componentes. */
    slate: {
      950: '#1e2124', // dark-mode bg (fallback var(--v-primary-base,#1e2124))
      900: '#24282c', // dark-mode surface (Documents fallback)
      850: '#2c2c30', // rgb(44,44,48) plus-btn / button-download bg
      800: '#2c383a', // tono oscuro slate-verde
      750: '#243b44', // Providers button-extra bg
      700: '#2e3e48', // rgb(46,62,72) button-extra bg
      650: '#2c3e50', // texto registro alterno
      600: '#36414f', // ★ PRIMARIO de marca (Vuetify primary)
      550: '#3d3d48', // button-plus bg
      500: '#424242', // surface-variant (Vuetify)
    },
    /* Verde — acento de marca. Dos sub-tonos conviven (sage + lima vivo);
     * se preservan exactos, organizados por luminancia. */
    green: {
      50:  '#e5f3df', // mini-card bg
      100: '#b2e3ae', // connect-cards hover
      200: '#a8cf95', // iconos mini-card
      300: '#b9d16c', // loader (lima claro)
      400: '#8dc63f', // ★ CTA registro / landing (lima vivo)
      450: '#a4c43c', // loader after (lima oscuro)
      500: '#87bd78', // ★ verde acción app (botones) — BRAND
      550: '#84b278', // button-plus hover
      600: '#7ab62f', // CTA registro hover (lima vivo oscuro)
      650: '#6fb46a', // button-extra hover
      700: '#63a884', // texto mini-card
      800: '#529b5e', // verde oscuro
      900: '#3f7d49', // verde profundo (contraste dark / texto)
    },
    /* Verde de éxito (semántico, distinto de la escala de marca) */
    success: { 500: '#64d26f', 100: '#e3f6e6', 700: '#2e7d4f' },
    /* Neutros / grises (cool→neutro) */
    gray: {
      0:   '#ffffff',
      50:  '#f8f8f8', // body bg
      100: '#f5f5f5', // header tablas / hover row / disabled
      150: '#f1f1f1', // scrollbar track
      175: '#f0f0f0', // scrollbar track alt
      200: '#eeeeee', // surface-light
      300: '#e0e0e0', // bordes tablas / general
      400: '#c1c1c1', // scrollbar thumb responsive
      500: '#a8a8a8', // texto deshabilitado
      550: '#b0bec5', // footer links (blue-grey)
      600: '#888888', // scrollbar thumb hover
      650: '#757575', // gris medio
      700: '#666666', // texto gris medio / footer icon
      750: '#616161', // separador footer
      800: '#555555', // scrollbar thumb hover oscuro
      900: '#333333', // texto oscuro
      950: '#000000',
    },
    /* Azules informativos / acentos puntuales */
    blue: {
      info:        '#3780ff', // Vuetify info
      link:        '#1976d2', // icono History
      bootstrap:   '#0d6efd', // fallback widget branding
      ghost:          '#c8ebfb', // drag ghost bg
      'ghost-border': '#4a9eff', // drag ghost border
      subtle:         '#e7f0ff', // fondo badge/info sutil
      strong:         '#1f5592', // texto sobre info sutil
    },
    /* Rojos / peligro */
    red: {
      text:   '#cb1d10', // closeButton texto
      base:   '#e04b43', // Vuetify error
      hover:  '#f44336', // closeButton:hover bg
      subtle: '#fdecea', // fondo badge danger sutil
      strong: '#b3261e', // texto sobre danger sutil
    },
    /* Naranja / aviso */
    orange: { warning: '#ffa800', subtle: '#fff3da', strong: '#a86a00' },
    /* Secundario (Vuetify secondary) */
    purple: { secondary: '#5564d7', darken: '#1f5592', teal: '#018786' },
  },

  /* Tipografía — ProntoPago usa Poppins (con Roboto/​system de fallback) */
  font: {
    sans: "'Poppins', 'Roboto', system-ui, -apple-system, sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, monospace",
  },
  /* Escala de tamaños (mantiene contrato --se-text-* del DS) */
  text: {
    xs:   '0.8rem',  // 12.8px (footer, websocket-id)
    sm:   '13px',
    base: '14px',
    md:   '15px',
    lg:   '18px',    // button-extra "larger"
    xl:   '20px',
    '2xl':'24px',
    '3xl':'2rem',    // loading-text
  },
  weight: { regular: 400, medium: 500, bold: 700 },

  /* Radios — valores reales (botones 10px, campos 4px, cards 5px) */
  radius: {
    xs:   '4px',
    sm:   '5px',
    md:   '10px',  // ★ botones ProntoPago
    lg:   '12px',
    full: '999px',
  },
  /* Sombras — valores reales encontrados */
  shadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 5px 15px rgba(0, 0, 0, 0.15)',
  },
  /* Espaciado (contrato --se-s-* del DS) */
  space: {
    1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
    6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
  },
  /* z-index — capas reales del proyecto */
  z: {
    header:  '999',
    overlay: '1100',
    loader:  '1200',
    'loader-card': '1999999999',
    toast:   '2147483647', // swal2 / loading-card
  },
  /* Alturas de control (inputs, botones) */
  size: {
    'control-sm': '34px',
    'control':    '40px',
    'control-lg': '52px',
    'navbar':     '62px', // alto de la navbar (sidebar→header)
  },
};

/* ============================================================
 * 2. SEMÁNTICOS — propósito (light / dark)
 *    Los de marca enlazan con el branding por tenant del SSO SDK
 *    (var(--brand-*) inyectado en base.html.twig) con fallback.
 * ============================================================ */
export const semantic = {
  light: {
    /* Marca */
    'color-primary':        ref('slate.600', { brand: 'primary' }),
    'color-primary-hover':  ref('slate.700'),
    'color-on-primary':     raw('#ffffff'),
    'color-secondary':      ref('purple.secondary'),

    /* Verde de acción (brand) y CTA vivo */
    'color-brand':          ref('green.500'),
    'color-brand-hover':    ref('green.650'),
    'color-brand-strong':   ref('green.400'), // CTA lima registro/landing
    'color-brand-strong-hover': ref('green.600'),
    'color-brand-subtle':   ref('green.50'),
    'color-on-brand':       raw('#ffffff'),

    /* Semánticos de estado (mismos nombres que se-tokens.css) */
    'color-success':        ref('success.500'),
    'color-warning':        ref('orange.warning'),
    'color-danger':         ref('red.base'),
    'color-danger-hover':   ref('red.hover'),
    'color-info':           ref('blue.info'),

    /* Estado · sutil (fondo badge) / strong (texto) / on (texto sobre sólido) */
    'color-success-subtle': ref('success.100'),
    'color-success-strong': ref('success.700'),
    'color-on-success':     raw('#ffffff'),
    'color-warning-subtle': ref('orange.subtle'),
    'color-warning-strong': ref('orange.strong'),
    'color-on-warning':     ref('slate.950'),
    'color-danger-subtle':  ref('red.subtle'),
    'color-danger-strong':  ref('red.strong'),
    'color-on-danger':      raw('#ffffff'),
    'color-info-subtle':    ref('blue.subtle'),
    'color-info-strong':    ref('blue.strong'),
    'color-on-info':        raw('#ffffff'),

    /* Componentes: foco, tablas */
    'color-focus-ring':     raw('rgba(135, 189, 120, 0.35)'),
    'color-table-header-bg':   ref('gray.100'),
    'color-table-header-text': ref('slate.600'),
    'color-table-row-hover':   raw('rgba(0, 0, 0, 0.03)'),

    /* Navbar (fuente única de la barra superior — la usan navbar.css y el adaptador EasyAdmin).
     * Estética Pronto Pago: header blanco, texto slate, subrayado activo slate, borde inferior fino. */
    'navbar-bg':            ref('gray.0'),     // header blanco
    'navbar-fg':            ref('slate.600'),  // texto/iconos del menú
    'navbar-active':        ref('slate.600'),  // subrayado del item activo
    'navbar-hover':         raw('rgba(75, 75, 75, 0.05)'),
    'navbar-border':        ref('gray.300'),   // borde inferior
    'navbar-scrollbar':     ref('slate.600'),  // línea fina del scroll horizontal
    'navbar-brand':         ref('green.500'),  // acentos de marca dentro de la navbar
    // Sombra EXACTA de ProntoPago (v-app-bar elevation="1" = Material elevation 1)
    'navbar-shadow':        raw('0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)'),

    /* Superficies / texto / bordes */
    'color-bg':             ref('gray.50', { brand: 'bg' }),
    /* Canvas = fondo de página FIJO (gris claro), NO override de branding: así la
     * navbar/cards blancas contrastan, igual que el background de ProntoPago (Vuetify). */
    'color-canvas':         ref('gray.50'),
    'color-surface':        ref('gray.0'),
    'color-surface-variant':ref('gray.100'),
    'color-surface-muted':  ref('gray.200'),
    'color-text':           ref('slate.600', { brand: 'text' }),
    'color-text-muted':     ref('gray.700'),
    'color-text-subtle':    ref('gray.600'),
    'color-text-disabled':  ref('gray.500'),
    'color-border':         ref('gray.300'),
    'color-border-strong':  ref('gray.400'),

    /* Scrollbars (la app usa thumb verde en forms y gris en otros) */
    'color-scrollbar-track': ref('gray.150'),
    'color-scrollbar-thumb': ref('gray.400'),
    'color-scrollbar-thumb-brand': ref('green.500'),

    /* Overlays / drag */
    'color-overlay':        raw('rgba(0, 0, 0, 0.46)'), // #00000075
    'color-overlay-soft':   raw('rgba(0, 0, 0, 0.10)'),
    'color-hover':          raw('rgba(75, 75, 75, 0.05)'), // #4b4b4b0d (wash hover)
    'color-drag-ghost':     ref('blue.ghost'),
    'color-drag-ghost-border': ref('blue.ghost-border'),

    /* Footer (superficie oscura sobre fondo claro) */
    'color-footer-bg':      ref('slate.600'),
    'color-footer-text':    ref('gray.550'),
    'color-footer-divider': ref('gray.750'),
  },

  /* Modo oscuro — superficies a partir de los tonos slate ya presentes;
   * marca/verde se mantienen (legibles) y se aclaran los textos. */
  dark: {
    'color-primary':        ref('slate.500', { brand: 'primary' }),
    'color-primary-hover':  ref('slate.550'),
    'color-on-primary':     raw('#ffffff'),
    'color-secondary':      ref('purple.secondary'),

    'color-brand':          ref('green.500'),
    'color-brand-hover':    ref('green.200'),
    'color-brand-strong':   ref('green.400'),
    'color-brand-strong-hover': ref('green.300'),
    'color-brand-subtle':   ref('slate.800'),
    'color-on-brand':       ref('slate.950'),

    'color-success':        ref('success.500'),
    'color-warning':        ref('orange.warning'),
    'color-danger':         ref('red.hover'),
    'color-danger-hover':   ref('red.base'),
    'color-info':           ref('blue.ghost-border'),

    'color-success-subtle': ref('slate.800'),
    'color-success-strong': ref('success.500'),
    'color-on-success':     ref('slate.950'),
    'color-warning-subtle': ref('slate.800'),
    'color-warning-strong': ref('orange.warning'),
    'color-on-warning':     ref('slate.950'),
    'color-danger-subtle':  ref('slate.800'),
    'color-danger-strong':  ref('red.hover'),
    'color-on-danger':      raw('#ffffff'),
    'color-info-subtle':    ref('slate.800'),
    'color-info-strong':    ref('blue.ghost-border'),
    'color-on-info':        ref('slate.950'),

    'color-focus-ring':     raw('rgba(135, 189, 120, 0.45)'),
    'color-table-header-bg':   ref('slate.800'),
    'color-table-header-text': ref('gray.200'),
    'color-table-row-hover':   raw('rgba(255, 255, 255, 0.04)'),

    /* Navbar (dark) */
    'navbar-bg':            ref('slate.900'),
    'navbar-fg':            ref('gray.200'),
    'navbar-active':        ref('green.500'),
    'navbar-hover':         raw('rgba(255, 255, 255, 0.06)'),
    'navbar-border':        ref('slate.550'),
    'navbar-scrollbar':     ref('gray.400'),
    'navbar-brand':         ref('green.500'),
    'navbar-shadow':        raw('0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)'),

    'color-bg':             ref('slate.950', { brand: 'bg' }),
    'color-canvas':         ref('slate.950'),
    'color-surface':        ref('slate.900'),
    'color-surface-variant':ref('slate.800'),
    'color-surface-muted':  ref('slate.850'),
    'color-text':           ref('gray.200', { brand: 'text' }),
    'color-text-muted':     ref('gray.400'),   // dark: más claro que subtle (jerarquía)
    'color-text-subtle':    ref('gray.500'),   // dark: ~4.6:1 sobre surface (AA)
    'color-text-disabled':  ref('gray.700'),
    'color-border':         ref('slate.550'),
    'color-border-strong':  ref('gray.800'),

    'color-scrollbar-track': ref('slate.800'),
    'color-scrollbar-thumb': ref('slate.550'),
    'color-scrollbar-thumb-brand': ref('green.800'),

    'color-overlay':        raw('rgba(0, 0, 0, 0.66)'),
    'color-overlay-soft':   raw('rgba(255, 255, 255, 0.08)'),
    'color-hover':          raw('rgba(255, 255, 255, 0.06)'),
    'color-drag-ghost':     ref('slate.750'),
    'color-drag-ghost-border': ref('blue.ghost-border'),

    'color-footer-bg':      ref('slate.950'),
    'color-footer-text':    ref('gray.550'),
    'color-footer-divider': ref('slate.550'),
  },
};

/* ============================================================
 * 3. MAPA Vuetify — nombres que espera Vuetify -> token semántico
 *    (vuetify-theme.mjs los resuelve a hex)
 * ============================================================ */
export const vuetifyColorMap = {
  primary:            'color-primary',
  'primary-darken-1': null, // se rellena con slate.700 directo abajo
  secondary:          'color-secondary',
  background:         'color-bg',
  surface:            'color-surface',
  'surface-variant':  'color-surface-variant',
  'surface-light':    'color-surface-muted',
  error:              'color-danger',
  info:               'color-info',
  success:            'color-success',
  warning:            'color-warning',
};

/* Nombre de los temas Vuetify (usados por app.js / App.vue) */
export const THEME_LIGHT = 'smartEscrowTheme';
export const THEME_DARK = 'smartEscrowDarkTheme';

/* Prefijo de las variables CSS */
export const PREFIX = 'se';

/* ============================================================
 * 4. HELPERS de resolución (compartidos por build-tokens.mjs y
 *    vuetify-theme.mjs). No tocar valores; solo transforman.
 * ============================================================ */

/** 'green.500' -> '--se-green-500' (nombre de la var CSS del primitivo) */
export const primitiveVarName = (path) => {
  const [group, key] = path.split('.');
  return `--${PREFIX}-${group}-${key}`;
};

/** 'green.500' -> '#87bd78' (valor hex del primitivo) */
export const primitiveHex = (path) => {
  const [group, key] = path.split('.');
  const val = primitives.color?.[group]?.[key];
  if (val === undefined) throw new Error(`Primitivo de color inexistente: ${path}`);
  return val;
};

/** Token semántico -> valor CSS (usa var() y fallback de branding) */
export const tokenToCss = (token) => {
  if (token && token.__raw !== undefined) return token.__raw;
  if (token && token.__ref !== undefined) {
    const inner = `var(${primitiveVarName(token.__ref)})`;
    return token.brand ? `var(--brand-${token.brand}, ${inner})` : inner;
  }
  throw new Error(`Token semántico inválido: ${JSON.stringify(token)}`);
};

/** Token semántico -> valor hex concreto (para Vuetify, que no admite var()).
 *  Ignora el override de branding y usa el fallback primitivo. */
export const tokenToHex = (token) => {
  if (token && token.__raw !== undefined) return token.__raw;
  if (token && token.__ref !== undefined) return primitiveHex(token.__ref);
  throw new Error(`Token semántico inválido: ${JSON.stringify(token)}`);
};
