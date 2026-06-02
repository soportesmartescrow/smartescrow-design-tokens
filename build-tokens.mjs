#!/usr/bin/env node
/* ============================================================
 * Generador de tokens.css desde tokens.mjs (fuente de verdad).
 *
 *   node assets/design-tokens/build-tokens.mjs
 *   (o)  npm run build:tokens
 *
 * Sin dependencias. Emite:
 *   - :root { ... }                              primitivos + semánticos (light)
 *   - .v-theme--smartEscrowDarkTheme,
 *     [data-se-theme="dark"] { ... }             overrides (dark)
 *
 * NO editar tokens.css a mano: se sobrescribe.
 * ============================================================ */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  primitives, semantic, PREFIX, THEME_DARK,
  tokenToCss,
} from './tokens.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = `--${PREFIX}`;
const I = '  '; // indent

/* --- primitivos --------------------------------------------------------- */
function emitColorPrimitives() {
  const lines = [];
  for (const [group, scale] of Object.entries(primitives.color)) {
    lines.push(`${I}/* ${group} */`);
    for (const [key, val] of Object.entries(scale)) {
      lines.push(`${I}${p}-${group}-${key}: ${val};`);
    }
  }
  return lines.join('\n');
}

function emitScale(name, obj, prefix) {
  const lines = [`${I}/* ${name} */`];
  for (const [key, val] of Object.entries(obj)) {
    lines.push(`${I}${prefix}-${key}: ${val};`);
  }
  return lines.join('\n');
}

/* --- semánticos --------------------------------------------------------- */
function emitSemantic(map) {
  return Object.entries(map)
    .map(([name, token]) => `${I}${p}-${name}: ${tokenToCss(token)};`)
    .join('\n');
}

/* --- ensamblado --------------------------------------------------------- */
const header = `/* ============================================================
 * Pronto Pago — Design Tokens (CSS)  ·  ARCHIVO GENERADO
 * ------------------------------------------------------------
 * NO EDITAR A MANO. Fuente de verdad: assets/design-tokens/tokens.mjs
 * Regenerar:  npm run build:tokens
 *
 * Artefacto portable: incluye este archivo en cualquier plataforma
 * (Vue, EasyAdmin, Twig, HTML plano) para obtener la estética exacta
 * de Pronto Pago. Modo oscuro: añade [data-se-theme="dark"] al <html>
 * (o usa el tema Vuetify "${THEME_DARK}", que aplica la clase
 *  .v-theme--${THEME_DARK} automáticamente).
 *
 * Branding por tenant (SSO SDK): los tokens de marca respetan
 * var(--brand-primary|bg|text) si están definidos (base.html.twig).
 * ============================================================ */`;

const css = `${header}

:root {
  /* ---------- PRIMITIVOS · color ---------- */
${emitColorPrimitives()}

  /* ---------- PRIMITIVOS · tipografía ---------- */
${emitScale('font-family', primitives.font, `${p}-font`)}
${emitScale('font-size', primitives.text, `${p}-text`)}
${emitScale('font-weight', primitives.weight, `${p}-weight`)}

  /* ---------- PRIMITIVOS · radios ---------- */
${emitScale('radius', primitives.radius, `${p}-r`)}

  /* ---------- PRIMITIVOS · sombras ---------- */
${emitScale('shadow', primitives.shadow, `${p}-shadow`)}

  /* ---------- PRIMITIVOS · espaciado ---------- */
${emitScale('space', primitives.space, `${p}-s`)}

  /* ---------- PRIMITIVOS · z-index ---------- */
${emitScale('z-index', primitives.z, `${p}-z`)}

  /* ---------- PRIMITIVOS · tamaños de control ---------- */
${emitScale('size', primitives.size, `${p}-size`)}

  /* ---------- SEMÁNTICOS (light) ---------- */
${emitSemantic(semantic.light)}
}

/* ============================================================
 * MODO OSCURO — overrides de los tokens semánticos. Se dispara con
 * el indicador de dark de cada plataforma, así el dark es IDÉNTICO
 * en todas (Vue/Vuetify, EasyAdmin, Bootstrap, manual):
 *   .v-theme--${THEME_DARK}     -> Vuetify (lo pone en la raíz de <v-app>)
 *   [data-se-theme="dark"]       -> manual / HTML plano
 *   .ea-dark-scheme              -> EasyAdmin (clase en <body>)
 *   [data-bs-theme="dark"]       -> Bootstrap 5.3
 * ============================================================ */
.v-theme--${THEME_DARK},
[data-${PREFIX}-theme="dark"],
.ea-dark-scheme,
[data-bs-theme="dark"] {
${emitSemantic(semantic.dark)}
}
`;

const out = join(__dirname, 'tokens.css');
writeFileSync(out, css, 'utf8');
console.log(`✓ tokens.css generado (${css.length} bytes) -> ${out}`);
