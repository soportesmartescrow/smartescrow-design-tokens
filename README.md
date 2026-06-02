# Pronto Pago — Design Tokens

Sistema de **design tokens** que nuclea en un solo lugar toda la estética de Pronto Pago
(slate + verde, tipografía Poppins). Su objetivo: poder reproducir **exactamente** el mismo
aspecto en cualquier sitio — la SPA Vue/Vuetify, las páginas Twig, EasyAdmin u otras
plataformas — incluyendo **modo oscuro**.

> Hermano de `public/css/se-tokens.css` (el design system **SmartEscrow** azul/lima + Geist,
> usado por la landing y declarado *shared across all platforms* en `public/js/se-header.jsx`).
> Comparten **arquitectura y naming `--se-*`**; cada uno aporta **sus propios valores de marca**.
> Un componente escrito contra `var(--se-…)` se ve "ProntoPago" o "SmartEscrow" según qué archivo
> de tokens cargue la página.

---

## 1. Arquitectura

```
assets/design-tokens/
├── tokens.mjs          ← FUENTE DE VERDAD (ESM). Editar AQUÍ.
├── build-tokens.mjs    ← Generador: tokens.mjs → tokens.css (node, sin deps)
├── tokens.css          ← GENERADO. Artefacto portable (NO editar a mano)
├── vuetify-theme.mjs   ← Construye los temas Vuetify light/dark desde tokens.mjs
└── README.md           ← Este documento
```

Tres capas:

1. **Primitivos** — la paleta cruda y las escalas (color, tipografía, radios, sombras,
   espaciado, z-index). Valores literales. Ej. `--se-green-500: #87bd78`.
2. **Semánticos** — el *propósito*, referencian primitivos y tienen variante **light/dark**.
   Ej. `--se-color-brand`, `--se-color-surface`, `--se-color-text`. Es lo que se debe usar
   en el 95 % de los casos.
3. **Tema Vuetify** — mapea los semánticos a los nombres que Vuetify espera (`primary`,
   `surface`, `success`…), resueltos a hex (Vuetify no admite `var()` en `colors`).

### Flujo de generación

```
tokens.mjs ──(npm run build)──▶ tokens.css ──(css-loader / <link>)──▶ navegador
     │
     └──(import)──▶ vuetify-theme.mjs ──▶ createVuetify({ themes }) en app.js
```

`tokens.css` es la única fuente para el CSS; **nunca se edita a mano** (cabecera lo recuerda).

---

## 2. Cómo se consume hoy en este proyecto

| Contexto | Cómo llegan los tokens |
|---|---|
| SPA Vue + `<style scoped>` | `base.scss` hace `@import '../design-tokens/tokens.css'` (css-loader lo inlina en el entry `style`). Las custom properties cascadean a los estilos *scoped*. |
| Plantillas que heredan de `base.html.twig` (registro) | Cargan el entry `style` ⇒ tokens disponibles. |
| Páginas Twig **standalone** (restablecer/cambiar contraseña) | `{{ encore_entry_link_tags('design-tokens') }}` en el `<head>`. |
| Tema Vuetify (light + dark) | `app.js` importa `vuetify-theme.mjs`. |

`webpack.config.js` emite además un artefacto autónomo:

```js
.addStyleEntry('design-tokens', './assets/design-tokens/tokens.css')
// → public/build/design-tokens.css
```

Ese `design-tokens.css` es el **droppable portable**: un solo `<link>` y cualquier página
obtiene la estética de Pronto Pago.

---

## 3. Uso

### En SCSS / CSS / `<style>` de Vue
```scss
.mi-boton {
  background: var(--se-color-brand);
  color: var(--se-color-on-brand);
  border-radius: var(--se-r-md);
  box-shadow: var(--se-shadow-sm);
}
.mi-boton:hover { background: var(--se-color-brand-hover); }
```
> En `<style scoped>` funciona sin más: las custom properties **se heredan** aunque el scope
> añada atributos `[data-v-…]`.

### En Twig (página standalone)
```twig
<head>
  {{ encore_entry_link_tags('design-tokens') }}
  <style> .cta { background: var(--se-color-primary); color: var(--se-color-on-primary); } </style>
</head>
```

