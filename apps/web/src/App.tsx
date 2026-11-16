// Test bench for the privacy engine against real Gemini Nano. The Web app role replaces this with the product UI.
import type { Clause, ClauseType, EntityKind, LedgerEntry, MaskResult, OnDeviceStatus } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { classify } from '@clause-guard/privacy-engine/onDevice';
import { PLACEHOLDER } from '@clause-guard/privacy-engine/placeholders';
import { Download, LoaderCircle, ShieldCheck, ShieldX, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import type { WebBridge } from './webBridge';

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

type Run = { result: MaskResult; ms: number; types?: ClauseType[] };

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function splitClauses(text: string): Clause[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => ({ id: `c${index + 1}`, index, text: part }));
}

function unavailableReason(): string {
  if ('LanguageModel' in globalThis) {
    return 'Chrome says this device cannot run Gemini Nano. Open chrome://on-device-internals to see why.';
  }
  const chrome = /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1];
  if (!chrome || /Edg\//.test(navigator.userAgent)) return 'This browser has no Gemini Nano. Use desktop Chrome.';
  if (Number(chrome) < 139) return `Chrome ${chrome} is too old. Update to 139 or newer.`;
  return `Chrome ${chrome} has the Prompt API turned off. Enable chrome://flags/#prompt-api-for-gemini-nano-multimodal-input, then relaunch Chrome.`;
}

export function App({ bridge }: { bridge: WebBridge }) {
  const [status, setStatus] = useState<OnDeviceStatus | 'checking'>('checking');
  const [progress, setProgress] = useState<number | null>(null);
  const [contract, setContract] = useState(SAMPLE_CONTRACT);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const clauses = splitClauses(contract);

  const refreshStatus = useCallback(
    () => bridge.onDeviceStatus().then(setStatus, () => setStatus('unavailable')),
    [bridge],
  );
  useEffect(() => void refreshStatus(), [refreshStatus]);

  async function download() {
    setProgress(0);
    setError(null);
    try {
      await bridge.downloadModel(setProgress);
    } catch (e) {
      setError(`Download failed: ${errorText(e)}`);
    } finally {
      setProgress(null);
      await refreshStatus();
    }
  }

  async function runMask() {
    if (busy || clauses.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const started = performance.now();
      const result = await mask(crypto.randomUUID(), clauses, bridge);
      const ms = performance.now() - started;
      const types = result.ok && !result.needsReview ? await classify(bridge, clauses) : undefined;
      setRun({ result, ms, types });
    } catch (e) {
      setRun(null);
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function onContractKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void runMask();
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <ShieldCheck className="brand-mark" size={20} strokeWidth={1.75} aria-hidden />
          <span className="brand-name">Clause Guard</span>
          <span className="brand-sub">Privacy engine</span>
        </div>
        <ModelStatus status={status} progress={progress} onDownload={download} />
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
            onChange={(e) => setContract(e.target.value)}
            onKeyDown={onContractKey}
            spellCheck={false}
            aria-labelledby="contract-title"
            placeholder="Paste a contract. Each paragraph separated by a blank line is one clause."
          />
          <div className="pane-foot">
            <kbd className="shortcut">Ctrl Enter</kbd>
            <button className="primary" onClick={runMask} disabled={busy || clauses.length === 0}>
              {busy && <LoaderCircle className="spin" size={16} aria-hidden />}
              {busy ? 'Masking' : 'Mask contract'}
            </button>
          </div>
        </section>

        <section className="pane" aria-labelledby="output-title" aria-busy={busy}>
          <div className="pane-head">
            <h2 id="output-title">Sent to the cloud</h2>
            {run?.result.ok && <span className="meta">{run.result.ledger.length} values replaced</span>}
          </div>
          <div className="pane-body">
            <Output run={run} error={error} active={active} onActive={setActive} />
          </div>
        </section>
      </main>
    </div>
  );
}

function ModelStatus(props: { status: OnDeviceStatus | 'checking'; progress: number | null; onDownload: () => void }) {
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
        <button className="ghost" onClick={onDownload}>
          <Download size={14} aria-hidden />
          Download
        </button>
      )}
    </div>
  );
}

function Output(props: { run: Run | null; error: string | null; active: string | null; onActive: (p: string | null) => void }) {
  const { run, error, active, onActive } = props;

  if (error) {
    return (
      <div className="banner" data-tone="danger">
        <ShieldX size={18} strokeWidth={1.75} aria-hidden />
        <div>
          <p className="banner-title">Something went wrong</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="empty">
        <p className="empty-title">Nothing has left this device.</p>
        <p>Mask the contract to see exactly what the cloud model would receive. Names, amounts, dates, addresses and accounts are replaced with placeholders first.</p>
      </div>
    );
  }

  const { result, ms, types } = run;

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
        {result.clauses.map((clause, i) => (
          <li key={clause.id}>
            <div className="clause-head">
              <span className="clause-id">{clause.id}</span>
              {types?.[i] && <span className="clause-type">{types[i].replace('_', ' ')}</span>}
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
