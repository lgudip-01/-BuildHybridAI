import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AiBridge, MaskResult } from '@clause-guard/core/types';

const native = vi.hoisted(() => ({ scanDocument: vi.fn(), platform: 'ios' }));
vi.mock('@capacitor/core', () => ({
  registerPlugin: () => native,
  Capacitor: { getPlatform: () => native.platform, isNativePlatform: () => true },
}));

import { scanContract } from './nativeBridge';
import { ReviewSession } from './reviewFlow';
import { fixNumberMisreads, ScanError, scanPageText, scannedText, SCAN_REVIEW_NOTE, type ScanLine } from './scanText';
import { splitClauses } from './clauses';
import { Output } from './Workbench';

/** Lines laid out like a printed page: 1.4 line pitch, a blank line between paragraphs. */
function page(paragraphs: string[][], { pitch = 0.02, h = 0.014, width = 0.8 } = {}): ScanLine[] {
  const lines: ScanLine[] = [];
  let y = 0.05;
  for (const paragraph of paragraphs) {
    for (const text of paragraph) {
      lines.push({ text, x: 0.1, y, w: width * (text.length / 60), h });
      y += pitch;
    }
    y += pitch;
  }
  return lines;
}

const unavailable: AiBridge = {
  onDeviceStatus: async () => 'unavailable',
  onDevice: async () => { throw new Error('unavailable'); },
  analyze: async () => { throw new Error('not used'); },
};

beforeEach(() => {
  native.scanDocument.mockReset();
  native.platform = 'ios';
});

describe('scanPageText', () => {
  it('orders lines top to bottom and joins pieces of one printed line left to right', () => {
    const text = scanPageText([
      { text: 'second line', x: 0.1, y: 0.10, w: 0.3, h: 0.014 },
      { text: 'right half', x: 0.55, y: 0.051, w: 0.3, h: 0.014 },
      { text: 'Left half', x: 0.1, y: 0.05, w: 0.3, h: 0.014 },
    ]);
    expect(text).toBe('Left half right half\n\nsecond line');
  });

  it('keeps paragraphs and numbered headings so the clause splitter finds each section', () => {
    const text = scanPageText(page([
      ['MUTUAL NON-DISCLOSURE AGREEMENT'],
      ['1. Parties. This Agreement is made on January 1, 2026 between Acme Corp and', 'Dana Reyes, who agree as follows.'],
      ['2. Payment. Acme will pay $12,500 to Reyes within thirty (30) days of the', 'invoice date by wire to account 1234 5678 9012.'],
    ]));
    expect(text).toContain('January 1, 2026 between Acme Corp and Dana Reyes');
    expect(splitClauses(text).map((clause) => clause.text.slice(0, 10))).toEqual(['MUTUAL NON', '1. Parties', '2. Payment']);
  });

  it('joins a line ending in a hyphen without a space, keeping the hyphen as PDF import does', () => {
    // Keeping it leaves a split address such as "northwind-analytics.com" whole for the masking patterns.
    const text = scanPageText(page([['Send every notice to the Company at legal@northwind-', 'analytics.com by email.']], { width: 0.8 }));
    expect(text).toBe('Send every notice to the Company at legal@northwind-analytics.com by email.');
  });

  it('starts a new clause at an all-capitals signer line, whose box is shorter than the text above it', () => {
    // Spacing measured from a Vision read of samples/documents/freelance.pdf.
    const text = scanPageText([
      { text: '6. Independent Status. Contractor is not an employee and is', x: 0.126, y: 0.4592, w: 0.675, h: 0.0177 },
      { text: "responsible for all taxes. Contractor's tax ID is 47-3920185.", x: 0.126, y: 0.4797, w: 0.676, h: 0.0161 },
      { text: 'LARKSPUR MEDIA GROUP LTD', x: 0.126, y: 0.5116, w: 0.269, h: 0.0132 },
      { text: 'By: Hannah Kowalczyk', x: 0.126, y: 0.5305, w: 0.186, h: 0.0162 },
      { text: 'CONTRACTOR', x: 0.126, y: 0.5640, w: 0.126, h: 0.0116 },
      { text: 'By: Okonkwo Adebayo', x: 0.126, y: 0.5812, w: 0.182, h: 0.0162 },
    ]);
    expect(splitClauses(text).map((clause) => clause.text)).toEqual([
      "6. Independent Status. Contractor is not an employee and is responsible for all taxes. Contractor's tax ID is 47-3920185.",
      'LARKSPUR MEDIA GROUP LTD\nBy: Hannah Kowalczyk',
      'CONTRACTOR\nBy: Okonkwo Adebayo',
    ]);
  });

  it('ignores empty lines and boxes without a usable size', () => {
    expect(scanPageText([
      { text: '   ', x: 0.1, y: 0.1, w: 0.2, h: 0.01 },
      { text: 'bad box', x: Number.NaN, y: 0.1, w: 0.2, h: 0.01 },
      { text: 'flat', x: 0.1, y: 0.2, w: 0.2, h: 0 },
      { text: 'Kept', x: 0.1, y: 0.3, w: 0.2, h: 0.01 },
    ])).toBe('Kept');
  });
});

describe('fixNumberMisreads', () => {
  it('reads a letter O inside a number as zero', () => {
    expect(fixNumberMisreads("either party gives 9o days' notice")).toBe("either party gives 90 days' notice");
    expect(fixNumberMisreads('pay $12,5oo by 2O26-05-01.')).toBe('pay $12,500 by 2026-05-01.');
    expect(fixNumberMisreads('account 1234 5678 9O12')).toBe('account 1234 5678 9012');
  });

  it('leaves words and letter-only tokens alone', () => {
    const text = "No. 5, O'Connell, Oct 3, OO, Section 4.O(b) Form O2X, 10am, B2B";
    expect(fixNumberMisreads(text)).toBe("No. 5, O'Connell, Oct 3, OO, Section 4.0(b) Form O2X, 10am, B2B");
  });
});

