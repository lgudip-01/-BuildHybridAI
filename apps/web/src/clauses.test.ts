import { readFileSync } from 'node:fs';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { describe, expect, it } from 'vitest';
import { splitClauses } from './clauses';
import { pageText } from './importDocument';

const NAMES = ['nda', 'freelance', 'lease', 'offer-letter', 'saas', 'promissory-note'];
const samples = new URL('../../../samples/', import.meta.url);
const read = (file: string) => readFileSync(new URL(file, samples));
// Each sample's answer key in samples/*.json numbers clauses by blank-line paragraphs.
const paragraphs = (text: string) => text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const flat = (texts: string[]) => texts.map((t) => t.replace(/\s+/g, ' '));

describe('splitClauses', () => {
  it.each(NAMES)('splits samples/%s.txt into the same clauses as its answer key', (name) => {
    const text = read(`${name}.txt`).toString('utf8');
    expect(splitClauses(text).map((c) => c.text)).toEqual(paragraphs(text));
  });

  it('gives every clause a unique id in order', () => {
    expect(splitClauses('One.\n\nTwo.\n\nThree.').map(({ id, index }) => [id, index])).toEqual([['c1', 0], ['c2', 1], ['c3', 2]]);
  });

  it('starts a new clause at each numbered section, even without a blank line', () => {
    const text = '1. Term. Two years.\n2) Fees. $500 a month.\nSection 3 Notices go by email.\nARTICLE IV Law. Oregon.';
    expect(splitClauses(text).map((c) => c.text)).toEqual([
      '1. Term. Two years.',
      '2) Fees. $500 a month.',
      'Section 3 Notices go by email.',
      'ARTICLE IV Law. Oregon.',
    ]);
  });

  it('keeps subsections and lettered items with their section', () => {
    const text = '4. Payment.\n4.1 Client pays monthly.\n(a) by wire;\n(b) by check.';
    expect(splitClauses(text).map((c) => c.text)).toEqual([text]);
  });

  it('drops page numbers and keeps signature lines that came as separate paragraphs together', () => {
    const text = '7. Law. Oregon.\n\nPage 2 of 2\n\nLandlord: Margaret O\'Connell\n\nTenant: Wei Zhang\n\nBy: ________';
    expect(splitClauses(text).map((c) => c.text)).toEqual([
      '7. Law. Oregon.',
      "Landlord: Margaret O'Connell\nTenant: Wei Zhang\nBy: ________",
    ]);
  });
});

describe('imported documents', () => {
  it.each(NAMES)('reads samples/documents/%s.docx into the same clauses as the text', async (name) => {
    const { value } = await mammoth.extractRawText({ buffer: read(`documents/${name}.docx`) });
    const text = read(`${name}.txt`).toString('utf8');
    expect(flat(splitClauses(value).map((c) => c.text))).toEqual(flat(paragraphs(text)));
  });

  it.each(NAMES)('reads samples/documents/%s.pdf into the same clauses as the text', async (name) => {
    const loading = getDocument({ data: new Uint8Array(read(`documents/${name}.pdf`)) });
    const pdf = await loading.promise;
    const pages: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const { items } = await (await pdf.getPage(n)).getTextContent();
      pages.push(pageText(items.filter((item): item is TextItem => 'str' in item)));
    }
    await loading.destroy();
    const text = read(`${name}.txt`).toString('utf8');
    expect(flat(splitClauses(pages.join('\n\n')).map((c) => c.text))).toEqual(flat(paragraphs(text)));
  });

  it('rejoins an address broken at a hyphen across the margin, and starts a paragraph after a gap', () => {
    const run = (str: string, y: number) => ({ str, transform: [1, 0, 0, 1, 72, y], height: 11, hasEOL: true });
    expect(pageText([
      run('Notices to Northwind go to Priya Raman, General Counsel, at legal@northwind-', 700),
      run('analytics.com or by mail.', 686),
      run('5. Term. Two years.', 650),
    ])).toBe('Notices to Northwind go to Priya Raman, General Counsel, at legal@northwind-analytics.com or by mail.\n\n5. Term. Two years.');
  });

  it('keeps a letter closing with the name and title under it', () => {
    expect(splitClauses('Please sign by Friday.\n\nSincerely,\n\nDr. Anika Bose\n\nVP of Engineering').map((c) => c.text)).toEqual([
      'Please sign by Friday.',
      'Sincerely,\nDr. Anika Bose\nVP of Engineering',
    ]);
  });
});
