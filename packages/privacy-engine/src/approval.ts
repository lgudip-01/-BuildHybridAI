import type { ApprovedBatch, MaskedClause, MaskResult } from '@clause-guard/core/types';

export type ApprovalErrorCode = 'review_required' | 'not_approved' | 'stale';

export class ApprovalError extends Error {
  readonly code: ApprovalErrorCode;

  constructor(code: ApprovalErrorCode, message: string) {
    super(message);
    this.name = 'ApprovalError';
    this.code = code;
  }
}

type SuccessfulMask = Extract<MaskResult, { ok: true }>;
/** One call to mask() for one document. */
export type Run = { readonly docId: string; readonly run: number };
type Sealed = Run & { readonly needsReview: boolean; readonly clauses: readonly MaskedClause[] };
/** Engine-internal, RAM only. Never added to a public result/batch or the vault. */
export type ChatMaskSnapshot = {
  readonly entries: Readonly<Record<string, string>>;
  readonly aliases: readonly { readonly value: string; readonly tokens: readonly string[]; readonly uncertain?: boolean }[];
};

// The newest masking run of each document. Results and batches from any earlier run are stale.
const latestRun = new Map<string, number>();
let runCount = 0;
// Identity, not content, is what is trusted: a copy, a spread or a hand-built object is never found here.
const sealedResults = new WeakMap<object, Sealed>();
const approvedBatches = new WeakMap<object, Run>();
const chatSnapshots = new Map<number, ChatMaskSnapshot>();
const invalidations = new Map<number, Set<() => void>>();

/**
 * Turns a successful mask() result into the only thing analyze() accepts.
 * Pass the object mask() returned, not a copy. Throws ApprovalError:
 *   'not_approved'     the object did not come from mask()
 *   'stale'            mask() has started again for the same document since this result
 *   'review_required'  the result needs review and `options.reviewed` is not true
 */
export function approve(result: SuccessfulMask, options: { reviewed?: boolean } = {}): ApprovedBatch {
  const sealed = isObject(result) ? sealedResults.get(result) : undefined;
  if (!sealed) {
    throw new ApprovalError('not_approved', 'Only a successful result returned by mask() can be approved. Pass it unchanged, not a copy.');
  }
  if (!isCurrent(sealed)) {
    throw new ApprovalError('stale', 'This document was masked again after this result. Approve the newest result instead.');
  }
  if (sealed.needsReview && options.reviewed !== true) {
    throw new ApprovalError('review_required', 'Masking ran without the on-device model, so the user must review the masked text before it is sent.');
  }
  const batch: ApprovedBatch = Object.freeze({ docId: sealed.docId, clauses: Object.freeze([...sealed.clauses]) });
  approvedBatches.set(batch, { docId: sealed.docId, run: sealed.run });
  return batch;
}

/**
 * Throws ApprovalError unless approve() created this exact batch and it is still current:
 *   'not_approved'  built by hand, copied, or cast from MaskedClause[]
 *   'stale'         mask() has started again for the same document since it was approved
 * Call it before every request that sends the batch, and again after awaiting one.
 */
export function assertApproved(batch: ApprovedBatch): void {
  const run = isObject(batch) ? approvedBatches.get(batch) : undefined;
  if (!run) {
    throw new ApprovalError('not_approved', 'This batch was not created by approve(), so it cannot be sent.');
  }
  if (!isCurrent(run)) {
    throw new ApprovalError('stale', 'This document was masked again after the batch was approved. Approve the newest result instead.');
  }
}

/** Engine-internal, for mask(): starts a run and makes every earlier run of the document stale. Call it before the first await. */
export function startRun(docId: string): Run {
  const previous = latestRun.get(docId);
  runCount += 1;
  latestRun.set(docId, runCount);
  if (previous !== undefined) {
    chatSnapshots.delete(previous);
    const listeners = invalidations.get(previous);
    invalidations.delete(previous);
    listeners?.forEach(listener => { try { listener(); } catch { /* Invalidation cannot be vetoed. */ } });
  }
  return { docId, run: runCount };
}

/** Engine-internal: whether `run` is still the newest masking run of its document. */
export function isCurrent(run: Run): boolean {
  return latestRun.get(run.docId) === run.run;
}

/** Engine-internal, for mask(): freezes a result all the way down and records it, so approve() can trust it. */
export function seal<T extends MaskResult>(result: T, run: Run, snapshot?: ChatMaskSnapshot): T {
  deepFreeze(result);
  if (result.ok) {
    sealedResults.set(result, { ...run, needsReview: result.needsReview, clauses: result.clauses });
    if (snapshot && isCurrent(run)) {
      deepFreeze(snapshot);
      chatSnapshots.set(run.run, snapshot);
    }
  }
  return result;
}

/** Engine-internal read access: requires the exact current registered batch. */
export function approvedChatSnapshot(batch: ApprovedBatch): { run: Run; snapshot: ChatMaskSnapshot } {
  assertApproved(batch);
  const run = approvedBatches.get(batch)!;
  const snapshot = chatSnapshots.get(run.run);
  if (!snapshot) throw new ApprovalError('not_approved', 'This batch has no current masking snapshot.');
  return { run, snapshot };
}

/** Engine-internal cleanup hook; stale data is dropped before remasking awaits. */
export function onApprovedRunInvalidated(batch: ApprovedBatch, listener: () => void): () => void {
  assertApproved(batch);
  const run = approvedBatches.get(batch)!;
  let listeners = invalidations.get(run.run);
  if (!listeners) { listeners = new Set(); invalidations.set(run.run, listeners); }
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) invalidations.delete(run.run); };
}

function deepFreeze(value: unknown): void {
  if (!isObject(value) || Object.isFrozen(value)) return;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