### En JavaScript (p. ej. otro framework)
```js
import { primitives, semantic, tokenToHex } from './design-tokens/tokens.mjs';
const brand = primitives.color.green[500];          // '#87bd78'
const surface = tokenToHex(semantic.light['color-surface']); // '#ffffff'
```

---

## 4. Modo oscuro

Los tokens **semánticos** cambian de valor en oscuro; los **primitivos** no. Se activa de dos
formas equivalentes:

- **Vuetify** (la SPA): el tema `smartEscrowDarkTheme` aplica la clase
  `.v-theme--smartEscrowDarkTheme` a la raíz de `<v-app>`, que dispara los overrides del CSS.
  El botón flotante de `App.vue` (`toggleTheme`) alterna light/dark.
- **Sin Vue** (EasyAdmin, HTML plano): añade el atributo al `<html>`:
  ```html
  <html data-se-theme="dark">
  ```

El bloque de overrides vive en `tokens.css`:
```css
.v-theme--smartEscrowDarkTheme,
[data-se-theme="dark"] { /* --se-color-* re-definidos */ }
```

Como el código usa **semánticos**, el modo oscuro "simplemente funciona" sin tocar componentes.

---

## 5. Integración con el branding por tenant (SSO SDK)

`base.html.twig` inyecta, por usuario, `--brand-primary`, `--brand-bg`, `--brand-text`
(vía `get_branding()` del bundle `smartescrow/sso-sdk`). Los tokens de marca **los respetan**
como override con *fallback*:

```css
--se-color-primary: var(--brand-primary, var(--se-slate-600));
--se-color-bg:      var(--brand-bg,      var(--se-gray-50));
--se-color-text:    var(--brand-text,    var(--se-slate-600));
```

⇒ Si el tenant define su color, manda; si no, se usa el de Pronto Pago. Nada que configurar.

---

## 6. Catálogo de tokens

### Color · primitivos
| Familia | Variables | Uso |
|---|---|---|
| Slate | `--se-slate-{500..950}` (`#36414f` = **600**, primario) | marca / superficies oscuras |
| Verde | `--se-green-{50..900}` (`#87bd78` = **500** acción, `#8dc63f` = **400** CTA) | acento de marca |
| Éxito | `--se-success-500` (`#64d26f`) | semántico de éxito |
| Gris | `--se-gray-{0..950}` | neutros, texto, bordes, scroll |
| Azul | `--se-blue-{info,link,bootstrap,ghost,ghost-border}` | informativos / drag |
| Rojo | `--se-red-{text,base,hover}` | peligro |
| Naranja | `--se-orange-warning` (`#ffa800`) | aviso |
| Púrpura | `--se-purple-{secondary,darken,teal}` | secundario Vuetify |

### Color · semánticos (light → dark)
| Token | Light | Dark |
|---|---|---|
| `--se-color-primary` | slate-600 `#36414f` | slate-500 `#424242` |
| `--se-color-on-primary` | `#ffffff` | `#ffffff` |
| `--se-color-brand` | green-500 `#87bd78` | green-500 |
| `--se-color-brand-hover` | green-650 `#6fb46a` | green-200 |
| `--se-color-brand-strong` | green-400 `#8dc63f` | green-400 |
| `--se-color-brand-subtle` | green-50 `#e5f3df` | slate-800 |
| `--se-color-success / -warning / -danger / -info` | semánticos de estado | aclarados |
| `--se-color-bg` | gray-50 `#f8f8f8` | slate-950 `#1e2124` |
| `--se-color-surface` | `#ffffff` | slate-900 `#24282c` |
| `--se-color-surface-variant` | gray-100 `#f5f5f5` | slate-800 |
| `--se-color-text` | slate-600 | gray-200 |
| `--se-color-text-muted` | gray-700 `#666` | gray-500 |
| `--se-color-border` | gray-300 `#e0e0e0` | slate-550 |
| `--se-color-scrollbar-{track,thumb,thumb-brand}` | gris/verde | slate/verde oscuro |
| `--se-color-overlay / -overlay-soft / -hover` | washes negros | washes claros |
| `--se-color-footer-{bg,text,divider}` | footer oscuro | footer oscuro |

> Lista completa y exacta: ver `tokens.css` generado o `semantic` en `tokens.mjs`.

