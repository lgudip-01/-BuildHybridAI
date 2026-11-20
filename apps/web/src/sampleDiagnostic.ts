import { prepareSample, runSample } from './sampleRoundtrip';
import { AnalysisUnavailableError } from './cloudAnalyzer';

const PRESETS = {
  lease: { sample:'lease', ids:['c3', 'c7'] },
  offer: { sample:'offer-letter', ids:['c3', 'c4', 'c8'] },
  freelance: { sample:'freelance', ids:['c9'] },
  guarantee: { sample:'promissory-note', ids:['c8'] },
} as const;

/** Local, manual diagnostics for fixed public fixtures. No logging or persistence. */
export function mountSampleDiagnostic(root: HTMLElement): void {
  if (!import.meta.env.DEV || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    throw new Error('Public sample diagnostics require local development.');
  }
  root.innerHTML = `<h1>Public sample diagnostic</h1>
    <p>Fixed public repository samples only. Masking makes no cloud inference request.
    Inspect the exact preview before approving one analysis batch. No automatic retries.</p>
    <label for="preset">Public sample selection</label>
    <select id="preset">
      <option value="lease">Lease: premises and maintenance (c3, c7)</option>
      <option value="offer">Offer: introduction, compensation and at-will (c3, c4, c8)</option>
      <option value="freelance">Freelance: company signature (c9)</option>
      <option value="guarantee">Promissory note: source-quoted guarantee (c8)</option>
    </select>
    <button id="mask">Mask selected public sample</button>
    <button id="analyze" disabled>Approve masked sample &amp; analyze</button>
    <p role="status" id="status">Ready. No inference has run.</p>
    <h2>Exact masked preview</h2><pre id="preview" style="white-space:pre-wrap">Not prepared.</pre>
    <h2>Local diagnostic result</h2><pre id="result" style="white-space:pre-wrap">No analysis requested.</pre>`;
  const preset = root.querySelector<HTMLSelectElement>('#preset')!;
  const mask = root.querySelector<HTMLButtonElement>('#mask')!;
  const analyze = root.querySelector<HTMLButtonElement>('#analyze')!;
  const status = root.querySelector<HTMLElement>('#status')!;
  const previewText = root.querySelector<HTMLElement>('#preview')!;
  const resultText = root.querySelector<HTMLElement>('#result')!;
  let prepared: Awaited<ReturnType<typeof prepareSample>> | undefined;
  let busy = false;
  const controls = () => {
    preset.disabled = busy;
    mask.disabled = busy;
    analyze.disabled = busy || !prepared;
  };
  preset.addEventListener('change', () => {
    prepared = undefined;
    previewText.textContent = 'Not prepared.';
    resultText.textContent = 'No analysis requested.';
    status.textContent = 'Selection changed. Mask and inspect it before approval.';
    controls();
  });
  mask.addEventListener('click', async () => {
    if (busy || !Object.hasOwn(PRESETS, preset.value)) return;
    prepared = undefined;
    busy = true;
    controls();
    resultText.textContent = 'No analysis requested.';
    previewText.textContent = 'Preparing local masked preview…';
    status.textContent = 'Masking fixed public clauses on device.';
    try {
      const selected = PRESETS[preset.value as keyof typeof PRESETS];
      prepared = await prepareSample(selected.sample, selected.ids);
      previewText.textContent = JSON.stringify({sample:prepared.sample, clauses:prepared.result.clauses,
        ledger:prepared.result.ledger, needsReview:prepared.result.needsReview}, null, 2);
      status.textContent = 'PREVIEW_READY — inspect every masked clause before approval. No cloud analysis requested.';
    } catch {
      previewText.textContent = 'No approvable sample preview.';
      status.textContent = 'PREVIEW_BLOCKED — local masking or fixture validation did not pass.';
    } finally { busy = false; controls(); }
  });
  analyze.addEventListener('click', async () => {
    if (busy || !prepared) return;
    const reviewed = prepared;
    prepared = undefined; // One explicit send per prepared preview, even after failure.
    busy = true;
    controls();
    status.textContent = 'Analyzing the reviewed masked sample once. No automatic retries.';
    try {
      const answer = await runSample(reviewed, {reviewed:true});
      resultText.textContent = JSON.stringify(answer, null, 2);
      status.textContent = `${answer.status} — ${answer.succeeded}/${answer.totalClauses} validated; actual source: ${answer.ranOn}.`;
    } catch (error) {
      // Never expose arbitrary SDK errors, response bodies, tokens or credentials.
      resultText.textContent = JSON.stringify(error instanceof AnalysisUnavailableError
        ? {status:'ANALYSIS_UNAVAILABLE', failed:error.failed}
        : {status:'ANALYSIS_REJECTED', detail:'No current verified analysis result is available.'}, null, 2);
      status.textContent = 'No confirmed analysis result. Prepare a new preview before any further send.';
    } finally { busy = false; controls(); }
  });
}
