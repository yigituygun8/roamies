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

  // Surfaces & Containers (cards, pills, chips)
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  surfaceSubtle: 'rgba(0, 0, 0, 0.04)',

  // Typography
  text: '#161B29',
  textMuted: '#6B7280',

  // Borders & Dividers
  borderSubtle: 'rgba(0, 0, 0, 0.08)',
} as const;

export const darkMode = {
  // Brand essentials
  background: '#0B0E17',
  accent: '#09E2A1',

  // Surfaces & Containers
  surface: '#161B29',
  surfaceLight: '#1F263A',
  surfaceSubtle: 'rgba(255, 255, 255, 0.05)',

  // Typography
  text: '#F0F0F0',
  textMuted: '#8E97B0',

  // Borders & Dividers
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
} as const;



import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const scheme = useColorScheme();
  // Si el sistema está en oscuro, devuelve darkMode, de lo contrario lightMode
  return scheme === 'dark' ? darkMode : lightMode;
};