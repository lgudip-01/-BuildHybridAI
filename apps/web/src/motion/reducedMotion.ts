/** True when the user has asked their device to cut down on animation. Every motion helper checks this. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
