import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import { useEffect } from 'react';
import { prefersReducedMotion } from './reducedMotion';

gsap.registerPlugin(ScrollTrigger);

let scroller: LocomotiveScroll | null = null;

/**
 * The page's scroll engine. Call once, at the top of the app.
 *
 * Locomotive Scroll is built on Lenis, so it provides the smooth scrolling and the `data-scroll` parallax
 * attributes. GSAP's ticker drives its frame loop, and every scroll tick updates ScrollTrigger, so all three
 * libraries run off one clock. Touch scrolling stays native, so the phone apps keep their normal feel.
 */
export function useScroller(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    gsap.ticker.lagSmoothing(0);
    scroller = new LocomotiveScroll({
      lenisOptions: { lerp: 0.1 },
      scrollCallback: () => ScrollTrigger.update(),
      initCustomTicker: (render) => gsap.ticker.add(render),
      destroyCustomTicker: (render) => gsap.ticker.remove(render),
    });

    // Measurements change once fonts and images settle.
    const refresh = () => {
      scroller?.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', refresh);
    void document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener('load', refresh);
      scroller?.destroy();
      scroller = null;
    };
  }, []);
}

/**
 * Scrolls to a CSS selector such as '#try' and moves keyboard focus into that section, so the next Tab continues
 * from there instead of from the button that was pressed. Scrolling is smooth, or immediate when the user prefers
 * reduced motion. Focus goes to the section's heading (made programmatically focusable), or to the section itself.
 */
export function scrollToTarget(selector: string): void {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  if (scroller) scroller.scrollTo(selector, { offset: -72, duration: 1.2 });
  // Without the scroller (reduced motion, or before it starts) jump straight there, as the user asked for less motion.
  else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  focusSection(target);
}

function focusSection(section: HTMLElement): void {
  const heading = section.querySelector<HTMLElement>('h1, h2') ?? section;
  // -1 makes it focusable from script without adding it to the Tab order.
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  // The scroll is already under way; focusing must not start a second, jumpy one.
  heading.focus({ preventScroll: true });
}
