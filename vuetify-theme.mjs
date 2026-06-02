/* ============================================================
 * Temas Vuetify (light + dark) construidos desde tokens.mjs.
 * Vuetify NO admite var() en `colors`, así que resolvemos cada
 * token semántico a su hex concreto (tokenToHex).
 *
 * Importado por assets/app.js.
 * ============================================================ */
import {
  semantic, primitives, vuetifyColorMap,
  THEME_LIGHT, THEME_DARK, tokenToHex,
} from './tokens.mjs';

function buildColors(scope) {
  const map = semantic[scope];
  const colors = {};
  for (const [vuetifyName, tokenName] of Object.entries(vuetifyColorMap)) {
    if (tokenName && map[tokenName]) colors[vuetifyName] = tokenToHex(map[tokenName]);
  }
  // Extras que Vuetify usa pero no tienen token semántico propio
  colors['primary-darken-1'] = primitives.color.slate[700];      // #2e3e48 (slate más oscuro, no azul)
  colors['secondary-darken-1'] = primitives.color.purple.teal;   // #018786
  colors['surface-bright'] = primitives.color.gray[0];
  colors['on-surface-variant'] = primitives.color.gray[200];
  return colors;
}

const sharedVariables = {
  'border-color': '#000000',
  'border-opacity': 0.12,
  'high-emphasis-opacity': 0.87,
  'medium-emphasis-opacity': 0.60,
  'disabled-opacity': 0.38,
  'idle-opacity': 0.04,
  'hover-opacity': 0.04,
  'focus-opacity': 0.12,
  'selected-opacity': 0.08,
  'activated-opacity': 0.12,
  'pressed-opacity': 0.12,
  'dragged-opacity': 0.08,
  'theme-kbd': '#212529',
  'theme-on-kbd': '#FFFFFF',
  'theme-code': '#F5F5F5',
  'theme-on-code': '#000000',
};

export const smartEscrowTheme = {
  dark: false,
  colors: {
    ...buildColors('light'),
    // (sin override de surface-variant: usa el token --se-color-surface-variant = #f5f5f5,
    //  coherente con CSS/EasyAdmin; antes se pisaba a #424242 y divergía)
  },
  variables: { ...sharedVariables },
};

export const smartEscrowDarkTheme = {
  dark: true,
  colors: {
    ...buildColors('dark'),
  },
  variables: {
    ...sharedVariables,
    'border-color': '#FFFFFF',
    'theme-code': '#2c383a',
    'theme-on-code': '#FFFFFF',
  },
};

export const themeNames = { light: THEME_LIGHT, dark: THEME_DARK };
