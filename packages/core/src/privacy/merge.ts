import type { EntityKind } from '../types';
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
    const last = words.at(-1);
    variants.add(name);
    if (words.length > 1 && last && last.length >= 3) variants.add(last);
  }
  return { kind, value: trimmed, variants: [...variants] };
}

/**
 * Merges entities that are the same name, so each gets one placeholder.
 * Longer names claim their variants first; a variant two names share
 * (the "Smith" in "John Smith" and "Jane Smith") stays with the first.
 */
export function dedupeEntities(entities: Entity[]): Entity[] {
  const merged: Entity[] = [];
  const owner = new Map<string, Entity>();
  const claim = (target: Entity, variant: string) => {
    const key = normalize(variant);
    if (owner.has(key)) return;
    owner.set(key, target);
    target.variants.push(variant);
  };

  for (const entity of [...entities].sort((a, b) => b.value.length - a.value.length)) {
    const existing = owner.get(normalize(entity.value));
    if (existing) {
      if ((KIND_RANK[entity.kind] ?? 0) > (KIND_RANK[existing.kind] ?? 0)) existing.kind = entity.kind;
      entity.variants.forEach((v) => claim(existing, v));
      continue;
    }
    const fresh: Entity = { kind: entity.kind, value: entity.value, variants: [] };
    entity.variants.forEach((v) => claim(fresh, v));
    merged.push(fresh);
  }
  return merged;
}

/** Every whole-word, case-insensitive occurrence of `needle`, tolerant of line breaks inside it. */
export function findOccurrences(text: string, needle: string): { start: number; end: number }[] {
  const trimmed = needle.trim();
  if (!trimmed) return [];
  const pattern = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, 'giu');
  return [...text.matchAll(re)].map((m) => ({ start: m.index, end: m.index + m[0].length }));
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
