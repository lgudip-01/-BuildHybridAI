import type { Analysis, AnalyzeResult, ApprovedBatch, ClauseFailure } from '@clause-guard/core/types';
import {
  ANALYSIS_JSON_SCHEMA, AnalysisValidationError, applyCommercialRedlineGuard, clausePlaceholders,
  validateAnalysis, validateBatch, validateExplanationGrounding,
} from '@clause-guard/core/analysis';
import { assertApproved } from './approvalGuard';
import { DEFAULT_ANALYSIS_CONFIG } from './analysisConfig';
import { AnalysisUnavailableError } from './cloudAnalyzer';

/**
 * One masked clause, handed to the native plugin. Native code runs a single model call and reports which
 * source answered. Everything else (approval, prompts, validation, restoring names) stays in TypeScript, so
 * the phone apps can never drift from the web rules.
 */
export type ClauseRequest = {
  /** The cloud and on-device system prompts differ, so both are sent and native uses the one for the path it takes. */
  cloudSystem: string;
  deviceSystem: string;
  /** JSON of {id, type?, text}. Masked text only: never the document id, the ledger or raw contract text. */
  input: string;
  schema: object;
  model: string;
  /** After the first clause answers, the rest of the batch is pinned to that source. null lets native try cloud first. */
  pin: 'cloud' | 'device' | null;
  allowDeviceFallback: boolean;
  timeoutMs: number;
};

export type ClauseResponse = { text: string; source: 'cloud' | 'device' };

export interface AnalysisPlugin {
  analyzeClause(request: ClauseRequest): Promise<ClauseResponse>;
}

/** Same placeholder rules as the web analyzer, derived only from this clause's own masked text. */
function placeholderRules(allowed: ReadonlySet<string>): string {
  return '\nApplication placeholder constraint: for only the supplied clause, the complete permitted token list is ' +
    JSON.stringify([...allowed].sort()) + '. Tokens are opaque labels, not facts about another clause. ' +
    'Copy tokens exactly and only for the same entity or value they already represent. ' +
    'Never increment a token suffix or create a new contact token. ' +
    "If a notice clause lacks a party's email or address, set redline to the empty string and ask for the missing contact details in questions. " +
    "Do not substitute another party's existing contact token. Before returning JSON, check every bracketed span against the permitted list.";
}

/**
 * Analyzes an approved batch through the native plugin. Mirrors the web analyzer's guarantees:
 * approval is checked before the first request, again before and after every native call, and a stale
 * batch aborts the whole run. Responses are validated here; native output is never trusted.
 */
export async function analyzeApprovedNative(plugin: AnalysisPlugin, batch: ApprovedBatch): Promise<AnalyzeResult> {
  assertApproved(batch); // Must be first: never trust the TypeScript brand alone.
  validateBatch(batch);
  const config = DEFAULT_ANALYSIS_CONFIG; // Remote Config is a web-SDK feature; the phone apps use the shared defaults.
  if (!config.enabled) throw new Error('Cloud analysis is temporarily disabled by configuration.');

  const results: Analysis[] = [];
  const failed: ClauseFailure[] = [];
  let ranOn: 'cloud' | 'device' | undefined;

  for (const clause of batch.clauses) {
    assertApproved(batch); // Invalidate queued sends after a remask.
    const allowed = clausePlaceholders(clause);
    const rules = placeholderRules(allowed);
    try {
      assertApproved(batch);
      const response = await plugin.analyzeClause({
        cloudSystem: config.cloudPrompt + rules,
        deviceSystem: config.devicePrompt + rules,
        // Explicit projection: no ledger, vault, docId or extra properties.
        input: JSON.stringify({ id: clause.id, ...(clause.type && { type: clause.type }), text: clause.text }),
        schema: ANALYSIS_JSON_SCHEMA,
        model: config.model,
        pin: ranOn ?? null,
        allowDeviceFallback: config.deviceFallbackEnabled,
        timeoutMs: 60_000,
      });
      assertApproved(batch);
      const source = response?.source;
      if ((source !== 'cloud' && source !== 'device') || (ranOn && source !== ranOn)) {
        failed.push({ clauseId: clause.id, reason: 'invalid_response', detail: 'The model did not confirm the expected execution source.' });
        continue;
      }
      ranOn = source;
      // Validate first: withheld drafts must not hide invented tokens or bad JSON.
      const validated = validateAnalysis(response.text, clause.id, allowed);
      validateExplanationGrounding(validated, clause.text);
      results.push(applyCommercialRedlineGuard(validated, clause.text));
    } catch (error) {
      // A stale approval aborts the entire batch, even when the native call itself rejected.
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
