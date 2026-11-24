import { ShieldCheck } from 'lucide-react';
import { scrollToTarget } from '../motion';

export function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <a
        className="brand"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget('#top');
        }}
      >
        <ShieldCheck className="brand-mark" size={20} strokeWidth={1.75} aria-hidden />
        <span className="brand-name">Clause Guard</span>
      </a>
      <div className="nav-links">
        <button className="nav-link" onClick={() => scrollToTarget('#how')}>
          How it works
        </button>
        <button className="nav-cta" onClick={() => scrollToTarget('#try')}>
          Try it
        </button>
      </div>
    </nav>
  );
}
