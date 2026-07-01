// src/shared/constants/theme.js
// Tema "Bi Digital Blue" — tokens derivados de DESIGN.md (raíz del monorepo).
// Única fuente de color/espaciado de la app. No hardcodear colores fuera de aquí.
// Los colores viven en paletas (LIGHT_COLORS/DARK_COLORS); el resto de tokens
// (spacing, radius, fuente) son independientes del modo claro/oscuro.

export const LIGHT_COLORS = {
  // Marca
  primary: '#002241',
  primaryContainer: '#003865',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#7ba2d5',

  // Secundario / teal digital
  secondary: '#006973',
  secondaryContainer: '#57eafe',
  onSecondary: '#ffffff',
  tealLight: '#66dae5',
  lightTealSurface: '#f4f9fa',

  // Superficies
  background: '#fdfdfd',
  surface: '#ffffff',
  surfaceVariant: '#edeeed',
  surfaceDim: '#d9dada',

  // Texto
  text: '#1a1c1c',
  textVariant: '#42474f',
  textLight: '#6b7280',
  inverseText: '#f0f1f0',

  // Bordes
  border: '#e5e7eb',
  outline: '#737780',
  outlineVariant: '#c2c6d0',

  // Estados
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  success: '#006973',
  successSurface: '#e8f6f8',
  warning: '#ffba3c',
  warningSurface: '#fff3df',
  onWarning: '#604100',

  // Dirección de movimientos (ingreso/egreso) — distintos de success/error.
  income: '#1b8e3f',
  incomeSurface: '#e3f6e9',
  onIncome: '#ffffff',
  expense: '#c5221f',
  expenseSurface: '#fbe9e7',
  onExpense: '#ffffff',

  // Utilidad
  white: '#ffffff',
  transparent: 'transparent',
  overlay: 'rgba(0, 34, 65, 0.45)',
};

export const DARK_COLORS = {
  // Marca — en oscuro el acento se aclara para tener contraste sobre
  // superficies oscuras (iconos, tabs activos, header).
  primary: '#7ba2d5',
  primaryContainer: '#123a61',
  onPrimary: '#062136',
  onPrimaryContainer: '#d2e4ff',

  // Secundario / teal digital
  secondary: '#66dae5',
  secondaryContainer: '#004f57',
  onSecondary: '#00363a',
  tealLight: '#94e6ee',
  lightTealSurface: '#0c2e31',

  // Superficies
  background: '#0e1113',
  surface: '#181c1f',
  surfaceVariant: '#25292c',
  surfaceDim: '#0a0c0d',

  // Texto
  text: '#eceeee',
  textVariant: '#c2c6ce',
  textLight: '#8d939c',
  inverseText: '#1a1c1c',

  // Bordes
  border: '#2c3033',
  outline: '#8d939c',
  outlineVariant: '#3a3e42',

  // Estados
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  success: '#66dae5',
  successSurface: '#0c2e31',
  warning: '#ffd699',
  warningSurface: '#4d3c14',
  onWarning: '#2b1e00',

  // Dirección de movimientos (ingreso/egreso) — distintos de success/error.
  income: '#4ade80',
  incomeSurface: '#0f2a18',
  onIncome: '#06170c',
  expense: '#ff8a80',
  expenseSurface: '#3a100e',
  onExpense: '#2a0a09',

  // Utilidad
  white: '#ffffff',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const PALETTES = { light: LIGHT_COLORS, dark: DARK_COLORS };

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  gutter: 16,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  card: 16,
  pill: 30,
  full: 9999,
};

export const FONT = {
  light: 'OpenSans_300Light',
  regular: 'OpenSans_400Regular',
  bold: 'OpenSans_700Bold',
};

export const FONT_SIZE = {
  caption: 11,
  label: 13,
  body: 14,
  bodyLg: 16,
  title: 18,
  headline: 22,
  display: 28,
};

const LIGHT_SHADOWS = {
  none: {},
  // Ambient sutil para elementos flotantes (modales, dropdowns).
  ambient: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
};

const DARK_SHADOWS = {
  none: {},
  ambient: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 1,
  },
};

export const SHADOW_PALETTES = { light: LIGHT_SHADOWS, dark: DARK_SHADOWS };

export default { PALETTES, SPACING, RADIUS, FONT, FONT_SIZE, SHADOW_PALETTES };
