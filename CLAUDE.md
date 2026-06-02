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
6. **En DARK se ignora el branding por tenant.** `--brand-primary/bg/text` son colores de modo
   CLARO (no conmutan); aplicarlos en dark rompe el contraste (texto oscuro sobre fondo oscuro).
   Por eso en `semantic.dark` los tokens de texto/fondo/primario van **sin** `{ brand }`
   (`color-text`, `color-bg`, `color-canvas`, `color-primary` usan valores oscuros del sistema).
   El branding solo manda en LIGHT.

## Mapa del repo

- `tokens.mjs` — primitivos (`primitives`), semánticos (`semantic.light/dark`),
  `vuetifyColorMap`, helpers `ref()/raw()/tokenToCss()/tokenToHex()`.
- `build-tokens.mjs` — generador `tokens.mjs → tokens.css` (sin dependencias).
- `vuetify-theme.mjs` — temas Vuetify `smartEscrowTheme` / `smartEscrowDarkTheme`
  (resuelve semánticos a hex; Vuetify no admite `var()`).
- `tokens.css` — artefacto portable generado (`:root` light + bloque dark + override `.cw-btn` del
  widget de chatbot). El bloque dark se dispara con `.v-theme--smartEscrowDarkTheme`,
  `[data-se-theme="dark"]`, **`.ea-dark-scheme`** (EasyAdmin) y `[data-bs-theme="dark"]`.
- `fonts.css` — `@import` de **Poppins + Roboto** (texto) y **`@mdi/font`** (iconos MDI) desde Google
  Fonts/jsDelivr, para plataformas SIN las fuentes locales (EasyAdmin). La SPA NO lo necesita
  (carga Poppins/Roboto/MDI localmente). Su `@import` debe ir al principio de la hoja.
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

- **ProntoPago** (Vue3+Vuetify): importa `…/css` y `…/vuetify`. **Dependencia por TAG git**
  (`git+ssh://git@github.com/soportesmartescrow/smartescrow-design-tokens.git#vX.Y.Z`), NO `file:`.
  → `file:` crea un symlink que se ROMPE dentro de contenedores (lando/docker) que no montan la
  carpeta hermana (`@smartescrow/design-system → /design-tokens` inexistente) → "Cannot find module".
  Con `file:` además hace falta `resolve.symlinks=false` en webpack (Babel + core-js).
- **Wallet (EasyAdmin)**: hoy usa `file:../design-tokens` + `bin/build-admin-assets.mjs` que
  concatena `fonts + tokens + components + navbar + adapters/easyadmin` en `public/css/se-admin.css`
  (ese CSS estático se commitea y se sirve; para deploy/CI conviene pasarlo también a tag git).
- **GOTCHA al subir de tag** (`#v1.2.x → #v1.2.y`): el `package-lock.json` del consumidor pinea el
  COMMIT viejo y `npm install` lo reusa (2s, sin re-fetch). Para forzar:
  `npm cache clean --force && rm -rf node_modules/@smartescrow && npm install "git+ssh://…#vNUEVO" --force`.
- Antes de publicar un cambio, pruébalo en un consumidor (`npm pack --dry-run`, `npm link`, etc.).

## Importante

- **NO hay script `prepare`** (se quitó): regeneraba `tokens.css` al instalar y, con la caché git de
  npm, a veces servía una versión desfasada. El install usa el `tokens.css` **commiteado** → por eso
  la Regla de oro #2: regenera (`npm run build`) y commitea `tokens.css` SIEMPRE.
- No añadas dependencias de runtime: el generador funciona con Node puro (`engines.node >= 18`).
- `files` en `package.json` controla qué se publica; si añades archivos a distribuir, inclúyelos.

## EasyAdmin · lecciones (detalle en README §12)

- **Carga por ficheros estáticos**, NO `addWebpackEncoreEntry`: en EA 4.24 el bundle Encore puede
  no estar habilitado (no-op silencioso) y, habilitado, **escapa los tags**. Se usa
  `Assets::addCssFile/addJsFile` con ficheros en `public/` (lo que SIEMPRE renderiza bien).
- **Mismo chain en TODOS los dashboards/controllers** (p. ej. `TransferController`), no solo el
  principal, o esas páginas quedan sin estilos.
