// ─── Peakly Theme Constants ──────────────────────────────────────────────────
// Ported from app.jsx web version

export const FONT_FAMILY = 'PlusJakartaSans';

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const COLORS = {
  primary: '#0284c7',
  primaryLight: 'rgba(2,132,199,0.12)',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#e5e5e5',
  // Score colors
  scoreExcellent: '#22c55e',
  scoreGood: '#84cc16',
  scoreFair: '#eab308',
  scorePoor: '#f97316',
  scoreBad: '#ef4444',
  // Category accents
  heart: '#ef4444',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.55)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function getScoreColor(score) {
  if (score >= 90) return COLORS.scoreExcellent;
  if (score >= 75) return COLORS.scoreGood;
  if (score >= 60) return COLORS.scoreFair;
  if (score >= 45) return COLORS.scorePoor;
  return COLORS.scoreBad;
}