### Estructura (mismo contrato que `se-tokens.css`)
| Grupo | Variables | Valores ProntoPago |
|---|---|---|
| Tipografía | `--se-font-{sans,mono}` | `'Poppins', 'Roboto', system-ui` / mono |
| Tamaño | `--se-text-{xs,sm,base,md,lg,xl,2xl,3xl}` | 0.8rem … 2rem |
| Peso | `--se-weight-{regular,medium,bold}` | 400 / 500 / 700 |
| Radio | `--se-r-{xs,sm,md,lg,full}` | 4 / 5 / **10** / 12 / 999 px |
| Sombra | `--se-shadow-{sm,md,lg}` | sombras reales del proyecto |
| Espaciado | `--se-s-{1..16}` | 4 px → 64 px |
| z-index | `--se-z-{header,overlay,loader,loader-card,toast}` | capas reales |

---

## 7. Desarrollar y expandir el sistema

### 7.0 ¿Hay que bajárselo aparte?

- **Solo para CONSUMIR** (usar los tokens en una app): **no**. Se instala como dependencia
  (§11): por tag git, por registry o como carpeta hermana `file:../design-tokens`.
- **Para MODIFICAR / EXPANDIR** los tokens: **sí**, se trabaja sobre este repo. Dos formas:
  - Clonarlo aparte (lo habitual si vienes de otro proyecto):
    ```bash
    git clone git@github.com:soportesmartescrow/smartescrow-design-tokens.git
    cd smartescrow-design-tokens
    npm install            # opcional; el generador no tiene dependencias
    ```
  - O editar el checkout que ya existe como hermano del consumidor (p. ej. `../design-tokens`
    en ProntoPago). Como ese consumidor lo instala con `file:`, **los cambios se ven al
    instante** al recompilar sus assets (ideal para iterar).

### 7.1 Bucle de desarrollo

```bash
# 1) edita la fuente de verdad
$EDITOR tokens.mjs
# 2) regenera el CSS portable
npm run build                 # = node build-tokens.mjs  → reescribe tokens.css
# 3) revisa el resultado
git diff tokens.css           # comprueba que los cambios son los esperados
```
> **Nunca** edites `tokens.css` a mano: es un artefacto generado y se sobreescribe.
> La única fuente es `tokens.mjs`.

### 7.2 Cómo añadir cosas (recetas)

**a) Un nuevo tono en una escala de color existente** — solo `tokens.mjs`:
```js
// primitives.color.green
green: { /* … */ 950: '#2a5230' },     // → genera  --se-green-950
```

**b) Una nueva familia de color** — solo `tokens.mjs` (las familias de color se emiten
automáticamente: el generador recorre `primitives.color`):
```js
// primitives.color
teal: { 100: '#d3efe9', 500: '#1f9b8a', 900: '#0b3b34' },   // → --se-teal-100/500/900
```

**c) Un nuevo token semántico** (lo que usan las apps) — define light **y** dark:
```js
// semantic.light
'color-link': ref('blue.link'),
// semantic.dark
'color-link': ref('blue.ghost-border'),
//            → --se-color-link  (con override dark automático)
```
Valores posibles en la capa semántica:
- `ref('familia.tono')` → `var(--se-familia-tono)`.
- `ref('slate.600', { brand: 'primary' })` → `var(--brand-primary, var(--se-slate-600))`
  (respeta el branding por tenant, §5).
- `raw('rgba(0,0,0,.5)')` → literal tal cual.

**d) Exponerlo a Vuetify** (solo si Vuetify debe conocer ese color) — `tokens.mjs`:
```js
// vuetifyColorMap:  nombreVuetify -> nombre del token semántico
'on-background': 'color-text',
```

**e) Una nueva categoría estructural** (p. ej. *motion*, *breakpoints*) — requiere **dos** pasos:
```js
// 1) tokens.mjs  →  primitives
motion: { fast: '120ms', base: '200ms', slow: '320ms' },
```
```js
// 2) build-tokens.mjs  →  dentro de :root, añade una línea emitScale
${emitScale('motion', primitives.motion, `${p}-motion`)}   // → --se-motion-fast, …
```
(Las **familias de color** no necesitan el paso 2; el resto de escalas sí, porque se emiten una a una.)

