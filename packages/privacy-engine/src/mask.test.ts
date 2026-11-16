import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import type { AiBridge, Analysis, Clause, OnDeviceStatus } from '@clause-guard/core/types';
import { leakCheck } from './leakCheck';
import { mask } from './mask';
import { classify } from './onDevice';
import { unmask } from './unmask';

type ModelEntity = { text: string; kind: string; party: boolean };

// Stands in for the on-device model: reports each known entity that appears in the prompt.
function fakeBridge(known: ModelEntity[], options: { status?: OnDeviceStatus; answer?: string } = {}): AiBridge {
  return {
    onDeviceStatus: async () => options.status ?? 'available',
    onDevice: async (prompt) => {
      if (options.answer !== undefined) return options.answer;
      if (prompt.startsWith('Classify')) return '{"type": "payment"}';
      return JSON.stringify({ entities: known.filter((e) => prompt.includes(e.text)) });
    },
    analyze: async () => {
      throw new Error('not used');
    },
  };
}

const clauses: Clause[] = [
  {
    id: 'c1',
    index: 0,
    text: 'This Agreement is made on January 1, 2026 between Acme Corp ("the Company") and Dana Reyes ("Contractor").',
  },
  {
    id: 'c2',
    index: 1,
    text: "Acme's payment of $12,500 is due to Reyes at dana@reyes.dev within 30 days. Acme pays all fees.",
  },
];

const model: ModelEntity[] = [
  { text: 'Acme Corp', kind: 'organization', party: true },
  { text: 'Dana Reyes', kind: 'person', party: true },
  { text: 'the Company', kind: 'organization', party: false },
  { text: 'Globex Industries', kind: 'organization', party: false }, // not in the text
];

const SENSITIVE = ['Acme', 'Dana', 'Reyes', 'January 1, 2026', '$12,500', 'dana@reyes.dev'];

describe('mask', () => {
  it('masks every sensitive detail with placeholders that stay the same across clauses', async () => {
    const result = await mask('doc-1', clauses, fakeBridge(model));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    expect(result.needsReview).toBe(false);
    expect(result.clauses.map((c) => c.text)).toEqual([
      'This Agreement is made on [DATE_1] between [PARTY_A] ("the Company") and [PARTY_B] ("Contractor").',
      "[PARTY_A]'s payment of [AMOUNT_1] is due to [PARTY_B] at [EMAIL_1] within 30 days. [PARTY_A] pays all fees.",
    ]);
    const sent = JSON.stringify(result);
    for (const value of SENSITIVE) expect(sent).not.toContain(value);
  });

  it('keeps the real values out of the ledger and encrypts them at rest', async () => {
    const result = await mask('doc-2', clauses, fakeBridge(model));
    if (!result.ok) throw new Error('blocked');

    expect(result.ledger).toContainEqual({ placeholder: '[PARTY_A]', kind: 'PARTY', clauseIds: ['c1', 'c2'] });
    expect(result.ledger.some((e) => e.placeholder.startsWith('[ORG'))).toBe(false); // Globex was never in the text

    const database = await openDB('clause-guard');
    const stored = await database.get('vaults', 'doc-2');
    database.close();
    const raw = new TextDecoder().decode(stored.data);
    for (const value of SENSITIVE) expect(raw).not.toContain(value);
  });

  it('falls back to patterns and asks for review when there is no on-device model', async () => {
    const result = await mask('doc-3', clauses, fakeBridge([], { status: 'unavailable' }));
    if (!result.ok) throw new Error('blocked');

    expect(result.needsReview).toBe(true);
    expect(result.clauses[0]!.text).toContain('[ORG_1]');
    expect(result.clauses[0]!.text).toContain('[NAME_1]');
  });

  it('gives a defined short form and a first name the placeholder of the full name, but leaves the word "will"', async () => {
    const texts = [
      'This Agreement is between Northwind Analytics, Inc. ("Northwind") and Mr. Will Turner ("Consultant").',
      'Northwind will pay Will within 30 days.',
    ];
    const result = await mask('doc-5', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([], { status: 'unavailable' }));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    expect(result.clauses.map((c) => c.text)).toEqual([
      'This Agreement is between [ORG_1] ("[ORG_1]") and [PERSON_1] ("Consultant").',
      '[ORG_1] will pay [PERSON_1] within 30 days.',
    ]);
  });

  it('falls back the same way when the model answers with garbage', async () => {
    const result = await mask('doc-4', clauses, fakeBridge([], { answer: 'Sure! Here are the names:' }));
    if (!result.ok) throw new Error('blocked');
    expect(result.needsReview).toBe(true);
  });

});

describe('leakCheck', () => {
  it('blocks text that still holds a known value or a pattern match', () => {
    const result = leakCheck([{ id: 'c1', text: '[PARTY_A] pays Dana Reyes at dana@reyes.dev.' }], ['Dana Reyes']);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.leaks.map((l) => l.reason)).toEqual(['Known sensitive value', 'Unmasked email']);
  });

  it('passes text that holds only placeholders', () => {
    const result = leakCheck([{ id: 'c1', text: '[PARTY_A] pays [AMOUNT_1] by [DATE_1].' }], ['Dana Reyes', '$12,500']);
    expect(result.ok).toBe(true);
  });
});

describe('unmask', () => {
  it('restores real values and leaves placeholders it never issued', async () => {
    const result = await mask('doc-6', clauses, fakeBridge(model));
    if (!result.ok) throw new Error('blocked');

    const analysis: Analysis = {
      clauseId: 'c2',
      risk: 'medium',
      explanation: '[PARTY_A] must pay [AMOUNT_1] to [PARTY_B].',
      redline: 'Ask [PARTY_A] to pay within 15 days.',
      questions: ['Can [PARTY_C] be added?'],
    };
    const [restored] = await unmask('doc-6', [analysis]);
    expect(restored).toEqual({
      ...analysis,
      explanation: 'Acme Corp must pay $12,500 to Dana Reyes.',
      redline: 'Ask Acme Corp to pay within 15 days.',
      questions: ['Can [PARTY_C] be added?'],
    });
  });

  it('refuses a document it has no vault for', async () => {
    await expect(unmask('missing', [])).rejects.toThrow('No vault');
  });
});

describe('classify', () => {
  it('returns one type per clause and turns unreadable answers into "other"', async () => {
    expect(await classify(fakeBridge([]), clauses)).toEqual(['payment', 'payment']);
    expect(await classify(fakeBridge([], { answer: 'no idea' }), clauses)).toEqual(['other', 'other']);
  });
});
