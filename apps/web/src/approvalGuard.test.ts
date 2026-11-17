import { expect, it } from 'vitest';
import { assertApproved } from './approvalGuard';
import type { ApprovedBatch } from '@clause-guard/core/types';

it('never approves a handcrafted batch, with or without the engine module', () => {
  let rejected = false;
  try { assertApproved({ docId: 'fake', clauses: [] } as ApprovedBatch); }
  catch (error) {
    rejected = true;
    expect(['approval_unavailable', 'not_approved']).toContain((error as {code: string}).code);
  }
  expect(rejected).toBe(true);
});
