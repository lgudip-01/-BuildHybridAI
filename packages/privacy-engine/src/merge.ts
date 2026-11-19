import type { EntityKind } from '@clause-guard/core/types';
import { isGeneric, stripOrgSuffix, type Span } from './regex';

/** A name or address, plus the other ways it is written in the contract ("Acme Corp" → "Acme"). */
export type Entity = { kind: EntityKind; value: string; variants: string[]; base?: 'person' | 'org' | 'other' };

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
  return { kind, value: trimmed, variants: [...variants], base };
}

/** Split a coordinated span only when each name also has independent evidence.
 * Otherwise keep the group opaque, without personal aliases, and ask for review.
 * Explicit organizations (including their short forms) are never split.
 */
export function separateCoordinatedNames(entities: Entity[]): { entities: Entity[]; needsReview: boolean; ambiguousOrganizations: string[] } {
  const isOrganization = (e: Entity) => e.base === 'org' || stripOrgSuffix(e.value) !== e.value;
  const organizations = new Set(entities.filter(isOrganization)
    .flatMap(e => [normalize(e.value), normalize(stripOrgSuffix(e.value))]));
  const independent = new Set(entities.filter(e => !isOrganization(e) && !/\s+(?:and|&)\s+/i.test(e.value))
    .map(e => normalize(e.value.replace(TITLE, ''))));
  // A business literally named for the same independently named people has
  // ambiguous short forms. Block that mapping instead of silently expanding a
  // person's name to the company name during restoration.
  const ambiguousOrganizations = entities.filter(isOrganization).filter(entity => {
    const parts = stripOrgSuffix(entity.value).split(/\s+(?:and|&)\s+/i);
    return parts.length > 1 && parts.every(part => independent.has(normalize(part.replace(TITLE, ''))));
  }).map(entity => entity.value);
  let needsReview = false;
  const separated = entities.flatMap(entity => {
    const parts = entity.value.split(/\s+(?:and|&)\s+/i);
    if (parts.length === 1 || isOrganization(entity) || organizations.has(normalize(entity.value))) return [entity];
    if (parts.every(part => independent.has(normalize(part.replace(TITLE, ''))))) {
      return parts.map(part => toEntity(entity.kind, part, 'person'));
    }
    // Do not guess whether an uncorroborated phrase is people or a business.
    needsReview = true;
    return [{ ...entity, variants: [entity.value] }];
  });
  return { entities: separated, needsReview, ambiguousOrganizations };
}

// Kinds that may be a company. A shorter one that starts a longer one ("Coastal Ridge" in
// "Coastal Ridge Credit Union") is the same company written short.
const COMPANY_KINDS = new Set<EntityKind>(['ORG', 'PARTY', 'NAME']);

/**
 * Merges entities that are the same name, so each gets one placeholder. Longer names claim their variants
 * first, and a company written short joins the one longer name it starts. A variant that two different
 * names offer (the "Mendoza" in "Rafael Mendoza" and "Isabel Mendoza") belongs to neither: it gets a
 * placeholder of its own, so the cloud is never told it is the wrong person.
 */
export function dedupeEntities(entities: Entity[]): Entity[] {
  // Coordinated spans are normalized by separateCoordinatedNames() first;
  // retaining explicit organization evidence avoids splitting legal company names.
  const sorted = [...entities].sort((a, b) => b.value.length - a.value.length);
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
    if (!target.base || target.base === 'other') target.base = entity.base;
    entity.variants.forEach((v) => claim(target, v));
  };

  for (const entity of sorted) {
    const key = normalize(entity.value);
    if (shared.has(key)) continue;
    // A titled person may use the unique surname variant already owned by a
    // full person name. Shared surnames are excluded by sharedVariants().
    const personAlias = entity.base === 'person' && TITLE.test(entity.value)
      ? owner.get(normalize(entity.value.replace(TITLE, ''))) : undefined;
    const existing = owner.get(key) ?? personAlias ?? companyItStarts(merged, entity) ?? personItEnds(merged, entity);
    if (existing) {
      join(existing, entity);
      continue;
    }
    const fresh: Entity = { kind: entity.kind, value: entity.value, variants: [], base: entity.base };
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
  const longer = merged.filter((e) => COMPANY_KINDS.has(e.kind) &&
    // An opaque coordinated group must never become one individual's identity.
    (!/\s+(?:and|&)\s+/i.test(e.value) || e.base === 'org') && normalize(e.value).startsWith(prefix));
  return longer.length === 1 ? longer[0] : undefined;
}

/** Pattern-only names lack person aliases. Match a titled surname to exactly
 * one full candidate, as in Likhil's merged PR #27, excluding known businesses.
 * Shared surnames and coordinated groups never select one person by guessing.
 */
function personItEnds(merged: Entity[], entity: Entity): Entity | undefined {
  const title = TITLE.exec(entity.value);
  if (!title || entity.base === 'org') return;
  const surname = normalize(entity.value.slice(title[0].length));
  if (!surname || surname.includes(' ')) return;
  const people = merged.filter(candidate => {
    if (!['PERSON', 'PARTY', 'NAME'].includes(candidate.kind) || candidate.base === 'org' ||
        stripOrgSuffix(candidate.value) !== candidate.value || /\s+(?:and|&)\s+/i.test(candidate.value)) return false;
    const words = candidate.value.replace(TITLE, '').trim().split(/\s+/);
    return words.length > 1 && normalize(words.at(-1)!) === surname;
  });
  return people.length === 1 ? people[0] : undefined;
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
