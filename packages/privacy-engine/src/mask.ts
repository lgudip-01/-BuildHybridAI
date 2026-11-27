import type { AiBridge, Clause, ClauseType, MaskResult } from '@clause-guard/core/types';
import { ApprovalError, isCurrent, seal, startRun, type Run, type ChatMaskSnapshot } from './approval';
import { leakCheck } from './leakCheck';
import { dedupeEntities, findOccurrences, normalize, resolveOverlaps, separateCoordinatedNames, toEntity, type Candidate, type Entity } from './merge';
import { readClause } from './onDevice';
import { PlaceholderRegistry } from './placeholders';
import { findDefinedTerms, findNames, findPatterns, isGeneric, looksLikePersonName, type Span } from './regex';
import { loadVault, saveVault } from './vault';
import { chatSnapshot } from './chatSnapshot';
import { applyManualMasks, editList, type ManualMask, type ReviewEdit, type SuccessfulMask } from './manualReview';

// Non-identifying roles remain readable. Other explicit aliases that are also
// generic vocabulary need clarification; silently ignoring them could leak an
// acronym, while replacing every ordinary use could change the clause meaning.
const ROLE_ALIAS = /^(?:the\s+)?(?:company|client|customer|contractor|consultant|vendor|supplier|provider|licensor|licensee|employer|employee|buyer|seller|landlord|tenants?|lessor|lessee|disclosing party|receiving party|recipient|discloser|borrower|lender|guarantor|holder|debtor|creditor|premises|part(?:y|ies))$/i;

/**
 * Masks every clause of one document and leak-checks the result.
 * On success the placeholder map is saved, encrypted, under `docId` for `unmask`,
 * and each clause carries its type when the on-device model could classify it.
 * Use one `docId` per document: each call makes every earlier result and approval for it stale.
 * The result is frozen; pass it to approve() unchanged.
 * During model reads, reports how many clause reads have finished (including failed reads).
 * The final count precedes the document-wide privacy checks.
 */
