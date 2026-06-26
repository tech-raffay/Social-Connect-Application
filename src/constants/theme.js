import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

export const COLORS = {
  primary: '#0095f6', // Instagram Blue Accent
  primaryDark: '#1877f2',
  secondary: '#ff3040', // Instagram Heart Red
  background: '#000000', // Pure black background
  surface: '#121212', // Slick dark surface
  surfaceLight: '#262626', // Light gray divider/border active state
  text: '#ffffff', // High contrast white
  textMuted: '#a8a8a8', // Subtle gray
  border: '#262626', // Minimalist divider line
  error: '#ff3040',
  success: '#00f5d4',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.85)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  subbody: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

// ──────────────────────────────────────────────
// Responsive Dimension Helpers
// ──────────────────────────────────────────────
export { rh, rw, rf };

