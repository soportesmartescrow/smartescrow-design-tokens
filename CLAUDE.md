# CLAUDE.md — @smartescrow/design-system

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
- `components.css` — componentes genéricos reutilizables (`.se-*`) sobre tokens. **A mano.**
- `navbar.css` + `navbar.js` — patrón sidebar→navbar: CSS de posicionamiento + mecánica vanilla
  parametrizable (mover DOM, posicionar submenús, responsive). **Sin negocio ni fetch.**
  - **Especificación (detalle README §13):** fuente **Poppins** (`--se-font-sans`); iconos
    **MDI `@mdi/font` ^7.4.47** (SPA Vue/Vuetify) y **Font Awesome 6.4.0** (EasyAdmin); colores vía
    `--se-navbar-{bg,fg,active,hover,border,scrollbar,shadow}` + `--se-size-navbar` (62px); acento
    `--se-color-brand` (#87bd78), primario `--se-color-primary` (#36414f). Indicador activo corto/2px/cuadrado.
- `adapters/easyadmin.css` — adaptador EasyAdmin: mapea `--bs-*` y selectores nativos a tokens/
  componentes/navbar. Los demás archivos `components/navbar` NO dependen de EasyAdmin (reutilizables).
- `README.md` — doc completa (§8 componentes/navbar/adaptadores).

## Reglas de reutilización (importante)

- `components.css` y `navbar.*` deben permanecer **agnósticos** (sin selectores de EasyAdmin ni de
  ninguna plataforma). Todo acople a un framework concreto va en un **adaptador** bajo `adapters/`.
- `navbar.js` no hace fetch ni lógica de negocio: solo movimiento/posición. Recibe selectores por config.

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

- **ProntoPago** lo usa como `"@smartescrow/design-system": "file:../design-tokens"`
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

---

## Ejemplo: prompt para adoptar el sistema en un proyecto NUEVO

Pega este prompt en Claude Code **dentro del proyecto destino**. Hace todo: descarga, instala,
aplica y deja *ready-to-test*; y actualiza ESTE repo de tokens **solo si hiciera falta**.

```text
Eres Claude Code en un proyecto que debe adoptar el design system de SmartEscrow / Pronto Pago.
Hazlo TODO de forma autónoma y deja el sistema LISTO PARA PROBAR. Pregúntame solo si hay una
decisión destructiva o ambigua que no puedas resolver con un valor por defecto sensato.

DATOS
- Repo del design system: https://github.com/soportesmartescrow/smartescrow-design-tokens
- Paquete npm: @smartescrow/design-system  (es npm/CSS, NO Composer → va a node_modules, no a vendor)
- Prefijo de tokens: --se-   (ej. var(--se-color-primary), var(--se-color-brand), var(--se-r-md), var(--se-shadow-sm))
- Modo oscuro: clase .v-theme--smartEscrowDarkTheme (Vuetify) o atributo [data-se-theme="dark"] en <html>
- Branding por tenant: los tokens de marca respetan var(--brand-primary|bg|text) si existen, con fallback
- Entradas (exports): "." (API JS tokens), "/css" (tokens.css), "/components" (clases .se-*),
  "/navbar.css" + "/navbar.js" (patrón sidebar→navbar), "/easyadmin" (adaptador EasyAdmin), "/vuetify" (temas)
- Reglas para editar tokens: ver CLAUDE.md y README §7 DENTRO del repo del design system

OBJETIVO
Instalar, aplicar y dejar ready-to-test. Actualizar el repo del design system SOLO si este
proyecto necesita tokens que aún no existen.

PASOS
1) Reconoce el proyecto y resúmelo antes de tocar nada: gestor (npm/yarn/pnpm), framework
   (¿Vue 3 + Vuetify?, ¿otro?), bundler (Vite / Webpack / Symfony Encore), o si es PHP/Twig/EasyAdmin sin build.
2) Instala el paquete FIJANDO el último tag:
   - últimos tags:  git ls-remote --tags https://github.com/soportesmartescrow/smartescrow-design-tokens
   - elige el vX.Y.Z mayor e instala:  npm install github:soportesmartescrow/smartescrow-design-tokens#vX.Y.Z
   - (si el repo es privado, asegúrate de tener acceso git por SSH o token antes de instalar)
3) Aplica según el tipo de proyecto:
   - Con build JS: importa el CSS de tokens en el entry principal:  import '@smartescrow/design-system/css'
   - Vue + Vuetify: importa { smartEscrowTheme, smartEscrowDarkTheme, themeNames } desde
     '@smartescrow/design-system/vuetify' y regístralos en createVuetify({ theme: { defaultTheme: themeNames.light, themes: {...} } }). Añade un toggle de tema si procede.
   - Symfony Encore: añade  .addStyleEntry('design-tokens', require.resolve('@smartescrow/design-system/tokens.css'))
     (emite public/build/design-tokens.css para enlazarlo en plantillas Twig standalone) e importa el CSS en el entry JS.
     Si instalas como carpeta hermana con file:, añade  config.resolve.symlinks = false  (si no, Babel intenta inyectar core-js y falla el build).
   - PHP/Twig/HTML sin build: copia node_modules/@smartescrow/design-system/tokens.css a la carpeta pública y enlázalo con <link>. Dark con [data-se-theme="dark"].
   - EasyAdmin (recomendado: FICHEROS ESTÁTICOS, sin WebpackEncoreBundle — en EA 4.24
     `addWebpackEncoreEntry` puede no estar habilitado y/o escapar los tags):
       1) Concatena en un CSS público `tokens.css + components.css + navbar.css + adapters/easyadmin.css`
          (este reasigna --bs-* a tokens y themea Bootstrap) y cárgalo con `Assets->addCssFile(...)`.
       2) Copia `navbar.global.js` (build clásica IIFE → window.SeNavbar) a public y cárgalo con
          `addJsFile(...)`, seguido de un init clásico `SeNavbar.init({relocate,submenus,responsive})`
          con los selectores de EasyAdmin. La lógica de negocio (fetches, modales) va aparte, en el proyecto.
       3) Branding: el layout define `--brand-primary/bg/text` (los tokens los respetan).
     Conserva SOLO el posicionamiento; el resto, tokens. (Ver wallet: bin/build-admin-assets.mjs.)
   Después, centraliza los colores/medidas de marca hardcodeados del proyecto sustituyéndolos por var(--se-*) PRESERVANDO el aspecto. No toques estilos de librerías de terceros.
4) ¿Faltan tokens? Si este proyecto usa colores/medidas de marca que NO existen en el sistema:
   a) Clona el repo del design system, LEE su CLAUDE.md y README §7 y respétalos.
   b) Añade los tokens en tokens.mjs (primitivos y/o semánticos CON su variante dark; kebab-case; NO rompas nombres existentes; preserva valores exactos).  npm run build  para regenerar tokens.css.
   c) Commit +  npm version  (minor si añades, patch si corriges) +  git push origin main --tags.
   d) Re-apunta la dependencia de este proyecto al nuevo tag.
5) Verifica: corre el build del proyecto (y/o el dev server). Confirma que compila sin errores y que los tokens aplican, incluido el modo oscuro. Deja las instrucciones para probarlo.
6) Resume: qué instalaste, qué aplicaste, si tocaste el repo del design system y con qué versión, y cómo probar.

REGLAS
- El paquete es la única fuente de los tokens; NUNCA edites tokens.css a mano (es generado: edita tokens.mjs y  npm run build).
- Cada token semántico nuevo necesita variante dark.
- No rompas nombres de tokens existentes (otros proyectos dependen de ellos): renombrar/eliminar = major.
- Recuerda: esto es npm, no Composer/Packagist/vendor.
```
