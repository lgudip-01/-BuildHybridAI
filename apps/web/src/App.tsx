// Minimal review flow for the existing bench; the UI teammate owns the full product screens.
import type { Clause, EntityKind, LedgerEntry, MaskResult, OnDeviceStatus } from '@clause-guard/core/types';
import { PLACEHOLDER } from '@clause-guard/privacy-engine/placeholders';
import { Download, LoaderCircle, ShieldCheck, ShieldX, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import type { AiBridge } from '@clause-guard/core/types';
import { REDLINE_REVIEW_NOTICE } from '@clause-guard/core/analysis';
import { ReviewSession, reviewBusy, splitClauses, type ReviewOutcome } from './reviewFlow';

const SAMPLE_CONTRACT = `This Mutual Non-Disclosure Agreement is made on January 1, 2026 between Acme Corp ("the Company") and Dana Reyes ("Contractor").

Acme's payment of $12,500 is due to Reyes at dana@reyes.dev within 30 days. Wire to routing 021000021, account 1234 5678 9012.

Notices go to 42 Elm Street, Suite 300, Springfield, NJ 07001. Call (555) 123-4567.

By: Dana Reyes
Name: Michael Chen, CEO, Acme Corp`;

const STATUS_LABEL: Record<OnDeviceStatus | 'checking', string> = {
  checking: 'Checking on-device model',
  available: 'Gemini Nano ready',
  downloadable: 'Gemini Nano not downloaded',
  downloading: 'Gemini Nano downloading',
  unavailable: 'Gemini Nano unavailable',
};

const KIND_LABEL: Record<EntityKind, string> = {
  PARTY: 'Party',
  PERSON: 'Person',
  ORG: 'Organization',
  NAME: 'Name',
  ADDRESS: 'Address',
  AMOUNT: 'Amount',
  DATE: 'Date',
  EMAIL: 'Email',
  PHONE: 'Phone',
  ACCOUNT: 'Account number',
};

// Splitting on a capture group keeps the placeholders at the odd indexes.
const SPLIT_ON_PLACEHOLDER = new RegExp(`(${PLACEHOLDER.source})`);

type Run = { result: MaskResult; ms: number };

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function unavailableReason(): string {
  if ('LanguageModel' in globalThis) {
    return 'Chrome says this device cannot run Gemini Nano. Open chrome://on-device-internals to see why.';
  }
  const chrome = /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1];
  if (!chrome || /Edg\//.test(navigator.userAgent)) return 'This browser has no Gemini Nano. Use desktop Chrome.';
  if (Number(chrome) < 139) return `Chrome ${chrome} is too old. Update to 139 or newer.`;
  return `Chrome ${chrome} has the Prompt API turned off. Enable chrome://flags/#prompt-api-for-gemini-nano-multimodal-input, then relaunch Chrome.`;
}

export function App({ bridge }: { bridge: AiBridge & { downloadModel(onProgress: (fraction: number) => void): Promise<void> } }) {
  const [status, setStatus] = useState<OnDeviceStatus | 'checking'>('checking');
  const [progress, setProgress] = useState<number | null>(null);
  const [session] = useState(() => new ReviewSession(bridge, SAMPLE_CONTRACT));
  const review = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const { contract } = review;
  const busy = reviewBusy(review);
  const run: Run | null = review.masked ? { result: review.masked, ms: review.ms ?? 0 } : null;
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const clauses = splitClauses(contract);

  const refreshStatus = useCallback(
    () => bridge.onDeviceStatus().then(setStatus, () => setStatus('unavailable')),
    [bridge],
  );
  useEffect(() => void refreshStatus(), [refreshStatus]);

  async function download() {
    setProgress(0);
    setDownloadError(null);
    try {
      await bridge.downloadModel(setProgress);
    } catch (e) {
      setDownloadError(`Download failed: ${errorText(e)}`);
    } finally {
      setProgress(null);
      await refreshStatus();
    }
  }

  function onContractKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (progress === null) void session.mask();
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <ShieldCheck className="brand-mark" size={20} strokeWidth={1.75} aria-hidden />
          <span className="brand-name">Clause Guard</span>
          <span className="brand-sub">Contract review</span>
        </div>
        <ModelStatus status={status} progress={progress} onDownload={download} disabled={busy} />
      </header>

      {status === 'unavailable' && (
        <p className="notice">
          <TriangleAlert size={16} strokeWidth={1.75} aria-hidden />
          <span>
            {unavailableReason()} Until then, masking runs on patterns only and every result is marked for review.
          </span>
        </p>
      )}

      <main className="workspace">
        <section className="pane" aria-labelledby="contract-title">
          <div className="pane-head">
            <h2 id="contract-title">Contract</h2>
            <span className="meta">
              {clauses.length} {clauses.length === 1 ? 'clause' : 'clauses'}, split on blank lines
            </span>
          </div>
          <textarea
            className="contract"
            value={contract}
            onChange={(e) => { if (session.edit(e.target.value)) setActive(null); }}
            readOnly={busy}
            aria-describedby={busy ? 'review-busy-hint' : undefined}
            onKeyDown={onContractKey}
            spellCheck={false}
            aria-labelledby="contract-title"
            placeholder="Paste a contract. Each paragraph separated by a blank line is one clause."
          />
          <div className="pane-foot">
            <kbd className="shortcut">Ctrl Enter</kbd>
            {busy && <span id="review-busy-hint" className="meta">Editing is locked until this review finishes.</span>}
            <button className="primary" onClick={() => void session.mask()} disabled={busy || progress !== null || clauses.length === 0}>
              {review.phase === 'masking' && <LoaderCircle className="spin" size={16} aria-hidden />}
              {review.phase === 'masking' ? 'Masking' : 'Mask contract'}
            </button>
          </div>
        </section>

        <section className="pane" aria-labelledby="output-title" aria-busy={busy}>
          <div className="pane-head">
            <h2 id="output-title">Masked preview</h2>
            {run?.result.ok && <span className="meta">{run.result.ledger.length} values replaced</span>}
          </div>
          <div className="pane-body">
            {downloadError && <div className="banner" data-tone="warn" role="alert"><p>{downloadError}</p></div>}
            <Output run={run} active={active} onActive={setActive} />
            {review.error && <div className="banner review-actions" data-tone="warn" role="alert"><p>{review.error}</p></div>}
            {review.phase === 'review' && (
              <div className="review-actions">
                <p>Review the masked text above. Approving allows analysis of this masked version; original values stay in this browser’s vault.</p>
                <button className="primary" onClick={() => void session.analyzeReviewed()}>Approve &amp; analyze</button>
              </div>
            )}
            {review.phase === 'analyzing' && <p className="review-actions" role="status">Analyzing reviewed text. This may take a moment.</p>}
            {review.outcome && <AnalysisResults clauses={clauses} outcome={review.outcome} />}
          </div>
        </section>
      </main>
    </div>
  );
}

