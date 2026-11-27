import type { MaskResult } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { unmask } from '@clause-guard/privacy-engine/unmask';
import { initAI } from './firebase';
import { WebBridge } from './webBridge';
import { ANALYSIS_REVIEW_RULES, REDLINE_POLICY_VERSION, EXPLANATION_GROUNDING_RULES, GROUNDING_POLICY_VERSION, QUESTION_GROUNDING_POLICY_VERSION, GUARANTEE_REVIEW_FORMAT_VERSION, SIGNATORY_REVIEW_FORMAT_VERSION, sourceQuotedSignatoryReview, sourceQuotedGuaranteeReview } from '@clause-guard/core/analysis';
import { loadAnalysisConfig } from './analysisConfig';

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

/** Fixed diagnostic categories only; never carries a rejected span or model reply. */
export class SamplePreparationError extends Error {
  constructor(readonly reason: 'local_privacy_block' | 'fixture_value_remaining') {
    super(reason === 'local_privacy_block'
      ? 'The sample failed the local privacy checks. No analysis request was made.'
      : 'A required fixture value survived masking. No analysis request was made.');
    this.name = 'SamplePreparationError';
  }
}

/** Fixed public repository fixtures only. This stage never calls analyze(). */
export async function prepareSample(sample: string, clauseIds?: readonly string[]): Promise<Preview> {
  devOnly();
  const textLoader = texts[`../../../samples/${sample}.txt`];
  const expectedLoader = expectations[`../../../samples/${sample}.json`];
  if (!textLoader || !expectedLoader) throw new Error('Choose nda, freelance, lease, offer-letter, promissory-note, or saas.');
  const text = await textLoader() as string;
  const expected = await expectedLoader() as { mask: string[] };
  const allClauses = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    .map((text, index) => ({ id: `c${index + 1}`, index, text }));
  if (clauseIds !== undefined && (!Array.isArray(clauseIds) || !clauseIds.length || new Set(clauseIds).size !== clauseIds.length ||
      clauseIds.some(id => !allClauses.some(clause => clause.id === id)))) {
    throw new Error('Choose unique clause IDs that exist in this fixed sample.');
  }
  // Select BEFORE masking. Never copy/filter the engine-issued approval batch.
  const clauses = clauseIds ? allClauses.filter(clause => clauseIds.includes(clause.id)) : allClauses;
  // Reusing this id ensures preparing the same sample invalidates its earlier preview.
  const result = await mask(`public-sample-${sample}`, clauses, getBridge());
  if (!result.ok) throw new SamplePreparationError('local_privacy_block');
  const masked = result.clauses.map(c => c.text).join('\n').toLowerCase();
  if (expected.mask.some(value => masked.includes(value.toLowerCase()))) {
    throw new SamplePreparationError('fixture_value_remaining');
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
  // Same per-app cached configuration snapshot used by the bridge. These are
  // instruction-presence diagnostics, not proof that the model obeyed them.
  const config = await loadAnalysisConfig(initAI().app);
  assertApproved(batch);
  const answer = await getBridge().analyze(batch);
  assertApproved(batch);
  const restored = await unmask(answer.docId, answer.results);
  assertApproved(batch);
  return {
    status: answer.failed.length ? 'SAMPLE_PARTIAL' : 'SAMPLE_ROUNDTRIP_COMPLETED',
    sample: preview.sample, ranOn: answer.ranOn,
    totalClauses: batch.clauses.length, succeeded: answer.results.length,
    failed: answer.failed, restored,
    requestedReviewMethods: batch.clauses.map(clause => ({clauseId:clause.id,
      method:sourceQuotedSignatoryReview(clause.text) ? SIGNATORY_REVIEW_FORMAT_VERSION
        : sourceQuotedGuaranteeReview(clause.text) ? GUARANTEE_REVIEW_FORMAT_VERSION : 'general'})),
    promptCheck: {
      configSource: config.source, version: config.version, model: config.model,
      cloudReviewRulesPresent: config.cloudPrompt.includes(ANALYSIS_REVIEW_RULES),
      deviceReviewRulesPresent: config.devicePrompt.includes(ANALYSIS_REVIEW_RULES),
      redlinePolicy: REDLINE_POLICY_VERSION,
      groundingPolicy: GROUNDING_POLICY_VERSION,
      questionGroundingPolicy: QUESTION_GROUNDING_POLICY_VERSION,
      guaranteeReviewFormat: GUARANTEE_REVIEW_FORMAT_VERSION,
      signatoryReviewFormat: SIGNATORY_REVIEW_FORMAT_VERSION,
      leaseTermReview: 'general',
      cloudGroundingRulesPresent: config.cloudPrompt.includes(EXPLANATION_GROUNDING_RULES),
      deviceGroundingRulesPresent: config.devicePrompt.includes(EXPLANATION_GROUNDING_RULES),
    },
  };
}
