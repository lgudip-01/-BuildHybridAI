import type { LedgerEntry, MaskResult } from '@clause-guard/core/types';
import { findOccurrences } from './merge';
import { PLACEHOLDER } from './placeholders';

export type ReviewEdit = { add: string } | { unmask: string };
export type SuccessfulMask = Extract<MaskResult, { ok: true }>;
export type ManualMask = { value: string; placeholder: string };

export class InvalidReviewEdit extends Error {}

/** Work only on ordinary preview text. Existing placeholders are indivisible. */
const tokenParts = new RegExp(`(${PLACEHOLDER.source})`, 'g');
function replaceVisible(text: string, mask: ManualMask): string {
  return text.split(tokenParts).map((part, i) => {
    if (i % 2) return part;
    const matches = findOccurrences(part, mask.value.toLowerCase());
    for (const { start, end } of matches.reverse()) {
      part = part.slice(0, start) + mask.placeholder + part.slice(end);
    }
    return part;
  }).join('');
}

export function editList(current: SuccessfulMask, manual: ManualMask[], edit: ReviewEdit): ManualMask[] {
  if ('unmask' in edit) {
    if (!manual.some(m => m.placeholder === edit.unmask)) {
      throw new InvalidReviewEdit('Only a manually added mask can be removed from the outgoing preview.');
    }
    return manual.filter(m => m.placeholder !== edit.unmask);
  }
  const value = edit.add.trim();
  if (!value || value.includes('[') || value.includes(']')) throw new InvalidReviewEdit('Enter visible text outside a placeholder.');
  const occupied = new Set(current.clauses.flatMap(c => c.text.match(PLACEHOLDER) ?? []));
  let n = 1;
  while (occupied.has(`[PRIVATE_${n}]`)) n++;
  for (const clause of current.clauses) {
    for (const [index, part] of clause.text.split(tokenParts).entries()) {
      if (index % 2) continue;
      const [match] = findOccurrences(part, value.toLowerCase());
      if (match) {
        // Restore the spelling from the document, even if the reviewer typed a different case.
        return [...manual, { value: part.slice(match.start, match.end), placeholder: `[PRIVATE_${n}]` }];
      }
    }
  }
  throw new InvalidReviewEdit('That value was not found as a whole word or phrase in the masked preview.');
}

/** Replay against the original checked preview so undo restores exact spelling at each occurrence. */
export function applyManualMasks(base: SuccessfulMask, manual: ManualMask[]) {
  const ledger: LedgerEntry[] = [...base.ledger];
  const drafts = base.clauses.map(({ id, text }) => ({ id, text: String(text) }));
  for (const mask of manual) {
    const clauseIds: string[] = [];
    for (const clause of drafts) {
      const text = replaceVisible(clause.text, mask);
      if (text !== clause.text) clauseIds.push(clause.id);
      clause.text = text;
    }
    ledger.push({ placeholder: mask.placeholder, kind: 'PRIVATE', clauseIds });
  }
  return { drafts, ledger };
}
