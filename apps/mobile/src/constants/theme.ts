export const Colors = {
  primary: '#6C47FF',
  primaryLight: '#8B6FFF',
  primaryDark: '#4D2FE0',
  secondary: '#FF6B35',
  accent: '#00D9B5',

  physics: '#4A90E2',
  chemistry: '#E24A4A',
  biology: '#4AE26B',

  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',

  background: '#F5F7FF',
  surface: '#FFFFFF',

  xpGold: '#FFD700',
  streak: '#FF6B35',
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const FontSize = {
  xs: 10, sm: 12, md: 14, base: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30,
} as const;

export const BorderRadius = {
  sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999,
} as const;

export const Shadow = {
  sm: { shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  primary: { shadowColor: '#6C47FF', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
} as const;
