import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { HEADING } from './clauses';

/** Reads a contract file into plain text. PDF and Word files are parsed in this browser; nothing is uploaded. */
export async function readDocument(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return pdfText(await file.arrayBuffer());
  if (name.endsWith('.docx')) return docxText(await file.arrayBuffer());
  if (name.endsWith('.txt') || file.type.startsWith('text/')) return file.text();
  throw new Error('Choose a PDF, Word (.docx) or text file.');
}

/** A Word document's text, one paragraph per blank-line-separated block. */
export async function docxText(data: ArrayBuffer): Promise<string> {
  const { default: mammoth } = await import('mammoth');
  const { value } = await mammoth.extractRawText({ arrayBuffer: data });
  return value.trim();
}

async function pdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // The worker ships with the app, so no part of the file or the parser comes from another server.
  pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  const loading = pdfjs.getDocument({ data });
  const pdf = await loading.promise;
  try {
    const pages: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const { items } = await (await pdf.getPage(n)).getTextContent();
      pages.push(pageText(items.filter((item): item is TextItem => 'str' in item)));
    }
    const text = pages.filter(Boolean).join('\n\n');
    if (!text) throw new Error('This PDF has no text in it, so it is probably a scan. Scanned contracts are not supported yet.');
    return text;
  } finally {
    await loading.destroy();
  }
}

type Line = { text: string; y: number; height: number };

/**
 * Rebuilds one PDF page's paragraphs from its text runs. A gap of more than a line starts a new paragraph,
 * and a line that runs to the right margin wraps onto the next, so the two are joined with a space.
 */
export function pageText(items: Pick<TextItem, 'str' | 'transform' | 'height' | 'hasEOL'>[]): string {
  const lines: Line[] = [];
  let current: Line | undefined;
  for (const item of items) {
    current ??= { text: '', y: item.transform[5] ?? 0, height: 0 };
    current.text += item.str;
    current.height = Math.max(current.height, item.height);
    if (item.hasEOL) {
      lines.push(current);
      current = undefined;
    }
  }
  if (current) lines.push(current);

  const written = lines.filter((line) => line.text.trim());
  const widest = Math.max(0, ...written.map((line) => line.text.trim().length));
  let text = '';
  written.forEach((line, i) => {
    const words = line.text.trim();
    const previous = written[i - 1];
    if (!previous) {
      text = words;
      return;
    }
    const gap = previous.y - line.y;
    if (gap > previous.height * 1.8 || gap < 0) {
      text += `\n\n${words}`;
    } else if (previous.text.trim().length >= widest * 0.8 && !HEADING.test(words)) {
      // A line ending in a hyphen broke a word or an address such as "northwind-analytics.com": join, keep the hyphen.
      text += text.endsWith('-') ? words : ` ${words}`;
    } else {
      text += `\n${words}`;
    }
  });
  return text;
}
