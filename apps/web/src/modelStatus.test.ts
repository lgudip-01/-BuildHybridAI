import { describe, expect, it } from 'vitest';
import type { MaskResult } from '@clause-guard/core/types';
import { displayStatus, reviewReason, reviewTitle } from './Workbench';

type Masked = Extract<MaskResult, { ok: true }>;

function masked(modelReadClauses: number | undefined, clauseCount = 3, needsReview = true): Masked {
  return {
    ok: true, docId: 'd', ledger: [], needsReview,
    clauses: Array.from({ length: clauseCount }, (_, i) => ({ id: `c${i + 1}`, text: 'x' })) as Masked['clauses'],
    ...(modelReadClauses === undefined ? {} : { modelReadClauses }),
  };
}
const run = (result: Masked) => ({ result, ms: 5 });

describe('on-device status pill', () => {
  it('stops saying ready once a run shows the model never read a clause', () => {
    expect(displayStatus('available', run(masked(0)))).toBe('failed');
  });

  it('stays ready when the model read at least one clause, even if review is needed', () => {
    expect(displayStatus('available', run(masked(1)))).toBe('available');
    expect(displayStatus('available', run(masked(3)))).toBe('available');
  });

  it('stays ready before any run, and leaves other states alone', () => {
    expect(displayStatus('available', null)).toBe('available');
    expect(displayStatus('unavailable', run(masked(0)))).toBe('unavailable');
    expect(displayStatus('checking', null)).toBe('checking');
  });

  it('does not call a result without the count a failure', () => {
    expect(displayStatus('available', run(masked(undefined)))).toBe('available');
  });
});

describe('review banner', () => {
  it('says "patterns only" and "didn\'t run" only when the model read nothing', () => {
    expect(reviewTitle(masked(0))).toMatch(/patterns only/);
    expect(reviewReason(masked(0))).toMatch(/didn't run/);
  });

  it('gives the count when the model read some clauses', () => {
    expect(reviewTitle(masked(2))).not.toMatch(/patterns only/);
    expect(reviewReason(masked(2))).toBe(
      'The on-device model read 2 of 3 clauses. In the others, a name used without a title or company suffix can slip through.',
    );
  });

  it('explains unconfirmed names when the model read every clause', () => {
    expect(reviewReason(masked(3))).not.toMatch(/didn't run/);
    expect(reviewReason(masked(3))).toMatch(/found names the patterns couldn’t confirm/);
  });
});
