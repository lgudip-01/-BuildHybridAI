import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalysisResults } from './App';
import { REDLINE_REVIEW_NOTICE } from '@clause-guard/core/analysis';
import type { ReviewOutcome } from './reviewFlow';

const clauses = [{ id: 'c1', index: 0, text: 'Original fee clause.' }, { id: 'c2', index: 1, text: 'Original rejected clause.' }];
it('renders mixed outcomes with withheld drafting and an unreviewed failure, not a fabricated risk', () => {
  const outcome: ReviewOutcome = { ranOn: 'cloud', restored: [{ clauseId: 'c1', risk: 'medium', explanation: REDLINE_REVIEW_NOTICE + '\n\nReview the fee calculation.', redline: '', questions: ['What fees are intended?'] }],
    failed: [{ clauseId: 'c2', reason: 'unknown_placeholder', detail: 'INTERNAL_DETAIL_SENTINEL' }] };
  const html = renderToStaticMarkup(<AnalysisResults clauses={clauses} outcome={outcome} />);
  expect(html).toContain('1 of 2 clauses returned a validated review');
  expect(html).toContain('Analyzed in cloud');
  expect(html).toContain('Suggested wording withheld');
  expect(html).toContain('Original rejected clause.');
  expect(html).toContain('aria-label="c2: needs review"');
  expect(html).not.toContain('INTERNAL_DETAIL_SENTINEL');
  const failedCard = html.split('id="review-c2"')[1]!;
  expect(failedCard).toContain('Needs review');
  expect(failedCard).not.toContain('data-risk="low"');
  expect(failedCard).not.toContain('Questions to ask');
});

it('does not invent a cloud badge for unavailable analysis and escapes original contract text', () => {
  const html = renderToStaticMarkup(<AnalysisResults clauses={[{ id: 'c1', index: 0, text: '<script>untrustedContract()</script>' }]}
    outcome={{ restored: [], failed: [{ clauseId: 'c1', reason: 'model_error', detail: 'Unavailable' }] }} />);
  expect(html).toContain('0 of 1 clauses returned a validated review');
  expect(html).toContain('Analysis was unavailable');
  expect(html).not.toContain('Analyzed in cloud');
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;script&gt;');
});

it('keeps source-based review labels visible and distinguishes a device scan', () => {
  const html = renderToStaticMarkup(<AnalysisResults clauses={[clauses[0]!]}
    outcome={{ ranOn: 'device', restored: [{ clauseId: 'c1', risk: 'medium', explanation: 'Source-based guarantee review. Review the supplied clause.', redline: '', questions: [] }], failed: [] }} />);
  expect(html).toContain('On-device preliminary scan');
  expect(html).toContain('Source-based guarantee review');
  expect(html).toContain('No replacement wording proposed');
});
