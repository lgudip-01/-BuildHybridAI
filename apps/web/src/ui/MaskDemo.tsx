import { useRef } from 'react';
import { useScene } from '../motion';

// Each sensitive value and the placeholder that replaces it.
const SWAPS = [
  { real: 'January 1, 2026', mask: '[DATE_1]' },
  { real: 'Acme Corp', mask: '[ORG_1]' },
  { real: 'Dana Reyes', mask: '[PERSON_1]' },
  { real: '$12,500', mask: '[AMOUNT_1]' },
  { real: '1234 5678 9012', mask: '[ACCOUNT_1]' },
];

function Swap({ index, after = '' }: { index: number; after?: string }) {
  const swap = SWAPS[index];
  if (!swap) return null;
  // Both versions are in the layout so the width never jumps; the masked one is the resting state.
  // Trailing punctuation stays glued to the value, so a full stop never wraps onto a line of its own.
  return (
    <span className="nobr">
      <span className="tok">
        <span className="tok-real" aria-hidden>{swap.real}</span>
        <span className="tok-mask">{swap.mask}</span>
      </span>
      {after}
    </span>
  );
}

/** A looping demo of the product: real values turn into placeholders, one by one, then back again. */
export function MaskDemo() {
  const ref = useRef<HTMLDivElement>(null);

  useScene(ref, ({ gsap }) => {
    const toks = gsap.utils.toArray<HTMLElement>('.tok');
    const reals = gsap.utils.toArray<HTMLElement>('.tok-real');
    const masks = gsap.utils.toArray<HTMLElement>('.tok-mask');
    // Each value is as wide as its placeholder at rest, and grows to fit the real text while that is showing.
    const maskWidths = masks.map((el) => el.offsetWidth);
    const realWidths = reals.map((el) => el.offsetWidth);
    // Start from the "before" state: real values showing.
    gsap.set(toks, { width: (i: number) => realWidths[i] ?? 0 });
    gsap.set(reals, { opacity: 1, y: 0 });
    gsap.set(masks, { opacity: 0, y: 8 });

    gsap
      .timeline({ repeat: -1, repeatDelay: 1.6, delay: 1.4 })
      .to(reals, { opacity: 0, y: -8, duration: 0.35, stagger: 0.28, ease: 'power2.in' })
      .to(masks, { opacity: 1, y: 0, duration: 0.45, stagger: 0.28, ease: 'power3.out' }, '<0.12')
      .to(toks, { width: (i: number) => maskWidths[i] ?? 0, duration: 0.45, stagger: 0.28, ease: 'power3.out' }, '<')
      .to('.demo-badge', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '>-0.1')
      .to({}, { duration: 2.4 })
      .to([...masks, '.demo-badge'], { opacity: 0, duration: 0.3, ease: 'power1.in' })
      .set(masks, { y: 8 })
      .set('.demo-badge', { y: 8 })
      .to(reals, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' })
      .to(toks, { width: (i: number) => realWidths[i] ?? 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '<');

    gsap.set('.demo-badge', { opacity: 0, y: 8 });
  });

  return (
    <div className="demo" ref={ref} role="img" aria-label="A contract sentence where names, dates and amounts are replaced by placeholders">
      <div className="demo-bar">
        <span className="demo-dots" aria-hidden><i /><i /><i /></span>
        <span className="demo-title">contract.pdf</span>
        <span className="demo-badge">
          <span className="dot" aria-hidden /> Masked on device
        </span>
      </div>
      <p className="demo-text">
        This agreement is made on <Swap index={0} /> between <Swap index={1} /> and <Swap index={2} after="." /> Payment of{' '}
        <Swap index={3} /> is due within 30 days, wired to account <Swap index={4} after="." />
      </p>
    </div>
  );
}
