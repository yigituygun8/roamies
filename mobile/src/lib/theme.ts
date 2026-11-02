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
export const colors = {
  // Brand essentials
  background: '#080C22',
  accent: '#09E2A1',

  // Surfaces & Containers (cards, pills, chips)
  surface: '#141A38',
  surfaceLight: '#1E264E',
  surfaceSubtle: 'rgba(236, 234, 234, 0.08)',

  // Typography
  text: '#ECEAEA',
  textMuted: '#8E97B0',

  // Borders & Dividers
  borderSubtle: 'rgba(236, 234, 234, 0.12)',
} as const;
