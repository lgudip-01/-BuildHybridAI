import type { AiBridge, Clause, MaskResult } from '@clause-guard/core/types';
import { leakCheck } from './leakCheck';
import { dedupeEntities, findOccurrences, normalize, resolveOverlaps, toEntity, type Candidate, type Entity } from './merge';
import { findEntities } from './onDevice';
import { PlaceholderRegistry } from './placeholders';
import { findDefinedTerms, findNames, findPatterns, type Span } from './regex';
import { saveVault } from './vault';

/**
 * Masks every clause of one document and leak-checks the result.
 * On success the placeholder map is saved, encrypted, under `docId` for `unmask`.
 */
export async function mask(docId: string, clauses: Clause[], bridge: AiBridge): Promise<MaskResult> {
  const useModel = (await bridge.onDeviceStatus()) === 'available';
  let needsReview = !useModel;

  // Names are collected across the whole contract first, so a name the model
  // spots in one clause is also masked in clauses where it missed it.
  const found: Entity[] = [];
  for (const clause of clauses) {
    found.push(...findNames(clause.text, !useModel).map(spanToEntity));
    if (!useModel) continue;
    try {
      found.push(...(await findEntities(bridge, clause.text)));
    } catch {
      needsReview = true;
      found.push(...findNames(clause.text, true).map(spanToEntity));
    }
  }
  // A defined short form, as in Northwind Analytics, Inc. ("Northwind"), is masked like the full name.
  for (const term of clauses.flatMap((c) => findDefinedTerms(c.text))) {
    found.find((e) => normalize(e.value).startsWith(`${normalize(term)} `))?.variants.push(term);
  }
  const entities = dedupeEntities(found);

  const registry = new PlaceholderRegistry();
  const drafts = clauses.map((clause) => {
    const spans = resolveOverlaps([
      ...findPatterns(clause.text).map((s): Candidate => ({ ...s, key: `${s.kind}:${normalize(s.value)}`, source: 'pattern' })),
      ...entities.flatMap((e) => entityCandidates(clause.text, e)),
    ]);
    const placeholders = spans.map((s) => registry.assign(s.kind, s.key, s.value, clause.id));

    let text = clause.text;
    for (let i = spans.length - 1; i >= 0; i--) {
      const span = spans[i]!;
      text = text.slice(0, span.start) + placeholders[i] + text.slice(span.end);
    }
    return { id: clause.id, text };
  });

  const check = leakCheck(drafts, [...registry.values(), ...entities.flatMap((e) => e.variants)]);
  if (!check.ok) return check;

  await saveVault(docId, registry.entries());
  return { ok: true, clauses: check.clauses, ledger: registry.ledger(), needsReview };
}

function spanToEntity(span: Span): Entity {
  const base = span.kind === 'PERSON' ? 'person' : span.kind === 'ORG' ? 'org' : 'other';
  return toEntity(span.kind, span.value, base);
}

function entityCandidates(text: string, entity: Entity): Candidate[] {
  const key = `entity:${normalize(entity.value)}`;
  return entity.variants.flatMap((variant) =>
    findOccurrences(text, variant).map((o) => ({ ...o, value: entity.value, kind: entity.kind, key, source: 'entity' as const })),
  );
}
