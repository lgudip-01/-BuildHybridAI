import type { Analysis, AnalyzeResult, ApprovedBatch, ClauseFailure } from '@clause-guard/core/types';
import {
  allowedPlaceholders, ANALYSIS_JSON_SCHEMA, AnalysisValidationError,
  validateAnalysis, validateBatch,
} from '@clause-guard/core/analysis';
import { getGenerativeModel, InferenceMode, InferenceSource, Schema, type AI } from 'firebase/ai';
import { assertApproved } from './approvalGuard';
import { loadAnalysisConfig } from './analysisConfig';

const cloudSchema = Schema.object({ properties: {
  clauseId: Schema.string(),
  risk: Schema.enumString({ enum: ['low', 'medium', 'high'] }),
  explanation: Schema.string(),
  redline: Schema.string(),
  questions: Schema.array({ items: Schema.string() }),
} });

export class AnalysisUnavailableError extends Error {
  readonly code = 'analysis_unavailable';
  constructor(readonly docId: string, readonly failed: ClauseFailure[]) {
    super('No model execution could be confirmed. Retry when cloud or on-device analysis is available.');
    this.name = 'AnalysisUnavailableError';
  }
}

/** A sequential batch uses one actual source, so the UI badge is never misleading. */
export async function analyzeApproved(ai: AI, batch: ApprovedBatch): Promise<AnalyzeResult> {
  assertApproved(batch); // Must be first: never trust the TypeScript brand alone.
  validateBatch(batch);
  const config = await loadAnalysisConfig(ai.app);
  assertApproved(batch); // Remasking during Remote Config initialization cancels this batch.
  if (!config.enabled) throw new Error('Cloud analysis is temporarily disabled by configuration.');
  const allowed = allowedPlaceholders(batch);
  // Derived only from approved masked text, never from the local replacement map.
  const placeholderRules = '\nApplication placeholder constraint: the complete permitted token list is ' +
    JSON.stringify([...allowed].sort()) + '. Tokens are opaque labels, not facts about another clause. ' +
    'Copy tokens exactly and only for the same entity or value they already represent. ' +
    'Never increment a token suffix or create a new contact token. ' +
    'If a notice clause lacks a party\'s email or address, set redline to the empty string and ask for the missing contact details in questions. ' +
    'Do not substitute another party\'s existing contact token. Before returning JSON, check every bracketed span against the permitted list.';
  const results: Analysis[] = [];
  const failed: ClauseFailure[] = [];
  let ranOn: 'cloud' | 'device' | undefined;

  for (const clause of batch.clauses) {
    assertApproved(batch); // Invalidate queued sends after a remask.
    // Until a source responds, let the SDK prefer cloud and fall back locally.
    // After that, pin this batch to that source: no mixed-source badge or duplicate retries.
    const mode = ranOn === 'cloud' ? InferenceMode.ONLY_IN_CLOUD
      : ranOn === 'device' ? InferenceMode.ONLY_ON_DEVICE : config.deviceFallbackEnabled ? InferenceMode.PREFER_IN_CLOUD : InferenceMode.ONLY_IN_CLOUD;
    try {
      const signal = AbortSignal.timeout(60_000);
      const model = getGenerativeModel(ai, {
        mode,
        inCloudParams: {
          model: config.model,
          systemInstruction: config.cloudPrompt + placeholderRules,
          generationConfig: { responseMimeType: 'application/json', responseSchema: cloudSchema, maxOutputTokens: 2048 },
        },
        onDeviceParams: {
          createOptions: {
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
            initialPrompts: [{ role: 'system', content: [{ type: 'text', value: config.devicePrompt + placeholderRules }] }],
            signal,
          },
          promptOptions: { responseConstraint: ANALYSIS_JSON_SCHEMA },
        },
      }, { timeout: 30_000 });
      assertApproved(batch);
      // Explicit projection; no ledger, vault, docId, raw clauses, or extra object properties.
      const response = (await model.generateContent(JSON.stringify({
        id: clause.id, ...(clause.type && { type: clause.type }), text: clause.text,
      }))).response;
      assertApproved(batch);
      const source = response.inferenceSource === InferenceSource.IN_CLOUD ? 'cloud'
        : response.inferenceSource === InferenceSource.ON_DEVICE ? 'device' : undefined;
      if (!source || (ranOn && source !== ranOn)) {
        failed.push({ clauseId: clause.id, reason: 'invalid_response', detail: 'The model did not confirm the expected execution source.' });
        continue;
      }
      ranOn = source;
      let text: string;
      try { text = response.text(); } catch {
        failed.push({ clauseId: clause.id, reason: 'invalid_response', detail: 'The model returned no usable text.' });
        continue;
      }
      results.push(validateAnalysis(text, clause.id, allowed));
    } catch (error) {
      // Stale approval must abort the entire batch, including when a model call rejected.
      assertApproved(batch);
      failed.push(error instanceof AnalysisValidationError
        ? { clauseId: clause.id, reason: error.reason, detail: error.message }
        : { clauseId: clause.id, reason: 'model_error', detail: 'The model request could not be completed.' });
    }
  }
  assertApproved(batch);
  if (!ranOn) throw new AnalysisUnavailableError(batch.docId, failed);
  return { docId: batch.docId, results, failed, ranOn };
}
