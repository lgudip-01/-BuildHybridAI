import type { CleanText, Leak, MaskedClause } from '@clause-guard/core/types';
import { findOccurrences } from './merge';
import { PLACEHOLDER } from './placeholders';
import { findNames, findPatterns } from './regex';

type Range = { start: number; end: number };

export type LeakCheckResult = { ok: true; clauses: MaskedClause[] } | { ok: false; leaks: Leak[] };

/**
 * Last gate before the cloud. Scans masked text again with every pattern, and for every real value
 * that was masked. Any hit blocks the send. This is the only place `CleanText` is created.
 */
export function leakCheck(drafts: { id: string; text: string }[], realValues: string[]): LeakCheckResult {
  const values = [...new Set(realValues.map((v) => v.trim()).filter((v) => v.length >= 2))];
  const leaks: Leak[] = [];

  for (const { id, text } of drafts) {
    const placeholders: Range[] = [...text.matchAll(PLACEHOLDER)].map((m) => ({ start: m.index, end: m.index + m[0].length }));
    const reported: Range[] = [];
    const report = (range: Range, reason: string) => {
      if (overlapsAny(range, placeholders) || overlapsAny(range, reported)) return;
      reported.push(range);
      leaks.push({ clauseId: id, snippet: snippet(text, range), reason });
    };

    for (const value of values) {
      for (const hit of findOccurrences(text, value)) report(hit, 'Known sensitive value');
    }
    for (const span of [...findPatterns(text), ...findNames(text, false)]) {
      report(span, `Unmasked ${span.kind.toLowerCase()}`);
    }
  }

  if (leaks.length > 0) return { ok: false, leaks };
  return { ok: true, clauses: drafts.map(({ id, text }) => ({ id, text: text as CleanText })) };
}

function overlapsAny(range: Range, others: Range[]): boolean {
  return others.some((o) => range.start < o.end && o.start < range.end);
}

function snippet(text: string, { start, end }: Range): string {
  return text.slice(Math.max(0, start - 30), Math.min(text.length, end + 30));
}
