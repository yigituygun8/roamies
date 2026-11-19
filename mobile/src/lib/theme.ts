import { useColorScheme } from 'react-native';

/**
 * Shared brand palette, sampled from assets/images/roamies-logo.png.
 *
 * `background` is duplicated in three places on purpose. Keep them in sync:
 *   1. here (app UI)
 *   2. app.json -> expo.backgroundColor and expo-splash-screen.backgroundColor
 *   3. the background baked into assets/videos/splash.mp4
 * If you change it, the splash video has to be re-composited from the
 * transparent master, otherwise its square edge becomes visible on screen.
 */
export const lightMode = {
  // Brand essentials
  background: '#e6f0ed',
  accent: '#09E2A1',
  /** Accent tuned for text and icons on a light surface (meets contrast). */
  accentText: '#0A7D5E',

  // Surfaces & Containers (cards, pills, chips)
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  surfaceSubtle: 'rgba(0, 0, 0, 0.04)',

  // Typography
  text: '#161B29',
  textMuted: '#6B7280',

  // Borders & Dividers
  borderSubtle: 'rgba(0, 0, 0, 0.08)',

  // Feedback
  /** Error text on a light surface (meets contrast). */
  danger: '#B42318',
} as const;

export const darkMode = {
  // Brand essentials
  background: '#080C22',
  accent: '#09ca90',
  /** Accent tuned for text and icons on a dark surface (meets contrast). */
  accentText: '#09E2A1',

  // Surfaces & Containers
  surface: '#161B29',
  surfaceLight: '#1F263A',
  surfaceSubtle: 'rgba(255, 255, 255, 0.05)',

  // Typography
  text: '#F0F0F0',
  textMuted: '#8E97B0',

  // Borders & Dividers
  borderSubtle: 'rgba(255, 255, 255, 0.1)',

  // Feedback
  /** Error text on a dark surface (meets contrast). */
  danger: '#FF8A80',
} as const;/**
 * Colours for content that sits on top of a full-bleed photo.
 *
 * These do not switch with the system theme on purpose: the scrim over the
 * photo is always dark, so the text on top has to stay light in both modes.
 */
export const onPhoto = {
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.76)',
  glassFill: 'rgba(255, 255, 255, 0.14)',
  glassBorder: 'rgba(255, 255, 255, 0.28)',
  /** Base RGB of the scrim, passed to `<Scrim color={onPhoto.scrimRgb} />`. */
  scrimRgb: '8, 12, 34',
  /** Dark label colour used on filled white or accent buttons. */
  ink: '#0B1220',
} as const;

export const useTheme = () => {
  const scheme = useColorScheme();
  // Si el sistema está en oscuro, devuelve darkMode, de lo contrario lightMode
  return scheme === 'dark' ? darkMode : lightMode;
};