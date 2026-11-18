import type { MaskResult } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { unmask } from '@clause-guard/privacy-engine/unmask';
import { initAI } from './firebase';
import { WebBridge } from './webBridge';

const texts = import.meta.glob('../../../samples/*.txt', { query: '?raw', import: 'default' });
const expectations = import.meta.glob('../../../samples/*.json', { import: 'default' });
type Success = Extract<MaskResult, { ok: true }>;
type Preview = { sample: string; result: Success };
const prepared = new WeakSet<object>();
let bridge: WebBridge | undefined;
const getBridge = () => bridge ??= new WebBridge(initAI());
function devOnly() {
  if (!import.meta.env.DEV) throw new Error('Sample checks are development-only.');
}

/** Fixed public repository fixtures only. This stage never calls analyze(). */
export async function prepareSample(sample: string): Promise<Preview> {
  devOnly();
  const textLoader = texts[`../../../samples/${sample}.txt`];
  const expectedLoader = expectations[`../../../samples/${sample}.json`];
  if (!textLoader || !expectedLoader) throw new Error('Choose nda, freelance, lease, offer-letter, promissory-note, or saas.');
  const text = await textLoader() as string;
  const expected = await expectedLoader() as { mask: string[] };
  const clauses = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    .map((text, index) => ({ id: `c${index + 1}`, index, text }));
  // Reusing this id ensures preparing the same sample invalidates its earlier preview.
  const result = await mask(`public-sample-${sample}`, clauses, getBridge());
  if (!result.ok) throw new Error('The sample failed the local leak check. No analysis request was made.');
  const masked = result.clauses.map(c => c.text).join('\n').toLowerCase();
  if (expected.mask.some(value => masked.includes(value.toLowerCase()))) {
    throw new Error('A required fixture value survived masking. No analysis request was made. Report the sample name for local-engine investigation.');
  }
  const preview = Object.freeze({ sample, result });
  prepared.add(preview);
  return preview;
}

/** Call only after inspecting preview.result.clauses. May use cloud quota per clause. */
export async function runSample(preview: Preview, options: { reviewed: true }) {
  devOnly();
  if (!prepared.has(preview) || options?.reviewed !== true) {
    throw new Error('Prepare a sample and explicitly review its masked clauses first.');
  }
  const batch = approve(preview.result, { reviewed: true });
  const answer = await getBridge().analyze(batch);
  assertApproved(batch);
  const restored = await unmask(answer.docId, answer.results);
  assertApproved(batch);
  return {
    status: answer.failed.length ? 'SAMPLE_PARTIAL' : 'SAMPLE_ROUNDTRIP_COMPLETED',
    sample: preview.sample, ranOn: answer.ranOn,
    totalClauses: batch.clauses.length, succeeded: answer.results.length,
    failed: answer.failed, restored,
  };
}
