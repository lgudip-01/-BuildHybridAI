import { useEffect, useState } from 'react';
import { revealReviewValue } from '@clause-guard/privacy-engine/mask';
import type { SuccessfulMask } from '@clause-guard/privacy-engine/manualReview';
import type { ReviewSession } from './reviewFlow';

export function MaskReviewControls({ result, session }: { result: SuccessfulMask; session: ReviewSession }) {
  const [value, setValue] = useState('');
  const [token, setToken] = useState('');
  const [shown, setShown] = useState(false);
  const [detail, setDetail] = useState('');
  const manual = result.ledger.some(entry => entry.placeholder === token && entry.kind === 'PRIVATE');

  useEffect(() => {
    if (!shown || !token) return;
    let active = true;
    revealReviewValue(result, token).then(
      text => { if (active) setDetail(text); },
      () => { if (active) setDetail('Saved value unavailable.'); },
    );
    return () => { active = false; };
  }, [result, token, shown]);

  return <div className="review-actions">
    <form className="mask-controls" onSubmit={event => {
      event.preventDefault();
      if (value.trim()) void session.revise({ add: value });
    }}>
      <label>Mask another value
        <input value={value} onChange={event => setValue(event.target.value)} autoComplete="off" spellCheck={false}
          placeholder="Word or phrase from the preview" />
      </label>
      <button className="ghost" disabled={!value.trim()}>Mask matching text</button>
    </form>
    {result.ledger.length > 0 && <div className="mask-controls">
      <label>Inspect a masked value
        <select value={token} onChange={event => { setToken(event.target.value); setShown(false); setDetail(''); }}>
          <option value="">Choose a placeholder</option>
          {result.ledger.map(entry => <option key={entry.placeholder}>{entry.placeholder}</option>)}
        </select>
      </label>
      {token && <button className="ghost" aria-expanded={shown}
        onClick={() => { setDetail(''); setShown(!shown); }}>{shown ? 'Hide local value' : 'Unmask on this device'}</button>}
      {manual && <>
        <button className="ghost" onClick={() => void session.revise({ unmask: token })}>Undo manual mask</button>
        <p>Undo puts the original text back into the preview for your approval.</p>
      </>}
      {shown && <p role="status">Local value for {token}: <strong>{detail}</strong>. The outgoing preview keeps the placeholder.</p>}
    </div>}
    <p>Review the masked text above. Approving allows analysis of this masked version. Original values stay in this device’s vault.</p>
    <button className="primary" disabled={!!value.trim()} onClick={() => void session.analyzeReviewed()}>Approve &amp; analyze</button>
  </div>;
}