### 7.3 Convenciones (mantener la coherencia)

- Nombres en **kebab-case** (`ghost-border`, no `ghostBorder`); prefijo siempre `--se-`.
- **Preservar look**: si tokenizas un valor existente, usa su hex exacto (no “redondees”).
- Reusa el **mismo naming/escalas** que `public/css/se-tokens.css` (sistema hermano): así un
  componente escrito contra `var(--se-…)` funciona bajo cualquiera de las dos identidades.
- Cada semántico nuevo: **siempre** con su variante en `semantic.dark`.

### 7.4 Probar el cambio en un consumidor antes de publicar

```bash
# opción rápida: empaquetado en seco (lista de archivos + ejecuta 'prepare')
npm pack --dry-run

# opción real: enlazar este repo en el proyecto consumidor
cd /ruta/al/proyecto
npm install /ruta/a/smartescrow-design-tokens     # o: npm link
npm run dev / encore dev                           # y revisa visualmente
```

### 7.5 Actualizar en git (subir los cambios)

```bash
npm run build                              # asegura tokens.css al día
git add -A && git commit -m "feat: <qué añadiste>"
npm version minor                          # SemVer (ver §10) — crea el tag
git push origin main --tags
```
Los consumidores actualizan con `npm update` o re-instalando el tag (§10–§11).
Detalle de publicación y versionado: **§9 y §10**.

---

## 8. El bundle (paquete npm)

Esta carpeta **es** un paquete npm autónomo: `@smartescrow/design-system`
(ver `package.json`). Se puede publicar y consumir desde otros proyectos sin copiar nada a mano.

**Contenido publicado** (campo `files`):

| Archivo | Para qué |
|---|---|
| `tokens.css` | Artefacto portable de tokens (CSS custom properties + dark). Base de todo. |
| `tokens.mjs` | Fuente de verdad + API JS (`primitives`, `semantic`, `tokenToHex`…). |
| `components.css` | **Componentes** genéricos reutilizables (`.se-btn/.se-card/.se-table/.se-badge/.se-input/.se-search/.se-submenu/.se-modal…`) sobre tokens. |
| `navbar.css` + `navbar.js` | **Navbar** (patrón sidebar→header horizontal): posicionamiento + mecánica vanilla (mover DOM, posicionar submenús, responsive). Sin negocio. |
| `adapters/easyadmin.css` | **Adaptador EasyAdmin**: mapea Bootstrap `--bs-*` y los selectores nativos de EasyAdmin a tokens/componentes + navbar. |
| `vuetify-theme.mjs` | Temas Vuetify light/dark listos. |
| `build-tokens.mjs` | Generador (se ejecuta solo en `prepare`/`build`). |

**Puntos de entrada** (campo `exports`):

```js
import { primitives, semantic } from '@smartescrow/design-system';            // API JS de tokens
import { smartEscrowTheme, smartEscrowDarkTheme } from '@smartescrow/design-system/vuetify';
import '@smartescrow/design-system/css';            // tokens.css (base, siempre primero)
import '@smartescrow/design-system/components';     // clases .se-* (botones, tablas, badges…)
import '@smartescrow/design-system/navbar.css';     // posicionamiento de la navbar
import { initNavbar } from '@smartescrow/design-system/navbar.js'; // mecánica navbar
import '@smartescrow/design-system/easyadmin';      // adaptador EasyAdmin (themea Bootstrap)
```

`tokens.css` se regenera automáticamente al instalar (script `prepare`).

### Componentes, navbar y adaptadores (reutilizables por cualquier sistema)

- **`components.css`** — capa de componentes 100 % basada en tokens, **no acoplada a ningún
  framework**. Cualquier plataforma puede usar `.se-btn`, `.se-card`, `.se-table`, `.se-badge--success`,
  `.se-input`, `.se-field` (floating label), `.se-search`, `.se-submenu`, `.se-modal`, `.se-alert`…
