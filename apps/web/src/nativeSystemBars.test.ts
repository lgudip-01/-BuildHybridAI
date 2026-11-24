import { beforeEach, describe, expect, it, vi } from 'vitest';

const setStyle = vi.hoisted(() => vi.fn(async () => {}));
vi.mock('@capacitor/core', () => ({
  SystemBars: { setStyle },
  SystemBarsStyle: { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' },
}));
import { followThemeForSystemBars } from './nativeSystemBars';

function fakeMedia(matches: boolean) {
  const listeners: Array<(event: { matches: boolean }) => void> = [];
  return {
    matches,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => listeners.push(listener),
    change: (dark: boolean) => listeners.forEach(listener => listener({ matches: dark })),
  };
}

describe('followThemeForSystemBars', () => {
  beforeEach(() => setStyle.mockClear());

  it('uses light icons in dark mode and dark icons in light mode at startup', () => {
    followThemeForSystemBars(fakeMedia(true) as unknown as MediaQueryList);
    expect(setStyle).toHaveBeenLastCalledWith({ style: 'DARK' });
    followThemeForSystemBars(fakeMedia(false) as unknown as MediaQueryList);
    expect(setStyle).toHaveBeenLastCalledWith({ style: 'LIGHT' });
  });

  it('updates the icons when the theme changes while the app is open', () => {
    const media = fakeMedia(false);
    followThemeForSystemBars(media as unknown as MediaQueryList);
    media.change(true);
    expect(setStyle).toHaveBeenLastCalledWith({ style: 'DARK' });
    media.change(false);
    expect(setStyle).toHaveBeenLastCalledWith({ style: 'LIGHT' });
    expect(setStyle).toHaveBeenCalledTimes(3);
  });

  it('ignores a failed style call', async () => {
    setStyle.mockRejectedValueOnce(new Error('unavailable'));
    expect(() => followThemeForSystemBars(fakeMedia(true) as unknown as MediaQueryList)).not.toThrow();
    await Promise.resolve();
  });
});
