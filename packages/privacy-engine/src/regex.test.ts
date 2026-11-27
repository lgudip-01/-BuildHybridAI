import { describe, expect, it } from 'vitest';
import { findNames, findPatterns, isGeneric } from './regex';

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

  it('finds card expiry dates and security codes', () => {
    const spans = found('Card 4111 1111 1111 1111 exp 09/29 CVV 123. Expiration date: 11/2027, CVC: 4821.');
    expect(spans).toContainEqual(['ACCOUNT', '4111 1111 1111 1111']);
    expect(spans).toContainEqual(['DATE', '09/29']);
    expect(spans).toContainEqual(['ACCOUNT', '123']);
    expect(spans).toContainEqual(['DATE', '11/2027']);
    expect(spans).toContainEqual(['ACCOUNT', '4821']);
  });

  it('finds web addresses, IP addresses and handles', () => {
    const spans = found(
      'Log in at https://portal.acme-corp.com/u/jsmith, see www.acme-corp.com or acme-corp.io. ' +
        'Access from 192.168.10.24 only. Message @jsmith or write to jsmith (at) acme.com or j.smith [at] acme [dot] co.',
    );
    expect(spans).toContainEqual(['URL', 'https://portal.acme-corp.com/u/jsmith']);
    expect(spans).toContainEqual(['URL', 'www.acme-corp.com']);
    expect(spans).toContainEqual(['URL', 'acme-corp.io']);
    expect(spans).toContainEqual(['IP', '192.168.10.24']);
    expect(spans).toContainEqual(['HANDLE', '@jsmith']);
    expect(spans).toContainEqual(['EMAIL', 'jsmith (at) acme.com']);
    expect(spans).toContainEqual(['EMAIL', 'j.smith [at] acme [dot] co']);
  });

  it.each([
    ['signed on the third of May, 2026', 'third of May, 2026'],
    ['effective the twenty-first day of June, 2027', 'twenty-first day of June, 2027'],
    ['due May the 3rd, 2026', 'May the 3rd, 2026'],
  ])('finds the date written in words in %j', (text, value) => {
    expect(found(text)).toContainEqual(['DATE', value]);
  });

  it('finds UK and Canadian postcodes on their own', () => {
    expect(found('Post it to SW1A 2AA or K1A 0B1.')).toEqual([
      ['ADDRESS', 'SW1A 2AA'],
      ['ADDRESS', 'K1A 0B1'],
    ]);
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

  it('keeps the titles of other documents in broad mode', () => {
    const text = 'Sign the Proprietary Information and Inventions Agreement and read the Employee Handbook, as Hannah Lee did.';
    expect(names(text, true)).toEqual([['NAME', 'Hannah Lee']]);
  });

  it('skips role words like "the Company"', () => {
    expect(names('The Company and the Receiving Party agree.', true)).toEqual([]);
  });

  it('treats roles and document titles as contract vocabulary, plural or not', () => {
    const vocabulary = ['Tenants', 'Borrower', 'Security Deposit', 'Software as a Service Agreement', 'RESIDENTIAL LEASE AGREEMENT'];
    expect(vocabulary.filter((v) => !isGeneric(v))).toEqual([]);
    expect(isGeneric('Coastal Ridge Credit Union')).toBe(false);
  });

  it('keeps contract references out of names, but keeps middle initials in them', () => {
    const text = 'Contractor will build the app as described in Exhibit A. Adebayo will report to Hannah Kowalczyk, Head of Product.';
    expect(names(text, true)).toEqual([['NAME', 'Hannah Kowalczyk']]);
    expect(names('Exhibit B and Schedule 2 apply, as do Section 4.1 and Annex C.', true)).toEqual([]);
    expect(names('Payment goes to Jane Q. Doe on time.', true)).toEqual([['NAME', 'Jane Q. Doe']]);
  });

  it('skips numbered section headings in broad mode', () => {
    expect(names('3. Service Levels. Uptime is reported to Maria Lopez.\n4. Data Protection: see the policy.', true)).toEqual([
      ['NAME', 'Maria Lopez'],
    ]);
  });

  it('reads names with accents', () => {
    const text = 'Zoë Ångström signs. José García witnesses for Société Générale S.A.\nBy: Łukasz Wróbel';
    expect(names(text, false)).toEqual([
      ['ORG', 'Société Générale S.A.'],
      ['PERSON', 'Łukasz Wróbel'],
    ]);
    expect(names(text, true)).toEqual(expect.arrayContaining([
      ['NAME', 'Zoë Ångström'],
      ['NAME', 'José García'],
    ]));
    expect(names('Call Dr. Müller.', false)).toEqual([['PERSON', 'Dr. Müller']]);
  });

  it('finds a full address with a UK postcode', () => {
    expect(names('Deliver to 10 Downing Street, London SW1A 2AA.', false)).toEqual([
      ['ADDRESS', '10 Downing Street, London SW1A 2AA'],
    ]);
  });

  it('finds names in capitals in a signature block, but not headings', () => {
    const block = 'IN WITNESS WHEREOF, the parties sign below.\nJOHN SMITH\nACME HOLDINGS LLC\nBy: ________\nMARÍA JOSÉ PÉREZ';
    expect(names(block, true)).toEqual([
      ['ORG', 'ACME HOLDINGS LLC'],
      ['PERSON', 'JOHN SMITH'],
      ['PERSON', 'MARÍA JOSÉ PÉREZ'],
    ]);
    expect(names('SERVICE LEVELS\nUptime is measured monthly.', true)).toEqual([]);
  });

  it('treats the labels of ID numbers as vocabulary', () => {
    expect(names('Passport No. X1234567 and Social Security Number 123-45-6789 are on file.', true)).toEqual([]);
  });

  it('adds capitalized phrases only in broad mode', () => {
    const text = 'Confidential Information shared with Maria Lopez stays private.';
    expect(names(text, false)).toEqual([]);
    expect(names(text, true)).toEqual([['NAME', 'Maria Lopez']]);
  });
});


it.each(['12,500', '1,234,567.89', '0,500'])('masks standalone comma-formatted numeric value %s', value => {
  expect(findPatterns(`Value ${value} is private.`)).toEqual(expect.arrayContaining([expect.objectContaining({kind:'AMOUNT',value})]));
});
it('does not partially mask an identifier or decimal/section suffix as a grouped amount', () => {
  for (const text of ['idA12,500B', '12,500.99.2', '30 days', 'section 12.5']) {
    expect(findPatterns(text).filter(s=>s.kind==='AMOUNT')).toEqual([]);
  }
});


it.each(['12500','12500.50','99999','1250000'])('masks a plain numeric value %s without grouping or currency', value => {
  expect(findPatterns(`Value ${value} is private.`)).toEqual(expect.arrayContaining([expect.objectContaining({kind:'AMOUNT',value})]));
});
it('does not confuse plain numeric values with word interiors, years, deadlines or section decimals', () => {
  for (const text of ['record12500A','2026','30 days','section 12.50000','1.12500.3']) {
    expect(findPatterns(text).filter(s=>s.kind==='AMOUNT')).toEqual([]);
  }
});