- **`navbar.css` + `navbar.js`** — el patrón "sidebar clásica → navbar horizontal en el header".
  El CSS aporta el posicionamiento (`.se-navbar*`); el JS la mecánica parametrizable:
  ```js
  initNavbar({
    relocate:   [{ from: '.navbar-custom-menu', to: '.admin-options-gg' }],
    submenus:   { item: '.main-menu-item', panel: '.submenu', top: 50, offsetX: -80 },
    responsive: { toggle: '.three-dots-menu', overlay: '.custom-overlay', mobile: '.custom-mobile-menu' },
  });
  ```
  No hace fetch ni contiene lógica de negocio: cada plataforma pasa SUS selectores.
- **`adapters/easyadmin.css`** — capa **fina** específica de EasyAdmin: reasigna las variables de
  Bootstrap 5 (`--bs-primary/--bs-body-bg/…`) a los tokens (themea de golpe botones/tablas/forms/
  modales) y aplica el navbar + componentes a los selectores nativos (`.sidebar`, `.main-menu`,
  `.submenu`, `.content-top`…). Otros entornos tendrían su propio adaptador (Tailwind, Vuetify…).

> **Regla de reutilización:** `components.css` y `navbar.*` **no** dependen de selectores de
> EasyAdmin; solo el adaptador lo hace. Así otro sistema con esos componentes los usa directamente.

---

## 9. Publicar el bundle (subirlo)

> **Recomendado:** repositorio Git en la org `github.com/smartescrow/`, igual que el resto de
> paquetes SmartEscrow (el SSO SDK se distribuye así, vía VCS). No requiere registry npm.

> **Este repositorio ES el paquete.** Su raíz vive en
> `github.com/soportesmartescrow/smartescrow-design-tokens` (y, en local, como carpeta hermana
> de los proyectos consumidores, p. ej. `../design-tokens`). ProntoPago lo consume vía
> `file:../design-tokens`; otros proyectos, vía tag git.

### Opción A · Repo Git (recomendado, alineado con el stack actual)
```bash
# trabajando en la raíz de ESTE repo
npm run build                 # regenera tokens.css desde tokens.mjs
git add -A && git commit -m "feat: <cambio>"
git push origin main
git tag v1.0.0 && git push --tags     # las versiones se referencian por tag
```

### Opción B · Registry npm (si se habilita uno, p. ej. GitHub Packages)
```bash
# autenticarse en el registry (~/.npmrc con //npm.pkg.github.com/:_authToken=...)
npm publish        # 'prepare' regenera tokens.css antes de empaquetar
```
`publishConfig.access` está en `restricted` (paquete privado). Cámbialo a `public` solo si procede.

---

## 10. Actualizar el bundle

1. Edita **`tokens.mjs`** (único sitio).
2. `npm run build:tokens` (regenera `tokens.css`).
3. Sube la versión con **SemVer** y publica (en la raíz de este repo):
   ```bash
   npm version patch   # 1.0.0 -> 1.0.1  (fix sin cambio visual)
   # npm version minor # 1.1.0  (tokens nuevos, retrocompatibles)
   # npm version major # 2.0.0  (renombrar/eliminar tokens: rompe consumidores)
   git push && git push --tags        # (Opción A)  ó  npm publish  (Opción B)
   ```
   Regla SemVer para tokens: **añadir** token = minor; **renombrar/eliminar** = major;
   cambiar un **valor** sin tocar nombres = patch o minor según impacto visual.
4. En los proyectos consumidores: `npm update @smartescrow/design-system`
   (o fija el tag: `#v1.0.1`).

---

## 11. Instalar / aplicar en OTRO proyecto

### Instalar
```bash
# Desde Git (Opción A) — fija siempre un tag:
npm install github:soportesmartescrow/smartescrow-design-tokens#v1.0.0
#   (equivalente SSH)  npm install git+ssh://git@github.com/soportesmartescrow/smartescrow-design-tokens.git#v1.0.0

# Como carpeta hermana local (lo que usa ProntoPago hoy):
npm install ../design-tokens          # -> "file:../design-tokens"

# Desde registry npm (Opción B):
npm install @smartescrow/design-system
```

### Caso 1 · Proyecto Vue + Vuetify
```js
import { createVuetify } from 'vuetify';
import { smartEscrowTheme, smartEscrowDarkTheme, themeNames }
  from '@smartescrow/design-system/vuetify';
import '@smartescrow/design-system/css';   // define las --se-* (light + dark)

export default createVuetify({
  theme: {
    defaultTheme: themeNames.light,
    themes: { [themeNames.light]: smartEscrowTheme, [themeNames.dark]: smartEscrowDarkTheme },
  },
});
```
Luego, en tus estilos, usa `var(--se-color-*)`, `var(--se-r-*)`, etc.