function ModelStatus(props: { status: OnDeviceStatus | 'checking'; progress: number | null; onDownload: () => void; disabled: boolean }) {
  const { status, progress, onDownload } = props;
  if (progress !== null) {
    return (
      <div className="status" data-state="downloading">
        <span>Downloading Gemini Nano</span>
        <progress value={progress} max={1} aria-label="Model download" />
        <span className="num">{Math.round(progress * 100)}%</span>
      </div>
    );
  }
  return (
    <div className="status" data-state={status} role="status">
      <span className="dot" aria-hidden />
      <span>{STATUS_LABEL[status]}</span>
      {(status === 'downloadable' || status === 'downloading') && (
        <button className="ghost" onClick={onDownload} disabled={props.disabled}>
          <Download size={14} aria-hidden />
          Download
        </button>
      )}
    </div>
  );
}

function Output(props: { run: Run | null; active: string | null; onActive: (p: string | null) => void }) {
  const { run, active, onActive } = props;

  if (!run) {
    return (
      <div className="empty">
        <p className="empty-title">Nothing has left this device.</p>
        <p>Mask the contract to see exactly what the cloud model would receive. Names, amounts, dates, addresses and accounts are replaced with placeholders first.</p>
      </div>
    );
  }

  const { result, ms } = run;

  if (!result.ok) {
    return (
      <>
        <div className="banner" data-tone="danger">
          <ShieldX size={18} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="banner-title">Blocked by the leak check</p>
            <p>Sensitive text survived masking, so nothing would be sent.</p>
          </div>
        </div>
        <ul className="leaks">
          {result.leaks.map((leak, i) => (
            <li key={i}>
              <span className="clause-id">{leak.clauseId}</span>
              <span className="leak-reason">{leak.reason}</span>
              <code className="leak-snippet">…{leak.snippet}…</code>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      {result.needsReview ? (
        <div className="banner" data-tone="warn">
          <TriangleAlert size={18} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="banner-title">Masked with patterns only. Review before sending.</p>
            <p>
              The on-device model didn't run, so a name used without a title or company suffix can slip through. Took{' '}
              <span className="num">{Math.round(ms)} ms</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="banner" data-tone="ok">
          <ShieldCheck size={18} strokeWidth={1.75} aria-hidden />
          <div>
            <p className="banner-title">Masked on device in <span className="num">{Math.round(ms)} ms</span></p>
            <p>The leak check passed. Real values are encrypted in this browser's vault.</p>
          </div>
        </div>
      )}

      <ol className="clauses">
        {result.clauses.map((clause) => (
          <li key={clause.id}>
            <div className="clause-head">
              <span className="clause-id">{clause.id}</span>
              {clause.type && <span className="clause-type">{clause.type.replace('_', ' ')}</span>}
            </div>
            <p className="clause-text">
              {clause.text.split(SPLIT_ON_PLACEHOLDER).map((part, j) =>
                j % 2 === 1 ? (
                  <mark
                    key={j}
                    className="ph"
                    data-active={part === active || undefined}
                    onMouseEnter={() => onActive(part)}
                    onMouseLeave={() => onActive(null)}
                  >
                    {part}
                  </mark>
                ) : (
                  part
                ),
              )}
            </p>
          </li>
        ))}
      </ol>

      <Ledger ledger={result.ledger} active={active} onActive={onActive} />
    </>
  );
}

export function AnalysisResults({ clauses, outcome }: { clauses: Clause[]; outcome: ReviewOutcome }) {
  const results = new Map(outcome.restored.map(result => [result.clauseId, result]));
  const failures = new Map(outcome.failed.map(failure => [failure.clauseId, failure]));
  return (
    <section className="analysis-results" aria-labelledby="analysis-title">
      <div className="results-heading">
        <h2 id="analysis-title">Contract review</h2>
        {outcome.ranOn && <span className="source-badge">{outcome.ranOn === 'cloud' ? 'Analyzed in cloud' : 'On-device preliminary scan'}</span>}
      </div>
      <p role="status">{outcome.restored.length} of {clauses.length} clauses returned a validated review. {clauses.length - outcome.restored.length} need review.</p>
      <p className="meta">Risk ratings are preliminary. Low risk does not mean contract approval.</p>
      <nav className="risk-map" aria-label="Clause review overview">
        {clauses.map(clause => {
          const result = results.get(clause.id);
          return <a key={clause.id} href={`#review-${clause.id}`} data-risk={result?.risk ?? 'unreviewed'} aria-label={`${clause.id}: ${result ? `${result.risk} risk` : 'needs review'}`}>{clause.id}</a>;
        })}
      </nav>
      {clauses.map(clause => {
        const result = results.get(clause.id);
        const failure = failures.get(clause.id);
        const withheld = result?.explanation.startsWith(REDLINE_REVIEW_NOTICE);
        const explanation = withheld ? result!.explanation.slice(REDLINE_REVIEW_NOTICE.length).trim() : result?.explanation;
        return (
          <article key={clause.id} className="analysis-card" id={`review-${clause.id}`} aria-labelledby={`review-title-${clause.id}`}>
            <div className="clause-head">
              <h3 id={`review-title-${clause.id}`}>{clause.id}</h3>
              {result ? <span className="risk-label" data-risk={result.risk}>{result.risk} risk</span> : <span className="risk-label" data-risk="unreviewed">Needs review</span>}
            </div>
            <details><summary>Original clause — shown only on this device</summary><p className="clause-text">{clause.text}</p></details>
            {result ? (
              <>
                {withheld && <p className="draft-notice">Suggested wording withheld. Confirm the intended commercial changes before drafting a replacement.</p>}
                {explanation && <p className="analysis-explanation">{explanation}</p>}
                {result.redline ? <div><h4>Suggested wording — review before use</h4><p className="clause-text">{result.redline}</p></div>
                  : !withheld && <p className="meta">No replacement wording proposed.</p>}
                {!!result.questions.length && <div><h4>Questions to ask</h4><ul>{result.questions.map((question, i) => <li key={i}>{question}</li>)}</ul></div>}
              </>
            ) : (
              <div className="failed-review">
                <p>{failure?.reason === 'model_error' ? 'Analysis was unavailable for this clause.' : 'The AI answer could not be verified.'}</p>
                <p>{failure?.reason === 'unknown_placeholder' ? 'The answer used a reference that was not in the approved text. Review the original clause; no AI risk rating or rewrite is shown.'
                  : 'Review the original clause. No verified AI risk rating or replacement wording is available.'}</p>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

function Ledger(props: { ledger: LedgerEntry[]; active: string | null; onActive: (p: string | null) => void }) {
  const { ledger, active, onActive } = props;
  return (
    <div className="ledger">
      <div className="ledger-head">
        <h3>Privacy ledger</h3>
        <span className="meta">Stays on this device</span>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Placeholder</th>
            <th scope="col">Kind</th>
            <th scope="col">Clauses</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((entry) => (
            <tr
              key={entry.placeholder}
              data-active={entry.placeholder === active || undefined}
              onMouseEnter={() => onActive(entry.placeholder)}
              onMouseLeave={() => onActive(null)}
            >
              <td><span className="ph">{entry.placeholder}</span></td>
              <td>{KIND_LABEL[entry.kind]}</td>
              <td className="num">{entry.clauseIds.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
