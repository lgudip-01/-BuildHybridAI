import { SystemBars, SystemBarsStyle } from '@capacitor/core';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Keeps the phone's status-bar and navigation-bar icons readable against the page.
 * Capacitor resolves its default style once at startup and keeps that concrete style when the theme
 * changes, so switching to dark mode mid-session left dark icons on a dark bar (and the reverse).
 * We set the style ourselves now and on every theme change. Native apps only.
 */
export function followThemeForSystemBars(media: Pick<MediaQueryList, 'matches' | 'addEventListener'> = matchMedia(DARK_QUERY)): void {
  const apply = (dark: boolean) => {
    // Style.Dark means light icons for a dark background.
    SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {
      // Cosmetic only: a failure must never affect masking or review.
    });
  };
  apply(media.matches);
  media.addEventListener('change', event => apply(event.matches));
}
