import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './reducedMotion';

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = { y?: number; duration?: number; stagger?: number };

/**
 * Fades and lifts each element matching `selector` (inside `scope`) into place the first time it scrolls into
 * view. Usage:  const ref = useRef<HTMLElement>(null);  useReveal(ref, '.pane');  <main ref={ref}>…</main>
 * Does nothing when the user prefers reduced motion, so content is never left hidden.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, selector: string, options: RevealOptions = {}): void {
  const { y = 24, duration = 0.6, stagger = 0.08 } = options;

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(selector, {
        start: 'top 92%',
        once: true,
        onEnter: (elements) =>
          gsap.to(elements, { opacity: 1, y: 0, duration, stagger, ease: 'power3.out', overwrite: true }),
      });
      gsap.set(selector, { opacity: 0, y });
    }, scope);

    return () => ctx.revert();
  }, [scope, selector, y, duration, stagger]);
}
