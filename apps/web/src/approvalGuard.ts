import type { ApprovedBatch } from '@clause-guard/core/types';

type ApprovalModule = { assertApproved(batch: ApprovedBatch): void };

// Optional only while the engine implementation in issue #8 is pending.
// Eager bundling uses the engine's real module singleton/WeakMap when present.
// No casts, copied batches, alternate guard, or network fallback can approve input.
const modules = import.meta.glob<ApprovalModule>(
  '../../../packages/privacy-engine/src/approval.ts',
  { eager: true },
);
const engine = Object.values(modules)[0];

export class ApprovalUnavailableError extends Error {
  readonly code = 'approval_unavailable';
  constructor() {
    super('The privacy engine approval module is not installed. Analysis is blocked. See issue #8.');
    this.name = 'ApprovalUnavailableError';
  }
}

export function assertApproved(batch: ApprovedBatch): void {
  if (!engine || typeof engine.assertApproved !== 'function') {
    throw new ApprovalUnavailableError();
  }
  // Preserve the original engine error and its review_required/not_approved/stale code.
  engine.assertApproved(batch);
}
