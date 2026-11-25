import { expect, it } from 'vitest';
import type { CleanText } from '@clause-guard/core/types';
import { sourceQuotedSignatoryReview } from '@clause-guard/core/signatoryReview';

it.each([
  'Sincerely,\n[PERSON_8]\nVP of Engineering, [ORG_5]',
  '[ORG_2]\nBy: [PERSON_7]\nTitle: General Counsel',
  'For [PARTY_Z]: [PERSON_9], Managing Director\nFor [ORG_4]: [PERSON_3], Chief Operating Officer',
  'CONTRACTOR\nBy: [NAME_6]',
  'Accepted: [PERSON_3]\nEmployee ID: [ACCOUNT_8]',
  'Landlord: [PARTY_C]\nTenant: [PERSON_2]\nTenant: [PERSON_5]',
  'Borrower: [PARTY_B]\nSSN: [ACCOUNT_1]\nGuarantor: [PERSON_4]',
  'By: [PERSON_1], Vice-President\nSigned on: [DATE_3]',
  'By: [PARTY_B]\nName: [PARTY_C], CEO, [PARTY_A]',
  'Name: [PERSON_93], Chief Financial Officer, [ORG_72]',
  'By: [PERSON_17], CTO, [ORG_39]',
])('quotes a general masked field layout without asserting a completed act: %s', source => {
  const review = sourceQuotedSignatoryReview(source as CleanText)!;
  expect(review).toContain(source);
  expect(review).toContain('Source-based');
  expect(review).toContain('not evidence of a completed act');
  expect(review.length).toBeLessThan(4000);
});
it.each([
  'Sincerely,\n[PERSON_8]\nMust pay all costs, [ORG_5]',
  'RESIDENTIAL LEASE AGREEMENT',
  '[PARTY_A] agrees to pay [AMOUNT_1].',
  'By: [PERSON_1]\nContractor must transfer all rights.',
  'For [ORG_1]: [PERSON_2], shall pay the fee',
  'By: [PERSON_2]\nTitle: Contractor may terminate',
  'By: [PERSON_1]\nI accept all future liabilities.',
  'By: Unmasked Person',
  'By: [PERSON_1]\nDate: July 3',
  'By: [PERSON_1]\nUnknown field: [ACCOUNT_1]',
  'By: [person_1]',
  'By: [PERSON_1]\nTitle: President accepts all terms',
  'By: [PERSON_1]\nTitle: Principal Spacetime Cartographer',
  'Name: [PERSON_8], CEO must pay, [ORG_9]',
  'By: [PERSON_8], Unknown Commander, [ORG_9]',
  'By: [PERSON_1]\n' + 'Title: Director\n'.repeat(12),
  'By: [PERSON_1]\nTitle: ' + 'x'.repeat(1800),
])('leaves unknown, unmasked, operative or unbounded layouts to ordinary analysis %#', source => {
  expect(sourceQuotedSignatoryReview(source as CleanText)).toBeUndefined();
});