export async function mask(
  docId: string, clauses: Clause[], bridge: AiBridge, onReadProgress?: (finished: number) => void,
): Promise<MaskResult> {
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
  const ruleNames: Entity[] = [];
  const rulePatterns: Span[] = [];
  const byModel: Entity[] = [];
  const types: (ClauseType | undefined)[] = [];
  if (useModel) onReadProgress?.(0);
  for (const clause of clauses) {
    const names = findNames(clause.text, true);
    const named = names.map(spanToEntity);
    found.push(...named);
    ruleNames.push(...named);
    rulePatterns.push(...findPatterns(clause.text));
    if (!useModel) continue;
    try {
      const reading = await readClause(bridge, clause);
      found.push(...reading.entities);
      byModel.push(...reading.entities);
      types.push(reading.type);
    } catch {
      needsReview = true;
      types.push(undefined);
    }
    onReadProgress?.(types.length);
  }
  // Complete rule-derived short forms before checking coverage. The same entity
  // objects are in ruleNames and found, so only aliases of a rule-matched name
  // count here; aliases of a model-only name still require review.
  // An explicit adjacent definition can also introduce a non-prefix alias,
  // e.g. Acme Holdings LLC ("AH"). Bind it to that actual name occurrence,
  // never to an unrelated quoted term elsewhere in the document.
  const explicitAliases: { name: string; alias: string; clauseId: string }[] = [];
  for (const entity of found) {
    for (const clause of clauses) {
      for (const occurrence of findOccurrences(clause.text, entity.value)) {
        const alias = /^\s*\(\s*(?:the\s+)?["“]([^"”\n]{2,60})["”]\s*\)/.exec(clause.text.slice(occurrence.end))?.[1]?.trim();
        if (alias && isGeneric(alias) && !ROLE_ALIAS.test(alias)) {
          return seal({ ok: false, docId, leaks: [{ clauseId: clause.id, snippet: alias,
            reason: 'An explicit name alias is also ordinary contract vocabulary. Clarify the alias before analysis.' }] }, run);
        }
        if (alias && !isGeneric(alias)) {
          entity.variants.push(alias);
          explicitAliases.push({ name: entity.value, alias, clauseId: clause.id });
        }
      }
    }
  }
  for (const term of clauses.flatMap((c) => findDefinedTerms(c.text))) {
    found.find((e) => normalize(e.value).startsWith(`${normalize(term)} `))?.variants.push(term);
  }
  // A name only the model saw, such as "Globex" or "maria lopez", is of a kind the rules can't find.
  // It is masked, but the same kind elsewhere is masked only if the model saw it there too, so a person checks.
  needsReview ||= byModel.some(entity => {
    const value = words(entity.value);
    // Actual rule-derived name aliases are masked globally. Incidental words
    // inside emails/URLs are not name aliases. A complete pattern match is safe
    // even when the model labels that complete email/domain as an organization.
    const named = ruleNames.some(rule => rule.variants.some(variant => words(variant) === value));
    const completePattern = rulePatterns.some(rule => words(rule.value) === value);
    // Preserve coverage of a partial street address already inside a full
    // rule-matched address, without extending it to model-only people/companies.
    const address = entity.kind === 'ADDRESS' && [...ruleNames, ...rulePatterns]
      .some(rule => rule.kind === 'ADDRESS' && words(rule.value).includes(value));
    return !(named || completePattern || address);
  });
  const coordinated = separateCoordinatedNames(found);
  if (coordinated.ambiguousOrganizations.length) {
    return seal({ ok: false, docId, leaks: clauses.flatMap(clause =>
      coordinated.ambiguousOrganizations.filter(value => findOccurrences(clause.text, value).length > 0)
        .map(value => ({ clauseId: clause.id, snippet: value,
          reason: 'Ambiguous organization and individual names. Clarify the named parties before analysis.' }))),
    }, run);
  }
  needsReview ||= coordinated.needsReview;
  for (const binding of explicitAliases) {
    const owner = coordinated.entities.find(e => normalize(e.value) === normalize(binding.name));
    // Coordination can discard inferred personal short forms. Preserve only
    // the explicit alias of the surviving whole name; never give a group alias
    // to one of several separately identified people.
    if (!owner) return seal({ ok: false, docId, leaks: [{ clauseId: binding.clauseId, snippet: binding.alias,
      reason: 'An explicit alias names an ambiguous group. Clarify the named parties before analysis.' }] }, run);
    owner.variants.push(binding.alias);
  }
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

  const sensitive = [...registry.values(), ...entities.flatMap((e) => e.variants)];
  const check = leakCheck(drafts, sensitive);
  if (!check.ok) return seal({ ok: false, docId, leaks: check.leaks }, run);

  await saveVaultInOrder(run, registry.entries());
  const snapshot = chatSnapshot(registry.entries(), coordinated.entities, entities);
  const result = seal<SuccessfulMask>(
    {
      ok: true,
      docId,
      clauses: check.clauses.map((clause, i) => (types[i] ? { ...clause, type: types[i] } : clause)),
      ledger: registry.ledger(),
      needsReview,
    },
    run,
    snapshot,
  );
  reviews.set(result, { run, base: result, sensitive, manual: [], snapshot });
  return result;
}

type ReviewState = { run: Run; base: SuccessfulMask; sensitive: string[]; manual: ManualMask[]; snapshot: ChatMaskSnapshot };
const reviews = new WeakMap<SuccessfulMask, ReviewState>();

function currentReview(result: SuccessfulMask): ReviewState {
  const state = reviews.get(result);
  if (!state) throw new ApprovalError('not_approved', 'A genuine masked preview is required.');
  if (!isCurrent(state.run)) throw new ApprovalError('stale', 'Mask the current document again.');
  return state;
}

/** Local inspection only. Never substitute the revealed value into an approved batch. */
export async function revealReviewValue(result: SuccessfulMask, placeholder: string): Promise<string> {
  currentReview(result);
  if (!result.ledger.some(entry => entry.placeholder === placeholder)) throw new Error('Unknown placeholder.');
  const entries = await loadVault(result.docId);
  currentReview(result);
  if (!entries || !Object.hasOwn(entries, placeholder)) throw new Error('Saved value unavailable.');
  return entries[placeholder]!;
}

/** Revise a genuine preview locally, without another inference call or reusing its approval. */
export async function reviseMask(result: SuccessfulMask, edit: ReviewEdit): Promise<MaskResult> {
  const { base, sensitive, manual, snapshot } = currentReview(result);
  const next = editList(result, manual, edit);
  const run = startRun(result.docId);
  const { drafts, ledger } = applyManualMasks(base, next);
  const checked = leakCheck(drafts, [...sensitive, ...next.map(m => m.value)]);
  if (!checked.ok) return seal({ ok: false, docId: result.docId, leaks: checked.leaks }, run);
  const entries = await loadVault(run.docId);
  if (!isCurrent(run)) throw new ApprovalError('stale', 'Mask the current document again.');
  if (!entries) throw new Error('Saved values unavailable.');
  for (const m of manual) delete entries[m.placeholder];
  for (const m of next) entries[m.placeholder] = m.value;
  await saveVaultInOrder(run, entries);
  if (!isCurrent(run)) throw new ApprovalError('stale', 'Mask the current document again.');
  // A revised document is a fresh run: preserve automatic aliases and add manual
  // values to its RAM-only chat snapshot, without exposing the vault in the batch.
  const revisedSnapshot = chatSnapshot(entries, [], []);
  const aliases = new Map(snapshot.aliases.map(a => [normalize(a.value), a]));
  for (const alias of revisedSnapshot.aliases) {
    const previous = aliases.get(normalize(alias.value));
    aliases.set(normalize(alias.value), previous ? {
      ...alias, tokens: [...new Set([...previous.tokens, ...alias.tokens])],
      ...(previous.uncertain && { uncertain: true }),
    } : alias);
  }
  const updated = seal<SuccessfulMask>({
    ...base, manuallyEdited: true, ledger,
    clauses: checked.clauses.map((clause, i) => ({ ...base.clauses[i]!, text: clause.text })),
  }, run, { entries: revisedSnapshot.entries, aliases: [...aliases.values()] });
  reviews.set(updated, { run, base, sensitive, manual: next, snapshot });
  return updated;
}

/** Only current runs may enqueue a save. The vault orders it with same-document saves and deletions. */
async function saveVaultInOrder(run: Run, entries: Record<string, string>): Promise<void> {
  if (isCurrent(run)) await saveVault(run.docId, entries);
}

/** " 77 willow lane " for "77 Willow Lane,": lowercase words between spaces, so one value can be found inside another. */
function words(value: string): string {
  return ` ${value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
}

// A capitalized phrase shaped like "Jane Smith" also gets the person's last and first names as variants,
// so "Smith's" or "Jane" on its own is masked with it.
function spanToEntity(span: Span): Entity {
  const person = span.kind === 'PERSON' || (span.kind === 'NAME' && looksLikePersonName(span.value));
  const base = person ? 'person' : span.kind === 'ORG' ? 'org' : 'other';
  return toEntity(span.kind, span.value, base);
}

function entityCandidates(text: string, entity: Entity): Candidate[] {
  const key = `entity:${normalize(entity.value)}`;
  return entity.variants.flatMap((variant) =>
    findOccurrences(text, variant).map((o) => ({ ...o, value: entity.value, kind: entity.kind, key, source: 'entity' as const })),
  );
}
