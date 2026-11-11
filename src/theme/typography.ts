import { TextStyle } from 'react-native';

export interface TypographyScale {
  hero: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  bodyMedium: TextStyle;
  caption: TextStyle;
  label: TextStyle;
  mono: TextStyle;
}

export const typography: TypographyScale = {
  hero: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  mono: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 18,
  },
};

export default typography;

