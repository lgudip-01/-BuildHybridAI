import type { EntityKind } from '@clause-guard/core/types';
import { isGeneric, stripOrgSuffix, type Span } from './regex';

/** A name or address, plus the other ways it is written in the contract ("Acme Corp" → "Acme"). */
export type Entity = { kind: EntityKind; value: string; variants: string[] };

export type Candidate = Span & { key: string; source: 'pattern' | 'entity' };

const KIND_RANK: Partial<Record<EntityKind, number>> = { PARTY: 3, PERSON: 2, ORG: 2, ADDRESS: 2, NAME: 1 };
const TITLE = /^(?:Mr|Mrs|Ms|Mx|Dr|Prof)\.?\s+/;

export function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function toEntity(kind: EntityKind, value: string, base: 'person' | 'org' | 'other'): Entity {
  const trimmed = value.trim();
  const variants = new Set([trimmed]);
  if (base === 'org') {
    const core = stripOrgSuffix(trimmed);
    if (core.length >= 3 && !isGeneric(core)) variants.add(core);
  }
  if (base === 'person') {
    const name = trimmed.replace(TITLE, '');
    const words = name.split(/\s+/);
    const [first] = words;
    const last = words.at(-1);
    variants.add(name);
    if (words.length > 1 && first && first.length >= 3 && !first.endsWith('.')) variants.add(first);
    if (words.length > 1 && last && last.length >= 3) variants.add(last);
  }
  return { kind, value: trimmed, variants: [...variants] };
}

// Kinds that may be a company. A shorter one that starts a longer one ("Coastal Ridge" in
// "Coastal Ridge Credit Union") is the same company written short.
const COMPANY_KINDS = new Set<EntityKind>(['ORG', 'PARTY', 'NAME']);
// Kinds that may be a person.
const PERSON_KINDS = new Set<EntityKind>(['PERSON', 'PARTY', 'NAME']);
const COORDINATION = /\s+(?:and|&)\s+/i;

/**
 * Merges entities that are the same name, so each gets one placeholder. Longer names claim their variants
 * first, a company written short joins the one longer name it starts, and a titled surname ("Ms. O'Connell")
 * joins the one full name it ends. A variant that two different names offer (the "Mendoza" in "Rafael Mendoza"
 * and "Isabel Mendoza") belongs to neither: it gets a placeholder of its own, so the cloud is never told it is
 * the wrong person. Names joined by "and" ("Wei Zhang and Lucia Fernandez") are dropped when each part is a
 * name of its own, so every person keeps their own placeholder and the "and" stays readable.
 */
export function dedupeEntities(entities: Entity[]): Entity[] {
  const sorted = [...entities]
    .filter((entity) => !isListOfOthers(entity, entities))
    .sort((a, b) => b.value.length - a.value.length);
  const shared = sharedVariants(sorted);
  const merged: Entity[] = [];
  const owner = new Map<string, Entity>();
  const claim = (target: Entity, variant: string) => {
    const key = normalize(variant);
    if (owner.has(key) || shared.has(key)) return;
    owner.set(key, target);
    target.variants.push(variant);
  };
  const join = (target: Entity, entity: Entity) => {
    if ((KIND_RANK[entity.kind] ?? 0) > (KIND_RANK[target.kind] ?? 0)) target.kind = entity.kind;
    entity.variants.forEach((v) => claim(target, v));
  };

  for (const entity of sorted) {
    const key = normalize(entity.value);
    if (shared.has(key)) continue;
    const existing = owner.get(key) ?? companyItStarts(merged, entity) ?? personItEnds(merged, entity);
    if (existing) {
      join(existing, entity);
      continue;
    }
    const fresh: Entity = { kind: entity.kind, value: entity.value, variants: [] };
    entity.variants.forEach((v) => claim(fresh, v));
    merged.push(fresh);
  }
  for (const text of shared.values()) merged.push({ kind: 'NAME', value: text, variants: [text] });
  return merged;
}

