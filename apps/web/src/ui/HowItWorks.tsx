import { useRef } from 'react';
import { useScene } from '../motion';

const STEPS = [
  {
    title: 'Split',
    body: 'Your contract is cut into clauses, right on your device. Nothing is uploaded yet.',
  },
  {
    title: 'Mask',
    body: 'Names, amounts, dates, addresses and account numbers become placeholders like [PARTY_A]. The values needed to restore them stay in encrypted storage on this device.',
  },
  {
    title: 'Check and approve',
    body: 'A leak check runs before anything leaves. Detected leaks block sending. Review the preview and manually mask any private details that were missed.',
  },
  {
    title: 'Analyze and restore',
    body: 'The cloud model sees only masked text and returns risk levels, plain-English explanations and suggested edits. The real names are put back on your device.',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ gsap, ScrollTrigger }) => {
    // The rail fills as you scroll down the list.
    gsap.fromTo(
      '.rail-fill',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 65%', end: 'bottom 65%', scrub: true },
      },
    );

    gsap.utils.toArray<HTMLElement>('.step').forEach((step) => {
      gsap.from(step, {
        opacity: 0,
        y: 36,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 88%', once: true },
      });
      // Steps stay tinted once passed, and the current one lights up while it is near the middle of the screen.
      ScrollTrigger.create({
        trigger: step,
        start: 'top 62%',
        onEnter: () => step.classList.add('is-done'),
        onLeaveBack: () => step.classList.remove('is-done'),
      });
      ScrollTrigger.create({
        trigger: step,
        start: 'top 62%',
        end: 'bottom 62%',
        toggleClass: { targets: step, className: 'is-active' },
      });
    });

    gsap.from('.how-head > *', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.how-head', start: 'top 85%', once: true },
    });
  });

  return (
    <section className="how" id="how" ref={ref}>
      <div className="how-head">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title">Four steps. Review before you send.</h2>
      </div>
      <ol className="steps">
        <div className="rail" aria-hidden>
          <div className="rail-fill" />
        </div>
        {STEPS.map((step, i) => (
          <li className="step" key={step.title}>
            <span className="step-n num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
