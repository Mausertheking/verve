/**
 * The locked palette. Every pair here was contrast-checked before it went in —
 * see CLAUDE.md for the measured ratios. Do not add a colour without checking
 * it against the surface it sits on.
 *
 * Depth comes from borders and flat surface steps. There are no shadow tokens
 * and no gradient tokens on purpose.
 */
export const colors = {
  bg: '#0B0E14',
  surface: '#131A24',
  surfaceRaised: '#1B2432',
  border: '#232C3A',

  accent: '#C2687A',
  accentPressed: '#A85C6E',
  /** Text and icons ON an accent fill. 5.56:1. Never use white here — it is 3.78:1 and fails AA. */
  onAccent: '#0B0E14',

  textPrimary: '#E9ECF2',
  textSecondary: '#9AA5B5',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 12,
  pill: 999,
} as const;

/**
 * System fonts only — nothing is downloaded at runtime.
 *
 * Sizes are deliberately generous: this is read outdoors, on a mid-range
 * screen, often in bright sun. Line heights are loose because Azerbaijani and
 * Russian run roughly 30% longer than English and must wrap, never clip.
 */
export const type = {
  title: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  h2: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 25 },
  label: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  small: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 17 },
  overline: { fontSize: 11, fontWeight: '600', lineHeight: 15, letterSpacing: 0.7 },
} as const;

/** Minimum tap target. The app is used one-handed, sometimes with cold hands. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const MIN_TAP = 44;