### Caso 2 · Proyecto sin JS / Symfony Twig / HTML plano
Sirve el CSS y enlázalo en el `<head>`:
```html
<link rel="stylesheet" href="/path/a/node_modules/@smartescrow/design-system/tokens.css">
```
o cópialo a tu carpeta pública / pásalo por tu bundler. Modo oscuro: `<html data-se-theme="dark">`.

### Caso 3 · EasyAdmin
Tiene su propia guía paso a paso (incluye el adaptador, la navbar y el override del layout):
**ver §12**.

---

## 12. Aplicar en un proyecto EasyAdmin (guía completa)

> Esta sección es **probada en producción** (wallet). EasyAdmin (Symfony) ya usa Bootstrap 5, así
> que el adaptador `easyadmin.css` lo **temática entero** reasignando `--bs-*` a tokens, y aplica
> la transformación *sidebar → navbar horizontal* sobre los selectores nativos de EasyAdmin.

### 12.1 Método recomendado: ficheros ESTÁTICOS (no WebpackEncoreBundle)

**Importante (lección aprendida):** **no** uses `Assets->addWebpackEncoreEntry()` salvo que el
proyecto ya tenga `WebpackEncoreBundle` instalado **y habilitado** y lo uses en otras partes. En
EasyAdmin 4.24 nos encontramos con que: (a) si el bundle no está habilitado, la llamada es un
**no-op silencioso** (no carga nada → se ven los botones azul/naranja por defecto de Bootstrap y
vuelve la sidebar vertical); y (b) al habilitarlo, EA **escapaba** los tags (aparecían como texto).
El mecanismo robusto y que EA siempre renderiza bien es `addCssFile()` / `addJsFile()` con ficheros
en `public/`.

### 12.2 Pasos

**1) Instala el paquete** (por tag git, §11) o como carpeta hermana `file:`.

**2) Genera los assets estáticos** desde el paquete con un pequeño script de build
(`bin/build-admin-assets.mjs` en el proyecto):
```js
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = join(root, 'node_modules', '@smartescrow', 'design-system');
const css = ['tokens.css', 'components.css', 'navbar.css', 'adapters/easyadmin.css']
  .map(f => `/* ${f} */\n` + readFileSync(join(pkg, f), 'utf8')).join('\n\n');
mkdirSync(join(root, 'public/css'), { recursive: true });
writeFileSync(join(root, 'public/css/se-admin.css'), css);
mkdirSync(join(root, 'public/js'), { recursive: true });
copyFileSync(join(pkg, 'navbar.global.js'), join(root, 'public/js/se-navbar.js'));
```
Ejecuta `node bin/build-admin-assets.mjs`. Produce:
- `public/css/se-admin.css` — tokens + componentes + navbar + adaptador EasyAdmin (todo en uno).
- `public/js/se-navbar.js` — la mecánica de navbar (build clásica IIFE → `window.SeNavbar`).

> El **orden de concatenación importa**: `tokens.css` primero (define las `--se-*`).
> Re-ejecuta el script cada vez que actualices el paquete.

**3) Init de la navbar** — `public/js/se-admin-init.js` (clásico, tras `se-navbar.js`). Pásale los
selectores nativos de EasyAdmin de tu layout:
```js
(function () {
  function start() {
    if (!window.SeNavbar) return;
    window.SeNavbar.init({
      relocate: [                                  // mover piezas nativas al header
        { from: '.navbar-custom-menu', to: '.admin-options-gg' },
        { from: '.dropdown.dropdown-settings', to: '.admin-options-gg', index: 2 },
        { from: '.form-action-search', to: '.search-options-gg' },
      ],
      submenus:   { item: '.main-menu-item', panel: '.submenu', top: 50, offsetX: -80 },
      responsive: { toggle: '.three-dots-menu', overlay: '.custom-overlay', mobile: '.custom-mobile-menu' },
    });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
```

