import type { EntityKind, LedgerEntry } from '@clause-guard/core/types';

export const PLACEHOLDER = /\[[A-Z]+_[A-Z0-9]+\]/g;

type Assigned = { placeholder: string; kind: EntityKind; value: string; clauseIds: Set<string> };

/** Hands out one placeholder per distinct value, numbered per kind across the whole contract. */
export class PlaceholderRegistry {
  private readonly byKey = new Map<string, Assigned>();
  private readonly counts = new Map<EntityKind, number>();

  assign(kind: EntityKind, key: string, value: string, clauseId: string): string {
    let entry = this.byKey.get(key);
    if (!entry) {
      const n = (this.counts.get(kind) ?? 0) + 1;
      this.counts.set(kind, n);
      const label = kind === 'PARTY' ? toLetters(n) : String(n);
      entry = { placeholder: `[${kind}_${label}]`, kind, value, clauseIds: new Set() };
      this.byKey.set(key, entry);
    }
    entry.clauseIds.add(clauseId);
    return entry.placeholder;
  }

  /** Placeholder → real value, for the vault. */
  entries(): Record<string, string> {
    return Object.fromEntries([...this.byKey.values()].map((e) => [e.placeholder, e.value]));
  }

  values(): string[] {
    return [...this.byKey.values()].map((e) => e.value);
  }

  ledger(): LedgerEntry[] {
    return [...this.byKey.values()].map(({ placeholder, kind, clauseIds }) => ({
      placeholder,
      kind,
      clauseIds: [...clauseIds],
    }));
  }
}

/** 1 → A, 26 → Z, 27 → AA */
function toLetters(n: number): string {
  let label = '';
  for (let rest = n; rest > 0; rest = Math.floor((rest - 1) / 26)) {
    label = String.fromCharCode(65 + ((rest - 1) % 26)) + label;
  }
  return label;
}
