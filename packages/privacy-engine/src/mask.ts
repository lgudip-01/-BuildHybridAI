import type { AiBridge, Clause, ClauseType, MaskResult } from '@clause-guard/core/types';
import { isCurrent, seal, startRun, type Run } from './approval';
import { leakCheck } from './leakCheck';
import { dedupeEntities, findOccurrences, normalize, resolveOverlaps, separateCoordinatedNames, toEntity, type Candidate, type Entity } from './merge';
import { readClause } from './onDevice';
import { PlaceholderRegistry } from './placeholders';
import { findDefinedTerms, findNames, findPatterns, type Span } from './regex';
import { saveVault } from './vault';

/**
 * Masks every clause of one document and leak-checks the result.
 * On success the placeholder map is saved, encrypted, under `docId` for `unmask`,
 * and each clause carries its type when the on-device model could classify it.
 * Use one `docId` per document: each call makes every earlier result and approval for it stale.
 * The result is frozen; pass it to approve() unchanged.
 */
export async function mask(docId: string, clauses: Clause[], bridge: AiBridge): Promise<MaskResult> {
  // Before the first await, so an older batch can't be sent while this run is still masking, even if it fails.
  const run = startRun(docId);
  const ids = clauses.map((c) => c.id);
  if (ids.some((id) => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    throw new TypeError('Every clause needs a unique, non-empty id, so each result maps back to one clause.');
  }

  const useModel = (await bridge.onDeviceStatus()) === 'available';
  let needsReview = !useModel;

  // Names are collected across the whole contract first, so a name the model
  // spots in one clause is also masked in clauses where it missed it.
  // The broad pattern pass runs even with the model, so a name the model misses is still masked.
  // The same on-device call also gives each clause its type, which the cloud uses but masking never needs.
  const found: Entity[] = [];
  const types: (ClauseType | undefined)[] = [];
  for (const clause of clauses) {
    found.push(...findNames(clause.text, true).map(spanToEntity));
    if (!useModel) continue;
    try {
      const reading = await readClause(bridge, clause);
      found.push(...reading.entities);
      types.push(reading.type);
    } catch {
      needsReview = true;
      types.push(undefined);
    }
  }
  // A defined short form, as in Northwind Analytics, Inc. ("Northwind"), is masked like the full name.
  for (const term of clauses.flatMap((c) => findDefinedTerms(c.text))) {
    found.find((e) => normalize(e.value).startsWith(`${normalize(term)} `))?.variants.push(term);
  }
  const coordinated = separateCoordinatedNames(found);
  if (coordinated.ambiguousOrganizations.length) {
    return seal({ ok: false, docId, leaks: clauses.flatMap(clause =>
      coordinated.ambiguousOrganizations.filter(value => findOccurrences(clause.text, value).length > 0)
        .map(value => ({ clauseId: clause.id, snippet: value,
          reason: 'Ambiguous organization and individual names. Clarify the named parties before analysis.' }))),
    }, run);
  }
  needsReview ||= coordinated.needsReview;
  const entities = dedupeEntities(coordinated.entities);

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
  if (!check.ok) return seal({ ok: false, docId, leaks: check.leaks }, run);

  await saveVaultInOrder(run, registry.entries());
  return seal(
    {
      ok: true,
      docId,
      clauses: check.clauses.map((clause, i) => (types[i] ? { ...clause, type: types[i] } : clause)),
      ledger: registry.ledger(),
      needsReview,
    },
    run,
  );
}

/** Only current runs may enqueue a save. The vault orders it with same-document saves and deletions. */
async function saveVaultInOrder(run: Run, entries: Record<string, string>): Promise<void> {
  if (isCurrent(run)) await saveVault(run.docId, entries);
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