**4) La lógica de NEGOCIO va aparte** (`public/js/admin-business.js`): fetches, modales, timeouts,
enlaces SSO, etc. **No** la metas en el kit. `navbar.js` solo mueve/posiciona DOM.

**5) Cárgalo todo en `DashboardController::configureAssets()`** — el orden del JS importa
(`se-navbar.js` define `window.SeNavbar` **antes** que el init):
```php
public function configureAssets(): Assets
{
    return parent::configureAssets()
        ->addCssFile('css/se-admin.css')
        ->addJsFile('js/se-navbar.js')
        ->addJsFile('js/se-admin-init.js')
        ->addJsFile('js/admin-business.js');
}
```

**6) Override del layout** (`templates/bundles/EasyAdminBundle/layout.html.twig`) — el adaptador
asume la estructura DOM por defecto de EasyAdmin (`.sidebar`, `.sidebar-wrapper`, `.main-header`,
`.main-menu`, `.main-menu-item`, `.submenu`, `.header-right`) y unos contenedores donde
`relocate` deja las piezas: añade en el header `.logo-menu-container`, `.three-dots-menu`,
`.admin-options-gg`, `.search-options-gg`, y un `.custom-mobile-menu` + `.custom-overlay` para
móvil. **No** definas el `<style>` estructural a mano: lo aporta el adaptador. Define solo el
**branding** como contrato de tokens:
```twig
{% if app.user %}{% set b = get_branding() %}
  <style>:root{
    --brand-primary: {{ b.primary_color }};
    --brand-bg: {{ b.background_color }};
    --brand-text: {{ b.text_color }};
  }</style>
{% endif %}
```

### 12.3 Qué hace el adaptador (`adapters/easyadmin.css`)

- **Temática Bootstrap 5** reasignando `--bs-primary/--bs-body-bg/--bs-border-color/…` a tokens →
  botones, cards, tablas, forms y **modales** heredan la identidad sin tocar su HTML.
- Mapea variables **legacy** que pudiera usar tu layout (`--sidebar-bg`, `--secondary-color`,
  `--button-success-bg`, `--text-muted`…) a tokens.
- Reimplementa el **posicionamiento** sidebar→navbar (sticky, menú horizontal, submenús `fixed`,
  responsive) y los componentes propios de EA (badges de entidad, floating labels, select2,
  búsqueda, footer) con tokens.
- Mantiene la **jerarquía de z-index de modales** de EasyAdmin/Bootstrap.

Si tu EasyAdmin usa selectores distintos, ajusta **solo** `adapters/easyadmin.css` (en el kit) —
no toques `components.css`/`navbar.*`, que son agnósticos.

### 12.4 Consideraciones generales de Symfony

- **Rutas de assets:** `addCssFile('css/x')` resuelve a `public/css/x` vía `asset()`. Por eso los
  ficheros generados van a `public/`.
- **`cache:clear` obligatorio** tras cambiar `configureAssets()` (es PHP, va en caché):
  `php bin/console cache:clear` (o `lando exec appserver -- php bin/console cache:clear`).
- **Caché del navegador:** los ficheros estáticos **no llevan hash**; tras regenerarlos haz
  **hard refresh** (Ctrl+Shift+R). En producción, versiónalos por ruta/cabeceras si necesitas
  *cache busting* agresivo.
- **Dark mode:** añade `data-se-theme="dark"` al `<html>` (los tokens semánticos hacen el resto).
- **Branding por tenant:** ya cubierto con `--brand-*` (§5). El navbar/primario = `primary_color`.
- **WebpackEncoreBundle (alternativa):** si tu proyecto SÍ lo tiene habilitado y funcionando,
  puedes en su lugar crear un entry Encore que importe `…/css`,`…/components`,`…/navbar.css`,
  `…/easyadmin` + `import { initNavbar } from '…/navbar.js'`, y cargarlo con
  `addWebpackEncoreEntry('admin')`. Verifica antes que `encore_entry_link_tags('admin')` renderiza
  tags reales (no escapados). Ante la duda, usa ficheros estáticos.