/** Variants offered by two or more different names, by normalized form, with the text to mask them by. */
function sharedVariants(entities: Entity[]): Map<string, string> {
  const offers = new Map<string, { text: string; names: Set<string> }>();
  for (const entity of entities) {
    const name = normalize(stripOrgSuffix(entity.value.replace(TITLE, '')));
    for (const variant of entity.variants) {
      const key = normalize(variant);
      if (key === name || key === normalize(entity.value)) continue;
      const offer = offers.get(key) ?? { text: variant, names: new Set<string>() };
      offer.names.add(name);
      offers.set(key, offer);
    }
  }
  return new Map([...offers].filter(([, offer]) => offer.names.size > 1).map(([key, offer]) => [key, offer.text]));
}

/** The one longer company name that `entity` starts, word for word, if there is exactly one. */
function companyItStarts(merged: Entity[], entity: Entity): Entity | undefined {
  if (!COMPANY_KINDS.has(entity.kind)) return undefined;
  const prefix = `${normalize(entity.value)} `;
  const longer = merged.filter((e) => {
    const name = normalize(e.value);
    // "Wei Zhang" doesn't start "Wei Zhang and Lucia Fernandez" the way "Coastal Ridge" starts its full name.
    return COMPANY_KINDS.has(e.kind) && name.startsWith(prefix) && !/^(?:and|&) /.test(name.slice(prefix.length));
  });
  return longer.length === 1 ? longer[0] : undefined;
}

/** For a titled surname such as "Ms. O'Connell", the one full person name ending in that surname, if exactly one. */
function personItEnds(merged: Entity[], entity: Entity): Entity | undefined {
  const title = TITLE.exec(entity.value);
  if (!title) return undefined;
  const surname = normalize(entity.value.slice(title[0].length));
  if (!surname || surname.includes(' ')) return undefined;
  const people = merged.filter((e) => {
    const words = e.value.replace(TITLE, '').trim().split(/\s+/);
    return PERSON_KINDS.has(e.kind) && !COORDINATION.test(e.value) && words.length > 1 && normalize(words.at(-1)!) === surname;
  });
  return people.length === 1 ? people[0] : undefined;
}

/** Whether `entity` is names joined by "and", each of which is also a name of its own elsewhere. */
function isListOfOthers(entity: Entity, entities: Entity[]): boolean {
  const parts = entity.value.split(COORDINATION);
  if (parts.length < 2) return false;
  const others = new Set(entities.filter((e) => e !== entity).flatMap((e) => [e.value, ...e.variants].map(normalize)));
  return parts.every((part) => others.has(normalize(part)));
}

/**
 * Every whole-word, case-insensitive occurrence of `needle`, tolerant of line breaks inside it.
 * A one-word capitalized needle only matches where it is capitalized, so the name "Will" or "Price"
 * still finds "WILL" but leaves "will" and "price" alone.
 */
export function findOccurrences(text: string, needle: string): { start: number; end: number }[] {
  const trimmed = needle.trim();
  if (!trimmed) return [];
  const capitalOnly = !/\s/.test(trimmed) && /^\p{Lu}/u.test(trimmed);
  const pattern = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, 'giu');
  return [...text.matchAll(re)]
    .filter((m) => !capitalOnly || /^\p{Lu}/u.test(m[0]))
    .map((m) => ({ start: m.index, end: m.index + m[0].length }));
}

/** Keeps non-overlapping spans. The longest wins; on a tie, a pattern match beats a name. */
export function resolveOverlaps(candidates: Candidate[]): Candidate[] {
  const bySize = [...candidates].sort(
    (a, b) => b.end - b.start - (a.end - a.start) || Number(a.source === 'entity') - Number(b.source === 'entity'),
  );
  const kept: Candidate[] = [];
  for (const c of bySize) {
    if (!kept.some((k) => c.start < k.end && k.start < c.end)) kept.push(c);
  }
  return kept.sort((a, b) => a.start - b.start);
}
