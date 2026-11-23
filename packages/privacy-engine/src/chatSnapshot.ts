import type { ChatMaskSnapshot } from './approval';
import { normalize, type Entity } from './merge';

/** Conservative street-only prefix; never infer a unit or pick among shared streets. */
export function streetAlias(value: string): string | undefined {
  const match = /^\s*(\d+[\p{L}\d -]*\s+[\p{L}\d .'-]+?\b(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Boulevard|Blvd\.?|Way))(?=\s|,|$)/iu.exec(value);
  return match?.[1]?.trim();
}

/** Called only by real mask() after final registry assignment. No public issuer. */
export function chatSnapshot(entries: Record<string, string>, original: readonly Entity[], merged: readonly Entity[]): ChatMaskSnapshot {
  const aliases = new Map<string, { value: string; tokens: Set<string>; uncertain?: boolean }>();
  const add = (value: string, tokens: readonly string[], uncertain = false) => {
    if (value.trim().length < 2 || (!tokens.length && !uncertain)) return;
    const key = normalize(value), found = aliases.get(key) ?? { value, tokens: new Set<string>() };
    if (uncertain) found.uncertain = true;
    tokens.forEach(token => found.tokens.add(token)); aliases.set(key, found);
  };
  for (const [token, value] of Object.entries(entries)) {
    add(value, [token]);
    if (token.startsWith('[ADDRESS_')) { const street = streetAlias(value); if (street) add(street, [token]); }
  }
  const tokensFor = (entity: Entity): string[] => {
    const owners = merged.filter(owner => normalize(owner.value) === normalize(entity.value) ||
      owner.variants.some(variant => normalize(variant) === normalize(entity.value)));
    return [...new Set(owners.flatMap(owner => Object.entries(entries)
      .filter(([, value]) => normalize(value) === normalize(owner.value)).map(([token]) => token)))];
  };
  // Original variants retain the shared-name ambiguity dedupe intentionally removes.
  for (const entity of [...merged, ...original]) {
    const tokens = tokensFor(entity);
    for (const variant of entity.variants) add(variant, tokens);
  }
  // A generic NAME has no safe person/company classification. Block its short
  // words rather than silently assigning a person or leaving a known fragment raw.
  for (const entity of merged.filter(e => e.kind === 'NAME' && e.base !== 'person' && e.base !== 'org')) {
    const parts = entity.value.split(/\s+/);
    if (parts.length > 1) for (const part of [parts[0]!, parts.at(-1)!]) if (part.length >= 3) add(part, [], true);
  }
  return { entries: { ...entries }, aliases: [...aliases.values()].map(({ value, tokens, uncertain }) =>
    ({ value, tokens: [...tokens], ...(uncertain && { uncertain: true }) })) };
}