### 12.5 Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| Botones azul/naranja, sidebar vertical | El CSS del adaptador **no se carga** | Confirma `addCssFile('css/se-admin.css')` + `cache:clear` + hard refresh |
| Tags `<link>/<script>` visibles como **texto** | `addWebpackEncoreEntry` escapado por EA | Usa ficheros estáticos (§12.2) |
| Navbar sin reubicar usuario/búsqueda | `se-navbar.js`/init no cargó o selectores no coinciden | Revisa orden de `addJsFile` y los selectores de `relocate` |
| Submenús mal posicionados | falta el init o `submenus.item/panel` no coincide | Ajusta selectores en el init |
| Colores no son los del tenant | branding no inyectado | Define `--brand-*` en el layout (§12.2 paso 6) |

---

## 13. Navbar canónica — replicarla 100% fiel

La navbar (patrón *sidebar/menú → header horizontal*) tiene **una sola fuente de verdad**:

- **Valores** → tokens `--se-navbar-*` (`-bg`, `-fg`, `-active`, `-hover`, `-border`,
  `-scrollbar`, `-brand`). Estética Pronto Pago: header blanco, texto slate, subrayado activo
  slate, borde inferior fino, scroll horizontal como línea fina oscura.
- **Estética/posicionamiento** → `navbar.css` (clases `.se-navbar*`).
- **Comportamiento** → `navbar.js` (ESM) / `navbar.global.js` (clásico, `window.SeNavbar`).
- **Markup de referencia** → `navbar.html` (cópialo tal cual).

> Cualquier app que cargue `tokens.css + navbar.css` y use ese markup obtiene **exactamente** la
> misma navbar. EasyAdmin obtiene la **misma** navbar sin el markup `.se-navbar`: su adaptador
> (`adapters/easyadmin.css`) aplica los **mismos tokens `--se-navbar-*`** a sus selectores nativos.
> Por eso la navbar de ProntoPago y la de EasyAdmin son **idénticas** (misma fuente de valores).

### Replicar en una app nueva (3 pasos)

```html
<!-- 1) CSS (orden importa: tokens primero) -->
<link rel="stylesheet" href=".../tokens.css">
<link rel="stylesheet" href=".../components.css">
<link rel="stylesheet" href=".../navbar.css">

<!-- 2) Markup: copia la estructura de navbar.html (.se-navbar, .se-navbar__menu, __item.is-active, __submenu, __actions, __toggle/__overlay/__mobile) -->

<!-- 3) JS: comportamiento -->
<script src=".../navbar.global.js"></script>   <!-- o: import { initNavbar } from '@smartescrow/design-system/navbar.js' -->
<script>
  SeNavbar.init({
    submenus:   { item: '.se-navbar__item', panel: '.se-navbar__submenu', top: 56, offsetX: -20 },
    responsive: { toggle: '[data-se-navbar-toggle]', overlay: '[data-se-navbar-overlay]', mobile: '[data-se-navbar-mobile]', openClass: 'is-open' },
  });
</script>
```

### Re-temarla (sin tocar navbar.css)
Sobrescribe los tokens donde quieras (p. ej. una navbar oscura puntual):
```css
.mi-navbar-oscura {
  --se-navbar-bg: var(--se-slate-900);
  --se-navbar-fg: var(--se-gray-200);
  --se-navbar-active: var(--se-color-brand);
}
```
El **modo oscuro global** ya trae sus propios valores `--se-navbar-*` (vía `[data-se-theme="dark"]`).

### En EasyAdmin
No necesitas el markup `.se-navbar`: sigue la **§12**. El adaptador ya reproduce esta navbar sobre
`.main-header`/`.main-menu`/`.main-menu-item`/`.submenu` con los mismos `--se-navbar-*`.

---

## 14. Hoja de ruta

- **Adaptadores** oficiales por entorno: EasyAdmin (`--bs-*`), Tailwind preset, SCSS map.
- **Unificación** con `public/css/se-tokens.css`: extraer el contrato común de naming a un
  paquete base (`@smartescrow/tokens-core`) y publicar cada identidad (prontopago, smartescrow)
  como un *theme* intercambiable.
- **Componentes**: la librería de clases (`.se-btn`, `.se-card`…) de `se-tokens.css` no está
  portada aquí (la SPA usa Vuetify); valorar un set neutro compartido.
- Tokenizar los pocos colores incidentales restantes (404 `NotFound.vue`, overlays
  `rgba(0.7…)`, bordes blancos del footer) si se decide unificar también esos casos.
