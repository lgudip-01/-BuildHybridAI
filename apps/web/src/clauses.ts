import type { Clause } from '@clause-guard/core/types';

// A numbered top-level heading at the start of a line: "4.", "4)", "Section 4", "ARTICLE IV".
// Not "4.1", which belongs to clause 4.
export const HEADING = /^[^\S\n]*(?:\d{1,2}[.)][^\S\n]|(?:Section|SECTION|Article|ARTICLE)[^\S\n]+(?:\d{1,2}|[IVXLC]{1,6})\b)/;
const BEFORE_HEADING = new RegExp(`\\n(?=${HEADING.source.slice(1)})`);
// Explicit page furniture only. Bare numeric lines may be amounts, years or
// account details, and generic pasted text has no layout evidence to delete them.
const PAGE_NUMBER = /^[^\S\n]*(?:page[^\S\n]+\d{1,4}(?:[^\S\n]+of[^\S\n]+\d{1,4})?|-[^\S\n]*\d{1,4}[^\S\n]*-)[^\S\n]*$/gim;
// A short signature or form line: "Tenant: Wei Zhang", "By: ________", "/s/ Priya Raman".
const FORM_LINE = /^(?!.{101})(?:[^\n:]{1,40}:[^\S\n]*\S|.*_{3,}|\/s\/)/;
// The line naming who signs, above its form lines: "NORTHWIND ANALYTICS, INC.", "CONTRACTOR".
const SIGNER_LINE = /^(?!.{61})[^\p{Ll}\n]*\p{Lu}[^\p{Ll}\n]*$/u;
// A letter's closing, followed by the signer's name and title on their own lines.
const CLOSING = /^(?:Sincerely|Regards|Best regards|Kind regards|Warm regards|Respectfully|Yours (?:truly|sincerely|faithfully)),?$/i;

/**
 * Whether a one-line piece continues the block before it, as the lines of a signature block do in a Word file.
 * `title` is true for the document's first block, whose capitals are a title, not a signer.
 */
function continues(block: string, piece: string, title: boolean): boolean {
  if (piece.includes('\n') || piece.length > 100 || HEADING.test(piece)) return false;
  const first = block.split('\n', 1)[0]!.trim();
  const last = block.slice(block.lastIndexOf('\n') + 1);
  // After "Sincerely," come the signer's name and title; a form line such as "Accepted:" starts the next signer.
  if (CLOSING.test(first) && !FORM_LINE.test(piece)) return true;
  return FORM_LINE.test(piece) && !HEADING.test(last) && (FORM_LINE.test(last) || (!title && SIGNER_LINE.test(last)));
}

/**
 * Splits a contract into clauses: one per paragraph, and one per numbered section where sections run
 * together without a blank line, as PDF and Word exports often do. A signature block whose lines came
 * through as separate paragraphs stays one clause.
 */
export function splitClauses(text: string): Clause[] {
  const pieces = text
    .replace(/\r\n?/g, '\n')
    .replace(PAGE_NUMBER, '')
    .split(/\n[^\S\n]*\n/)
    .flatMap((paragraph) => paragraph.split(BEFORE_HEADING))
    .map((piece) => piece.trim())
    .filter(Boolean);

  const blocks: string[] = [];
  for (const piece of pieces) {
    const previous = blocks.at(-1);
    if (previous !== undefined && continues(previous, piece, blocks.length === 1)) blocks[blocks.length - 1] = `${previous}\n${piece}`;
    else blocks.push(piece);
  }
  return blocks.map((block, index) => ({ id: `c${index + 1}`, index, text: block }));
}
