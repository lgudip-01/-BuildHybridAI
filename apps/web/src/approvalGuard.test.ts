import { expect, it } from 'vitest';
import { assertApproved } from './approvalGuard';
import type { ApprovedBatch } from '@clause-guard/core/types';

it('rejects a handcrafted batch through the real engine registry', () => {
  let rejected = false;
  try { assertApproved({ docId: 'fake', clauses: [] } as ApprovedBatch); }
  catch (error) {
    rejected = true;
    expect((error as {code: string}).code).toBe('not_approved');
  }
  expect(rejected).toBe(true);
});
