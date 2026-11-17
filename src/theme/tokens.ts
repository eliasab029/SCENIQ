/**
 * SCENIQ Design Tokens
 *
 * Single source of truth for every visual value in the app.
 * Components never hard-code colors, spacing or font sizes – they import from here.
 */

export const colors = {
  // Surfaces (from deepest to most elevated)
  background: '#0A0A0C',
  surface: '#131316',
  surfaceRaised: '#1B1B20',
  surfacePressed: '#24242A',

  // Lines
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',

  // Text
  text: '#F4F3F7',
  textSecondary: '#A09EAA',
  textTertiary: '#6E6C78',
  textOnAccent: '#0A0A0C',

  // Accent – a muted lavender-violet, used sparingly
  accent: '#9D8CFF',
  accentPressed: '#8775F2',
  accentSoft: 'rgba(157,140,255,0.14)',
  accentGlow: 'rgba(157,140,255,0.35)',

  // Status
  success: '#62D6A4',
  successSoft: 'rgba(98,214,164,0.14)',
  warning: '#F2C46D',
  warningSoft: 'rgba(242,196,109,0.14)',
  danger: '#F27878',
  dangerSoft: 'rgba(242,120,120,0.14)',

  // Overlays
  scrim: 'rgba(10,10,12,0.72)',
  transparent: 'transparent',
} as const;

/** Gradients used for hero surfaces. Kept subtle on purpose. */
export const gradients = {
  hero: ['#1E1A33', '#131316'] as const,
  accent: ['#B3A6FF', '#8775F2'] as const,
  fadeBottom: ['rgba(10,10,12,0)', 'rgba(10,10,12,0.95)'] as const,
};

/** 4-pt spacing scale. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  /** Default horizontal screen gutter */
  gutter: 20,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Font family names – must match the keys loaded in src/app/_layout.tsx */
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/**
 * Type scale. Display styles use the editorial serif,
 * everything functional uses Inter.
 */
export const typography = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -0.5 },
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.3 },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  callout: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.6 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Soft, low-contrast depth. Android uses elevation, iOS/web use shadow*. */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

/** Motion: durations (ms) and spring configs shared by all animations. */
export const motion = {
  fast: 150,
  base: 250,
  slow: 420,
  /** Stagger delay between list items entering */
  stagger: 60,
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
  pressScale: 0.97,
} as const;

export const layout = {
  /** Height of the floating tab bar (without safe-area inset) */
  tabBarHeight: 64,
  /** Max width for content on tablets / web */
  maxContentWidth: 560,
} as const;
