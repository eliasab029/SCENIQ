import { Platform } from 'react-native';

/** True when the web app runs from the home screen (installed PWA), not in a browser tab. */
export function isInstalledWebApp(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
  } catch {
    return false;
  }
}

export type MobileOS = 'ios' | 'android' | 'other';

export function detectMobileOS(): MobileOS {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  // iPadOS reports as Mac but has touch support
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}
