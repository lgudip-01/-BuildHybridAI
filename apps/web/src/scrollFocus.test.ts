// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scrollToTarget } from './motion/scroller';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** The element a Tab press would move to next, in DOM order, starting from the focused element. */
function nextInTabOrder(from: Element): Element | undefined {
  const all = [...document.querySelectorAll(FOCUSABLE)];
  return all.find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function mountPage() {
  document.body.innerHTML = `
    <nav><button id="nav-try">Try it</button><button id="nav-how">How it works</button></nav>
    <section id="top"><h1 id="hero-title">Read the fine print.</h1><button id="hero-cta">Try it on a contract</button></section>
    <section id="how"><h2 id="how-heading">Four steps.</h2><ol><li>Split</li></ol></section>
    <section id="try"><h2 id="try-heading">Mask a real contract</h2><button id="download">Download</button><textarea id="contract"></textarea></section>`;
}

let scrollIntoView: ReturnType<typeof vi.fn>;
function mockReducedMotion(reduced: boolean) {
  window.matchMedia = ((query: string) => ({ matches: reduced && query.includes('reduce'), media: query,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
}

beforeEach(() => {
  mountPage();
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView as unknown as typeof Element.prototype.scrollIntoView;
  mockReducedMotion(true); // no scroller is running in the test, so this is the reduced-motion / fallback path
});
afterEach(() => { document.body.innerHTML = ''; });

describe('keyboard navigation to a section', () => {
  it('moves focus from the pressed button into the target section and scrolls immediately for reduced motion', () => {
    const button = document.getElementById('nav-try') as HTMLElement;
    button.focus();
    expect(document.activeElement).toBe(button);

    scrollToTarget('#try');

    const target = document.getElementById('try')!;
    expect(target.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('try-heading'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('continues in Tab order from inside the target, not from the nav button', () => {
    document.getElementById('nav-try')!.focus();
    scrollToTarget('#try');
    const next = nextInTabOrder(document.activeElement!);
    expect(next?.id).toBe('download');
    expect(document.getElementById('try')!.contains(next!)).toBe(true);
  });

  it('works the same for How it works and for the hero', () => {
    document.getElementById('nav-how')!.focus();
    scrollToTarget('#how');
    expect(document.activeElement).toBe(document.getElementById('how-heading'));

    scrollToTarget('#top');
    expect(document.activeElement).toBe(document.getElementById('hero-title'));
    expect(nextInTabOrder(document.activeElement!)?.id).toBe('hero-cta');
  });

  it('makes the heading focusable from script without adding it to the Tab order', () => {
    scrollToTarget('#how');
    const heading = document.getElementById('how-heading')!;
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('uses smooth scrolling when reduced motion is not requested', () => {
    mockReducedMotion(false);
    scrollToTarget('#try');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does nothing when the target does not exist', () => {
    document.getElementById('nav-try')!.focus();
    scrollToTarget('#missing');
    expect(document.activeElement).toBe(document.getElementById('nav-try'));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