- **Dark** = clase `.ea-dark-scheme` en `<body>` (la pone `page-color-scheme.js`). El adaptador la
  re-asegura sobre `--bs-*` y fuerza navbar/cards/texto oscuros. Recordar: dark ignora branding
  (Regla de oro #6); sin eso el texto sale ilegible (color del tenant es de modo claro).
- **Fuentes en EA**: el token ya es Poppins, pero EA no la cargaba → `system-ui`. Se carga vía
  `fonts.css` (concatenado primero en `se-admin.css`) + `--bs-body-font-family: var(--se-font-sans)`.
- **Iconos**: ProntoPago usa **MDI** (`mdi-*` vía Vuetify); EA usa Font Awesome. Para igualar el
  avatar de usuario se carga MDI y se pinta `mdi-account-circle` (`\F0009`) con CSS sobre
  `.user-details::before` (EA `configureUserMenu` solo permite `setAvatarUrl`=imagen, no iconos).
- **Inputs/botones**: los valores se copiaron de **Vuetify real** (`node_modules/vuetify/lib/
  components/VField|VBtn/*.css`): input borde 1px translúcido (`--se-color-input-border`) + foco
  primary; botón `letter-spacing:0.0892857143em`, peso 500. El label flotante con *notch* de
  `v-field` NO se replica (estructura `fieldset/legend`; riesgoso en todos los tipos de campo de EA).
- **Branding del layout**: define `--brand-primary/bg/text` (no `--sidebar-bg` etc.); el adaptador
  mapea las legacy a tokens. Logo: acotar tamaño (venía con `height` inline grande).

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
- Modo oscuro: .v-theme--smartEscrowDarkTheme (Vuetify), [data-se-theme="dark"], .ea-dark-scheme (EasyAdmin)
  o [data-bs-theme="dark"]. En DARK se IGNORA el branding (es de modo claro): texto/fondo usan los valores oscuros.
- Branding por tenant (solo LIGHT): los tokens de marca respetan var(--brand-primary|bg|text) con fallback.
- Fuente Poppins + Roboto; iconos MDI (mismos que Vuetify). Si la plataforma no los carga localmente,
  usa el export "/fonts" (fonts.css: @import de Poppins/Roboto/@mdi/font) — necesario en EasyAdmin.
- Entradas (exports): "." (API JS), "/css" (tokens.css), "/fonts" (fuentes+MDI), "/components" (.se-*),
  "/navbar.css"+"/navbar.js"+"/navbar.global.js"+"/navbar.html", "/easyadmin" (adaptador), "/vuetify" (temas)
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
   - EasyAdmin (EasyCorp 4.x + Bootstrap 5). USA FICHEROS ESTÁTICOS, NO WebpackEncoreBundle:
     en EA 4.24 `addWebpackEncoreEntry` puede no estar habilitado (no-op) y/o ESCAPAR los <link>/<script>
     (se ven como texto). Receta probada (ver wallet: `bin/build-admin-assets.mjs`, `DashboardController`):
       1) BUNDLE CSS. Concatena, EN ESTE ORDEN, a un único CSS público (p.ej. public/css/se-admin.css):
            fonts.css → tokens.css → components.css → navbar.css → adapters/easyadmin.css
          · `fonts.css` VA PRIMERO (lleva @import de Poppins/Roboto/@mdi/font y los @import deben ir al
            inicio de la hoja). EA NO trae esas fuentes/iconos locales, así que este paso es OBLIGATORIO
            o el admin saldrá en system-ui y sin iconos MDI.
          · `adapters/easyadmin.css` reasigna `--bs-*` → tokens (themea Bootstrap), mapea el DOM de EA
            (`.main-header`, `.sidebar-wrapper`, `.main-menu`, `.main-menu-item`, `.form-control`, `.btn`,
            `.main-footer`…) a `--se-*`, pinta navbar con `--se-navbar-*`, el avatar con `mdi-account-circle`,
            el footer fiel a ProntoPago, el dark con `body.ea-dark-scheme {…}` y evita que una tabla ancha
            rompa nav/footer (`body/.wrapper { overflow-x: clip }` + scroll interno en `.datagrid`).
          Hazlo con un pequeño script Node (lee del paquete en node_modules y escribe a public/).
       2) NAVBAR JS. Copia `navbar.global.js` (build IIFE → `window.SeNavbar`) a public (p.ej.
          public/js/se-navbar.js).
       3) CARGA + INIT en el Dashboard `configureAssets()` (aplica a todo el backend; un controller
          standalone no-CRUD puede necesitar repetirlo). Orden EXACTO de los JS:
            addCssFile('css/se-admin.css')
            addJsFile('js/se-navbar.js')          // define window.SeNavbar
            addJsFile('js/se-admin-init.js')      // llama SeNavbar.init({ relocate:[…selectores EA…] })
            addJsFile('js/<tu-negocio>.js')       // fetches/modales/SSO — del proyecto, NO del kit
          IMPORTANTE: con `relocate` mueves la sidebar de EA al header; deja `submenus`/`responsive`
          al JS inline del layout si éste ya los maneja, para no duplicar el toggle (doble apertura).
       4) FOOTER. Añade en el layout un `<footer class="main-footer"><div class="footer-content">` con
          `.footer-links` (3 enlaces: privacidad/términos/contacto) y `.footer-copyright`; el adapter lo
          estiliza igual que ProntoPago (dos filas, divisor, separadores "|").
       5) BRANDING. En `layout.html.twig` define `--brand-primary/bg/text` desde tu `get_branding()`
          (los tokens los respetan en LIGHT; en DARK se ignoran a propósito).
       6) DARK. EA togglea el esquema añadiendo `ea-dark-scheme` al <body> (page-color-scheme.js nativo);
          el adapter ya cubre ese selector. No necesitas más.
     Conserva SOLO el posicionamiento sidebar→navbar; TODO lo visual (colores, sombras, radios, fuentes)
     debe quedar en tokens. Objetivo: que el admin sea indistinguible de ProntoPago en light y dark.
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
