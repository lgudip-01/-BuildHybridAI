import { describe, expect, it } from 'vitest';
import { findNames, findPatterns } from './regex';

const found = (text: string) => findPatterns(text).map((s) => [s.kind, s.value]);

describe('findPatterns', () => {
  it.each([
    ['a fee of $10,000.00 per month', '$10,000.00'],
    ['USD 5,000 upfront', 'USD 5,000'],
    ['paid 2,500 dollars', '2,500 dollars'],
    ['up to $1.5 million', '$1.5 million'],
    ['the sum of Ten Thousand Dollars', 'Ten Thousand Dollars'],
    ['One Hundred and Fifty Dollars', 'One Hundred and Fifty Dollars'],
  ])('finds the amount in %j', (text, value) => {
    expect(found(text)).toContainEqual(['AMOUNT', value]);
  });

  it.each([
    ['effective January 1, 2026 onward', 'January 1, 2026'],
    ['on this 1st day of March, 2026', '1st day of March, 2026'],
    ['signed 2026-11-14.', '2026-11-14'],
    ['due 11/14/2026.', '11/14/2026'],
    ['as of 14 November 2026', '14 November 2026'],
  ])('finds the date in %j', (text, value) => {
    expect(found(text)).toContainEqual(['DATE', value]);
  });

  it('finds a labelled ID', () => {
    expect(found('Employee ID: QF-20418')).toContainEqual(['ACCOUNT', 'QF-20418']);
  });

  it('finds emails, phone numbers, and account numbers', () => {
    const text =
      'Email legal@acme-corp.com or call (555) 123-4567 or +1 555-987-6543. ' +
      'Account No. 4417, IBAN GB29 NWBK 6016 1331 9268 19, SSN 123-45-6789.';
    const spans = found(text);
    expect(spans).toContainEqual(['EMAIL', 'legal@acme-corp.com']);
    expect(spans).toContainEqual(['PHONE', '(555) 123-4567']);
    expect(spans).toContainEqual(['PHONE', '+1 555-987-6543']);
    expect(spans).toContainEqual(['ACCOUNT', '4417']);
    expect(spans).toContainEqual(['ACCOUNT', 'GB29 NWBK 6016 1331 9268 19']);
    expect(spans).toContainEqual(['ACCOUNT', '123-45-6789']);
  });

  it('leaves contract terms the cloud model needs', () => {
    expect(found('Within 30 days under Section 1.2.10, interest accrues at 5% per month for 2 years.')).toEqual([]);
  });
});

describe('findNames', () => {
  const names = (text: string, broad: boolean) => findNames(text, broad).map((s) => [s.kind, s.value]);

  it('finds companies, titled people, and signature lines', () => {
    const text = 'This Agreement is between Acme Widgets, Inc. and Mr. John Smith.\nBy: Jane Q. Doe';
    expect(names(text, false)).toEqual([
      ['ORG', 'Acme Widgets, Inc.'],
      ['PERSON', 'Mr. John Smith'],
      ['PERSON', 'Jane Q. Doe'],
    ]);
  });

  it('finds street addresses', () => {
    expect(names('Notices go to 42 Elm Street, Suite 300, Springfield, NJ 07001.', false)).toEqual([
      ['ADDRESS', '42 Elm Street, Suite 300, Springfield, NJ 07001'],
    ]);
  });

  it('finds apartment addresses, Dutch company suffixes, and surname particles', () => {
    expect(names('Rent the unit at 2210 Cedar Avenue, Apt 5B, Portland, OR 97214.', false)).toEqual([
      ['ADDRESS', '2210 Cedar Avenue, Apt 5B, Portland, OR 97214'],
    ]);
    expect(names('Verdant Logistics B.V. agrees.\nBy: Eline de Vries', false)).toEqual([
      ['ORG', 'Verdant Logistics B.V.'],
      ['PERSON', 'Eline de Vries'],
    ]);
  });

  it('does not run a name across a line break', () => {
    expect(names('By: Dana Reyes\nName: Michael Chen, CEO', false)).toEqual([
      ['PERSON', 'Dana Reyes'],
      ['PERSON', 'Michael Chen'],
    ]);
  });

  it('reads names with an apostrophe or hyphen', () => {
    expect(names("Call Ms. O'Connell or Mr. Smith-Jones.", false)).toEqual([
      ['PERSON', "Ms. O'Connell"],
      ['PERSON', 'Mr. Smith-Jones'],
    ]);
  });

  it('does not run a name across a sentence end', () => {
    expect(names('Signed by Maria Lopez. Notices must be written.', true)).toEqual([['NAME', 'Maria Lopez']]);
  });

  it('keeps job titles and jurisdictions in broad mode', () => {
    const text =
      'Hannah Lee, General Counsel, hires a Senior Data Engineer and a Head of Product under the laws of the State of Oregon, ' +
      'New York, and the United States.';
    expect(names(text, true)).toEqual([['NAME', 'Hannah Lee']]);
  });

  it('skips role words like "the Company"', () => {
    expect(names('The Company and the Receiving Party agree.', true)).toEqual([]);
  });

  it('adds capitalized phrases only in broad mode', () => {
    const text = 'Confidential Information shared with Maria Lopez stays private.';
    expect(names(text, false)).toEqual([]);
    expect(names(text, true)).toEqual([['NAME', 'Maria Lopez']]);
  });
});
