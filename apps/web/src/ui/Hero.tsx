import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';
import { scrollToTarget, useScene } from '../motion';
import { MaskDemo } from './MaskDemo';

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ gsap }) => {
    gsap.from('.hero-line-inner', { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.15 });
    gsap.from('.hero-fade', { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.55 });
  });

  return (
    <section className="hero" id="top" ref={ref}>
      {/* Decorative glows. Locomotive moves them at a different speed from the page. */}
      <div className="orb orb-a" data-scroll data-scroll-speed="-0.12" aria-hidden />
      <div className="orb orb-b" data-scroll data-scroll-speed="0.1" aria-hidden />

      <p className="eyebrow hero-fade">Contract review that keeps your secrets</p>
      <h1 className="hero-title">
        <span className="hero-line">
          <span className="hero-line-inner">Read the fine print.</span>
        </span>
        <span className="hero-line">
          <span className="hero-line-inner hero-accent">Keep it private.</span>
        </span>
      </h1>
      <p className="hero-sub hero-fade">
        Clause Guard flags risky clauses, explains them in plain English and suggests edits. Names, amounts and
        account numbers are masked on your device first, so the cloud never sees them.
      </p>
      <div className="hero-cta hero-fade">
        <button className="primary big" onClick={() => scrollToTarget('#try')}>
          Try it on a contract
          <ArrowDown size={16} aria-hidden />
        </button>
        <button className="ghost big" onClick={() => scrollToTarget('#how')}>
          How it works
        </button>
      </div>

      <div className="hero-demo hero-fade" data-scroll data-scroll-speed="0.06">
        <MaskDemo />
      </div>
    </section>
  );
}
