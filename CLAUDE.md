# CLAUDE.md — @smartescrow/prontopago-design-tokens

Guía para Claude Code al trabajar en **este repo**
(`github.com/soportesmartescrow/smartescrow-design-tokens`).

## Qué es esto

Paquete npm que nuclea la **estética de Pronto Pago** (slate `#36414f` + verde `#87bd78` +
Poppins) como **design tokens `--se-*`**, con modo claro/oscuro y tema Vuetify. Es la **única
fuente** para reproducir ese look en cualquier plataforma. Hermano de `public/css/se-tokens.css`
(identidad SmartEscrow azul/lima) que existe en las apps consumidoras: **misma arquitectura y
naming `--se-*`, distintos valores**.

Documentación completa: **`README.md`** (catálogo §6, expandir §7, publicar §9, versionar §10,
instalar §11).

## Reglas de oro (NO romper)

1. **Fuente de verdad = `tokens.mjs`.** Edita SOLO ahí.
2. **`tokens.css` es GENERADO. Nunca lo edites a mano.** Tras cualquier cambio:
   `npm run build` (= `node build-tokens.mjs`) y commitea `tokens.mjs` **y** `tokens.css` juntos.
3. **Cada token semántico nuevo necesita su variante en `semantic.dark`** (no solo `light`).
4. **Naming kebab-case**, prefijo `--se-`. Al tokenizar un valor existente, **conserva su hex
   exacto** (cero cambio visual; "preservar look").
5. **No renombres ni elimines tokens a la ligera**: los consumidores dependen de los NOMBRES.
   Si lo haces, es **major** (ver §10 SemVer).

## Mapa del repo

- `tokens.mjs` — primitivos (`primitives`), semánticos (`semantic.light/dark`),
  `vuetifyColorMap`, helpers `ref()/raw()/tokenToCss()/tokenToHex()`.
- `build-tokens.mjs` — generador `tokens.mjs → tokens.css` (sin dependencias).
- `vuetify-theme.mjs` — temas Vuetify `smartEscrowTheme` / `smartEscrowDarkTheme`
  (resuelve semánticos a hex; Vuetify no admite `var()`).
- `tokens.css` — artefacto portable generado (`:root` light + bloque dark).
- `README.md` — doc completa.

## Cómo expandir (resumen; detalle en README §7)

- **Nuevo tono / nueva familia de color** → solo `tokens.mjs` (las familias de color se emiten
  automáticamente: el generador recorre `primitives.color`).
- **Nuevo token semántico** → `semantic.light` **y** `semantic.dark`. Usa:
  `ref('familia.tono')`, `ref('x', { brand:'primary|bg|text' })` (override por tenant, README §5),
  o `raw('valor literal')`.
- **Exponer a Vuetify** → añade entrada en `vuetifyColorMap` (nombreVuetify → token semántico).
- **Nueva categoría estructural** (motion, breakpoints…) → `tokens.mjs` **+** una línea
  `emitScale(...)` en `build-tokens.mjs` (las escalas no-color se emiten una a una).

## Flujo de actualización en git

```bash
npm run build                          # regenera tokens.css
git add -A && git commit -m "feat: <cambio>"
npm version patch|minor|major          # SemVer (README §10) — crea el tag
git push origin main --tags
```
SemVer para tokens: **añadir** = minor · **renombrar/eliminar** = major ·
**cambiar un valor** sin tocar nombres = patch/minor según impacto visual.

## Consumidores (no romperlos)

- **ProntoPago** lo usa como `"@smartescrow/prontopago-design-tokens": "file:../design-tokens"`
  (carpeta hermana) e importa `…/css` y `…/vuetify`. En CI/deploy se usa el **tag git**
  (`github:soportesmartescrow/smartescrow-design-tokens#vX.Y.Z`).
- Webpack del consumidor necesita `resolve.symlinks = false` cuando se instala con `file:`
  (si no, Babel transpila el paquete e intenta inyectar core-js → falla el build).
- Antes de publicar un cambio, pruébalo en un consumidor (README §7.4: `npm pack --dry-run`,
  `npm link` o `npm install /ruta/al/repo`).

## Importante

- No añadas dependencias de runtime: el generador debe seguir funcionando con Node puro
  (`engines.node >= 18`). El script `prepare` regenera `tokens.css` al instalar.
- `files` en `package.json` controla qué se publica; si añades archivos a distribuir, inclúyelos.
