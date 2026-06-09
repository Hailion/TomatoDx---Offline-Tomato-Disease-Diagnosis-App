// ../../constants/Colors.ts
export type ThemeTokens = {
  background: string;
  backgroundAlt: string;
  surface: string;
  card: string;
  cardOverlay: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  muted: string;
  mutedLight: string;
  border: string;
  borderDark: string;
  borderLight: string;
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  primaryOverlay: string;
  primaryOverlay2: string;
  primaryOverlay3: string;
  success: string;
  successBg: string;
  successBgLight: string;
  successOverlay: string;
  successOverlay2: string;
  danger: string;
  warning: string;
  warningDark: string;
  black: string;
  transparent: string;
  shadowLight: string;
  shadowMedium: string;
  shadowDark: string;
  whiteOverlay: string;
  whiteMuted: string;
};

const light: ThemeTokens = {
  // overall
  background: '#f3f4f6',        // light page background
  backgroundAlt: '#f8fffc',     // subtle alternate background found in files
  surface: '#ffffff',           // card / surface
  card: '#ffffff',
  cardOverlay: '#ffffff9a',
  // text
  text: '#1f2937',              // primary text dark gray
  textSecondary: '#374151',     // secondary text
  textTertiary: '#4b5563',      // tertiary
  muted: '#6b7280',             // muted text
  mutedLight: '#696f78ff',
  // borders / strokes
  border: '#a8b0c1ff',
  borderDark: '#374151',
  borderLight: '#a8b0c1ff',
  // primary / success / accent
  primary: '#22c55e',           // green (button backgrounds)
  primaryDark: '#16a34a',
  primaryDarker: '#65a30d',
  primaryOverlay: 'rgba(34, 197, 94, 0.08)',
  primaryOverlay2: 'rgba(34, 197, 94, 0.1)',
  primaryOverlay3: 'rgba(34, 197, 94, 0.2)',
  // success / positive
  success: '#16a34a',
  successBg: '#f0fdf4',
  successBgLight: '#dcfce7',
  successOverlay: 'rgba(134, 239, 172, 0.05)',
  successOverlay2: 'rgba(134, 239, 172, 0.15)',
  // negative / warning
  danger: '#dc2626',
  warning: '#ea580c',
  warningDark: '#d97706',
  // misc
  black: '#000',
  transparent: 'transparent',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.7)',
  whiteOverlay: 'rgba(255, 255, 255, 0.1)',
  whiteMuted: 'rgba(255, 255, 255, 0.8)',
};

const dark: ThemeTokens = {
  // overall
  background: '#1f2937',       // dark background (used as page bg)
  backgroundAlt: '#111827',    // alternative dark bg possibility
  surface: '#111827',          // dark card surface
  card: '#111827',
  cardOverlay: '#1118279a',
  // text
  text: '#c0c4c2ff',             // bright text from files
  textSecondary: '#e5e7eb',    // lighter secondary text in dark mode
  textTertiary: '#9ca3af',
  muted: '#9ca3af',
  mutedLight: '#6b7280',
  // borders / strokes
  border: '#374151',
  borderDark: '#374151',
  borderLight: '#6b7282ff',
  // primary / success / accent
  primary: '#22c55e',          // keep primary green same in dark
  primaryDark: '#16a34a',
  primaryDarker: '#65a30d',
  primaryOverlay: 'rgba(34, 197, 94, 0.08)',
  primaryOverlay2: 'rgba(34, 197, 94, 0.1)',
  primaryOverlay3: 'rgba(34, 197, 94, 0.2)',
  // success / positive
  success: '#16a34a',
  successBg: '#052e0f',        // subtle dark friendly success background
  successBgLight: '#063816',
  successOverlay: 'hsla(142, 77%, 73%, 0.05)',
  successOverlay2: 'rgba(134, 239, 172, 0.15)',
  // negative / warning
  danger: '#dc2626',
  warning: '#ea580c',
  warningDark: '#d97706',
  // misc
  black: '#000',
  transparent: 'transparent',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.7)',
  whiteOverlay: 'rgba(255, 255, 255, 0.1)',
  whiteMuted: 'rgba(255, 255, 255, 0.8)',
};

export default { light, dark };