describe('scannedText', () => {
  it('applies the number fix to the joined text', () => {
    expect(scannedText([{ lines: page([['renews unless either party gives 9o days notice.']]) }])).toBe('renews unless either party gives 90 days notice.');
  });

  it('separates pages with a blank line and skips blank pages', () => {
    const pages = [{ lines: page([['Page one text.']]) }, { lines: [] }, { lines: page([['Page two text.']]) }];
    expect(scannedText(pages)).toBe('Page one text.\n\nPage two text.');
  });

  it('fails with no_text when nothing was read', () => {
    expect(() => scannedText([{ lines: [] }])).toThrow(ScanError);
    expect(() => scannedText([])).toThrow(/No text was found/);
  });
});

describe('scanContract', () => {
  it('returns the recognized text from the plugin', async () => {
    native.scanDocument.mockResolvedValue({ pages: [{ lines: page([['1. Term. Twelve months.']]) }] });
    await expect(scanContract()).resolves.toBe('1. Term. Twelve months.');
    expect(native.scanDocument).toHaveBeenCalledWith();
  });

  it('treats cancel as no change', async () => {
    native.scanDocument.mockRejectedValue(Object.assign(new Error('canceled'), { code: 'CANCELED' }));
    await expect(scanContract()).resolves.toBeNull();
  });

  it.each([
    ['UNAVAILABLE', 'ios', 'unavailable', /needs a camera/],
    ['UNAVAILABLE', 'android', 'unavailable', /Google Play services/],
    ['PERMISSION_DENIED', 'ios', 'permission', /Camera access is off/],
    ['SCAN_FAILED', 'android', 'failed', /couldn't be read/],
    [undefined, 'ios', 'failed', /couldn't be read/],
  ])('maps %s on %s to a fixed %s message', async (code, platform, expected, message) => {
    native.platform = platform;
    // The native message is never shown, so recognized text could not leak through an error.
    native.scanDocument.mockRejectedValue(Object.assign(new Error('SENTINEL native detail'), { code }));
    const error = await scanContract().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ScanError);
    expect((error as ScanError).code).toBe(expected);
    expect((error as ScanError).message).toMatch(message);
    expect((error as ScanError).message).not.toContain('SENTINEL');
  });

  it('reports no_text for an empty scan', async () => {
    native.scanDocument.mockResolvedValue({ pages: [{ lines: [] }] });
    await expect(scanContract()).rejects.toMatchObject({ code: 'no_text' });
  });
});

describe('scanned review flag', () => {
  it('is set by a scan, kept through typing and masking, and cleared by import or delete', async () => {
    const session = new ReviewSession(unavailable, '');
    expect(session.edit('1. Payment. Acme Corp pays Dana Reyes $12,500.', 'scan')).toBe(true);
    expect(session.getSnapshot().scanned).toBe(true);

    session.edit('1. Payment. Acme Corp pays Dana Reyes $12,600.', 'typed');
    expect(session.getSnapshot().scanned).toBe(true);

    await session.mask();
    expect(session.getSnapshot()).toMatchObject({ phase: 'review', scanned: true });

    session.edit('1. Payment. Imported text.', 'import');
    expect(session.getSnapshot().scanned).toBeUndefined();

    session.edit('1. Payment. Scanned again.', 'scan');
    await session.deleteDocument();
    expect(session.getSnapshot()).toMatchObject({ phase: 'deleted' });
    expect(session.getSnapshot().scanned).toBeUndefined();
  });

  it('marks identical text as scanned when it comes from a scan', () => {
    const session = new ReviewSession(unavailable, 'Same text.');
    expect(session.edit('Same text.', 'typed')).toBe(false);
    expect(session.edit('Same text.', 'scan')).toBe(true);
    expect(session.getSnapshot().scanned).toBe(true);
  });
});

describe('scanned preview banner', () => {
  const clean: Extract<MaskResult, { ok: true }> = {
    ok: true,
    docId: 'doc',
    clauses: [{ id: 'c1', index: 0, text: 'PARTY_1 pays PERSON_1.' }],
    ledger: [],
    needsReview: false,
    modelReadClauses: 1,
  } as unknown as Extract<MaskResult, { ok: true }>;

  it('asks for review of scanned text even when the model read every clause', () => {
    const html = renderToStaticMarkup(<Output run={{ result: clean, ms: 10 }} active={null} onActive={() => {}} scanned />);
    expect(html).toContain('data-tone="warn"');
    expect(html).toContain('Check the scanned text before sending.');
    expect(html).toContain(SCAN_REVIEW_NOTE);
    expect(html).not.toContain('Masked on device in');
  });

  it('keeps the clean banner for typed text', () => {
    const html = renderToStaticMarkup(<Output run={{ result: clean, ms: 10 }} active={null} onActive={() => {}} />);
    expect(html).toContain('data-tone="ok"');
    expect(html).not.toContain(SCAN_REVIEW_NOTE);
  });

  it('adds the scan note to an existing review reason', () => {
    const patterns = { ...clean, needsReview: true, modelReadClauses: 0 };
    const html = renderToStaticMarkup(<Output run={{ result: patterns, ms: 10 }} active={null} onActive={() => {}} scanned />);
    expect(html).toContain('Masked with patterns only. Review before sending.');
    expect(html).toContain(SCAN_REVIEW_NOTE);
    expect(html).toContain('did not return a usable read of any clause');
  });
});
