/// <reference types="vite/client" />
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { AiBridge, Clause } from '@clause-guard/core/types';
import { mask } from './mask';
import { findOccurrences } from './merge';

// Each samples/<name>.txt has a samples/<name>.json:
//   mask               real values that must not reach the cloud, in every form they appear
//   keep               terms the cloud model needs, which must survive masking
//   fallbackMisses     values from `mask` that the pattern-only fallback is known to leave in
//   fallbackOvermasks  values from `keep` that the pattern-only fallback is known to hide
// Remove entries from the two fallback lists as they get fixed; the test fails until you do.
type Expected = { mask: string[]; keep: string[]; fallbackMisses: string[]; fallbackOvermasks: string[] };

const contracts = import.meta.glob<string>('../../../samples/*.txt', { query: '?raw', import: 'default', eager: true });
const expectations = import.meta.glob<Expected>('../../../samples/*.json', { import: 'default', eager: true });

const samples = Object.entries(contracts).map(([path, text]) => {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.txt'.length);
  const expected = expectations[path.replace(/\.txt$/, '.json')];
  if (!expected) throw new Error(`samples/${name}.txt has no samples/${name}.json`);
  return { name, text, expected };
});

const noModel: AiBridge = {
  onDeviceStatus: async () => 'unavailable',
  onDevice: async () => {
    throw new Error('not used');
  },
  analyze: async () => {
    throw new Error('not used');
  },
};

const toClauses = (text: string): Clause[] =>
  text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => ({ id: `c${index + 1}`, index, text: part }));

const appearsIn = (text: string) => (value: string) => findOccurrences(text, value).length > 0;

it('finds the samples', () => {
  expect(samples.length).toBeGreaterThan(0);
});

describe.each(samples)('samples/$name', ({ name, text, expected }) => {
  it('lists only values that are in the contract', () => {
    expect([...expected.mask, ...expected.keep].filter((v) => !appearsIn(text)(v))).toEqual([]);
    expect(expected.fallbackMisses.filter((v) => !expected.mask.includes(v))).toEqual([]);
    expect(expected.fallbackOvermasks.filter((v) => !expected.keep.includes(v))).toEqual([]);
  });

  it('masks everything except the known fallback misses, and keeps the terms', async () => {
    const result = await mask(name, toClauses(text), noModel);
    if (!result.ok) throw new Error(`Blocked by the leak check: ${JSON.stringify(result.leaks)}`);

    const sent = result.clauses.map((c) => c.text).join('\n\n');
    expect.soft(expected.mask.filter(appearsIn(sent)), 'left unmasked').toEqual(expected.fallbackMisses);
    expect.soft(expected.keep.filter((v) => !appearsIn(sent)(v)), 'masked but should stay').toEqual(expected.fallbackOvermasks);
  });
});
