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

/** Smooth-scrolls to a CSS selector such as '#try'. Falls back to the browser's own scroll. */
export function scrollToTarget(selector: string): void {
  if (scroller) scroller.scrollTo(selector, { offset: -72, duration: 1.2 });
  else document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
}
