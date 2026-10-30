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
  background: '#080C22',
  accent: '#09E2A1',
  text: '#ECEAEA',
} as const;
