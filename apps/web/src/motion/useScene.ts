import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './reducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Runs a GSAP animation scene scoped to one section. Selectors inside `build` only match elements within
 * `scope`, and everything is cleaned up when the component unmounts. Skipped for reduced motion, so write
 * scenes with gsap.from() or ScrollTrigger and leave the resting state visible in CSS.
 */
export function useScene(
  scope: RefObject<HTMLElement | null>,
  build: (tools: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void,
): void {
  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => build({ gsap, ScrollTrigger }), scope);
    return () => ctx.revert();
    // The scene is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}
