// Turns the lines a phone's text recognizer found on scanned pages into contract text.
// Recognition runs in the native plugin (Apple Vision on iOS, ML Kit on Android); only text and line boxes reach JS.
import { pageText } from './importDocument';

/** One recognized line. Box coordinates are fractions of the page, from its top-left corner. */
export type ScanLine = { text: string; x: number; y: number; w: number; h: number };
export type ScanPage = { lines: ScanLine[] };

export type ScanErrorCode = 'unavailable' | 'permission' | 'no_text' | 'failed';

export class ScanError extends Error {
  constructor(readonly code: ScanErrorCode, message: string) {
    super(message);
    this.name = 'ScanError';
  }
}

/** Shown with every scanned contract, because a misread value can slip past masking. */
export const SCAN_REVIEW_NOTE =
  'Scanned text can contain reading errors, and a misread name or number may not be masked. Check the highlighted values against the paper copy.';

/** A top-to-top gap of more than this many typical line heights starts a new paragraph. */
const PARAGRAPH_GAP = 1.55;

const valid = (line: ScanLine) =>
  typeof line.text === 'string' && line.text.trim() !== '' && [line.x, line.y, line.w, line.h].every(Number.isFinite) && line.h > 0;

/**
 * Puts one page's lines in reading order: top to bottom, and left to right for pieces the recognizer split
 * from the same printed line. Then rebuilds paragraphs the same way a PDF page is rebuilt.
 */
export function scanPageText(lines: ScanLine[]): string {
  const sorted = lines.filter(valid).sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: ScanLine[][] = [];
  for (const line of sorted) {
    const row = rows.at(-1);
    const centre = line.y + line.h / 2;
    // Same printed line when this piece's middle falls inside the row's first piece.
    if (row && centre > row[0]!.y && centre < row[0]!.y + row[0]!.h) row.push(line);
    else rows.push([line]);
  }
  // Boxes fit the letters, so an all-capitals line ("ACME CORP") is shorter than one with descenders. Spacing is
  // measured top to top against the page's typical line height, so a capitals line after a paragraph still starts
  // a new paragraph.
  const heights = sorted.map((line) => line.h).sort((a, b) => a - b);
  const typical = heights[Math.floor(heights.length / 2)] ?? 0;
  // pageText starts a paragraph after a gap of 1.8 heights, which suits PDF font sizes. Recognized boxes are
  // tighter: on Vision reads of the six samples, lines within a paragraph were at most 1.45 typical heights apart
  // and new paragraphs at least 1.64. Scale so the break falls at 1.55.
  const height = (typical * PARAGRAPH_GAP) / 1.8;
  return pageText(rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    const top = Math.min(...row.map((line) => line.y));
    // pageText expects PDF coordinates, where y grows upward from the page's bottom edge.
    return { str: row.map((line) => line.text.trim()).join(' '), transform: [0, 0, 0, 0, 0, 1 - top], height, hasEOL: true };
  }));
}

// A token of only digits, letter O's and number separators, with at least one digit: "9o", "$12,5oo", "2O26".
const NUMBER_WITH_O = /(?<![\p{L}\d])[\dOo](?:[\dOo,.]*[\dOo])?(?![\p{L}\d])/gu;

/**
 * Recognizers sometimes read a zero as the letter O inside a number ("9o days" in a Vision read of the SaaS sample).
 * A number with a letter in it can slip past the masking patterns, so inside such tokens an O is read as 0.
 * Words are never touched: "No. 5", "O'Connell" and "Oct" have other letters next to the O.
 */
export function fixNumberMisreads(text: string): string {
  return text.replace(NUMBER_WITH_O, (token) => (/\d/.test(token) && /[Oo]/.test(token) ? token.replace(/[Oo]/g, '0') : token));
}

/** All pages, separated by blank lines. Throws `no_text` when nothing readable came back. */
export function scannedText(pages: ScanPage[]): string {
  const text = fixNumberMisreads(pages.map((page) => scanPageText(page.lines ?? [])).filter(Boolean).join('\n\n'));
  if (!text.trim()) throw new ScanError('no_text', 'No text was found in the scan. Try again with the whole page in view and in good light.');
  return text;
}
