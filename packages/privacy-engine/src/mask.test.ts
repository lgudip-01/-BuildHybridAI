import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import type { AiBridge, Analysis, Clause, OnDeviceStatus } from '@clause-guard/core/types';
import { leakCheck } from './leakCheck';
import { mask } from './mask';
import { classify, readClause } from './onDevice';
import { unmask } from './unmask';

type ModelEntity = { text: string; kind: string; party: boolean };

// Stands in for the on-device model: reports each known entity that appears in the prompt, and the clause type.
function fakeBridge(
  known: ModelEntity[],
  options: { status?: OnDeviceStatus; answer?: string; type?: string } = {},
): AiBridge {
  return {
    onDeviceStatus: async () => options.status ?? 'available',
    onDevice: async (prompt) => {
      if (options.answer !== undefined) return options.answer;
      if (prompt.startsWith('Classify')) return '{"type": "payment"}';
      return JSON.stringify({ type: options.type ?? 'payment', entities: known.filter((e) => prompt.includes(e.text)) });
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
  it('preserves the full pronoun set from merged PR #26 without excluding compound organization names', async () => {
    const pronouns = ['I', 'Me', 'My', 'Mine', 'We', 'Us', 'Our', 'Ours', 'You', 'Your', 'Yours',
      'He', 'Him', 'His', 'She', 'Her', 'Hers', 'They', 'Them', 'Their', 'Theirs', 'It', 'Its', 'Yourself', 'Yourselves'];
    const texts = pronouns.map(word => `${word} may review this agreement.`);
    texts.push('Us Foods LLC pays Dr. Anika Bose.');
    const result = await mask('merged-pronouns', texts.map((text, index) => ({id:`c${index + 1}`, index, text})),
      fakeBridge([...pronouns.map(text => ({text, kind:'person', party:true})),
        {text:'Us Foods LLC', kind:'organization', party:true}, {text:'Dr. Anika Bose', kind:'person', party:true}]));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));
    expect(result.clauses.slice(0, pronouns.length).map(c => c.text)).toEqual(texts.slice(0, pronouns.length));
    expect(result.clauses.at(-1)!.text).not.toMatch(/Foods|Anika|Bose/);
  });

  describe('coordinated tenants (#22)', () => {
    // Same fixture/acceptance as Likhil's merged PR #27; retain our additional
    // explicit-organization and ambiguous-collision checks below.
    it.each(['patterns', 'model'] as const)('matches merged #27 preamble, alias and signature behavior with %s', async source => {
      const texts = [
        'This Lease is made on January 15, 2026 between Margaret O\'Connell ("Landlord") and Wei Zhang and Lucia Fernandez ("Tenants").',
        "5. Maintenance. Tenants must report needed repairs promptly. Ms. O'Connell can be reached at (503) 555-0187.",
        "Landlord: Margaret O'Connell\nTenant: Wei Zhang\nTenant: Lucia Fernandez",
      ];
      const docId = `merged-coordinated-${source}`;
      const result = await mask(docId, texts.map((text, index) => ({id:`c${index + 1}`, index, text})), fakeBridge([
        {text:"Margaret O'Connell", kind:'person', party:true}, {text:'Wei Zhang', kind:'person', party:true},
        {text:'Lucia Fernandez', kind:'person', party:true}, {text:"Ms. O'Connell", kind:'person', party:true},
      ], {status:source === 'patterns' ? 'unavailable' : 'available'}));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      const [landlord, wei, lucia] = result.clauses[2]!.text.match(/\[[A-Z]+_[A-Z0-9]+\]/g)!;
      expect(new Set([landlord, wei, lucia]).size).toBe(3);
      expect(result.clauses[0]!.text).toContain(`between ${landlord} ("Landlord") and ${wei} and ${lucia} ("Tenants").`);
      expect(result.clauses[1]!.text).toContain(`${landlord} can be reached`);
      const restored = await unmask(docId, result.clauses.map(c => ({clauseId:c.id, risk:'low', explanation:c.text, redline:'', questions:[]})));
      expect(restored[0]!.explanation).toBe(texts[0]);
      expect(restored[2]!.explanation).toBe(texts[2]);
    });
    const texts = [
      'This Lease is between Margaret O\'Connell ("Landlord") and Wei Zhang and Lucia Fernandez ("Tenants").',
      "Landlord: Margaret O'Connell\nTenant: Wei Zhang\nTenant: Lucia Fernandez",
    ];
    it.each(['patterns', 'model'] as const)('keeps individual identities across preamble/signatures with %s', async source => {
      const docId = `coordinated-${source}`;
      const result = await mask(docId, texts.map((text, index) => ({ id: `c${index + 1}`, index, text })),
        fakeBridge([
          { text: "Margaret O'Connell", kind: 'person', party: true },
          { text: 'Wei Zhang and Lucia Fernandez', kind: 'person', party: true },
          { text: 'Wei Zhang', kind: 'person', party: true },
          { text: 'Lucia Fernandez', kind: 'person', party: true },
        ], { status: source === 'patterns' ? 'unavailable' : 'available' }));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      const tokens = result.clauses[1]!.text.match(/\[[A-Z]+_[A-Z0-9]+\]/g)!;
      expect(new Set(tokens).size).toBe(3);
      expect(result.clauses[0]!.text).toBe(`This Lease is between ${tokens[0]} ("Landlord") and ${tokens[1]} and ${tokens[2]} ("Tenants").`);
      const restored = await unmask(docId, result.clauses.map(clause => ({
        clauseId: clause.id, risk: 'low', explanation: clause.text, redline: '', questions: [],
      })));
      expect(restored.map(answer => answer.explanation)).toEqual(texts);
    });
    it('keeps an organization containing and intact alongside separate people', async () => {
      const texts = ['Baker and McKenzie LLP employs Wei Zhang and Lucia Fernandez.',
        'Name: Wei Zhang\nName: Lucia Fernandez'];
      const result = await mask('coordinated-organization', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })),
        fakeBridge([{ text: 'Baker and McKenzie LLP', kind: 'organization', party: true }]));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      expect(result.clauses[0]!.text).toMatch(/^\[[A-Z]+_[A-Z0-9]+\] employs /);
      const restored = await unmask('coordinated-organization', result.clauses.map(clause => ({
        clauseId: clause.id, risk: 'low', explanation: clause.text, redline: '', questions: [],
      })));
      expect(restored.map(answer => answer.explanation)).toEqual(texts);
    });
    it.each(['patterns', 'model'] as const)('blocks ambiguous organization/person names with %s', async source => {
      const texts = ['Wei Zhang and Lucia Fernandez LLC employs Wei Zhang and Lucia Fernandez.',
        'Name: Wei Zhang\nName: Lucia Fernandez'];
      const result = await mask(`organization-collision-${source}`, texts.map((text, index) => ({ id: `c${index + 1}`, index, text })),
        fakeBridge([{ text: 'Wei Zhang and Lucia Fernandez LLC', kind: 'organization', party: true }],
          { status: source === 'patterns' ? 'unavailable' : 'available' }));
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error('Ambiguous identities must not be approved.');
      expect(result.leaks).toContainEqual(expect.objectContaining({ clauseId: 'c1', reason: expect.stringContaining('Ambiguous organization') }));
    });
    it('requires review for an uncorroborated coordinated span instead of guessing identities', async () => {
      const result = await mask('coordinated-ambiguous', [{ id: 'c1', index: 0,
        text: 'Wei Zhang and Lucia Fernandez agree.' }], fakeBridge([
          { text: 'Wei Zhang and Lucia Fernandez', kind: 'person', party: true },
        ]));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      expect(result.needsReview).toBe(true);
      expect(result.clauses[0]!.text).not.toMatch(/Wei|Zhang|Lucia|Fernandez/);
    });
    it.each(['patterns', 'model'] as const)('does not resolve a titled person to a company short name with %s', async source => {
      const texts = ['Jordan Ltd. supplies parts.', 'Signed by Mr. Jordan for himself.'];
      const docId = `company-title-alias-${source}`;
      const result = await mask(docId, texts.map((text, index) => ({id:`c${index + 1}`, index, text})),
        fakeBridge([
          {text:'Jordan Ltd.', kind:'organization', party:false},
          {text:'Mr. Jordan', kind:'person', party:false},
        ], {status:source === 'patterns' ? 'unavailable' : 'available'}));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      expect(result.clauses.map(clause => clause.text)).toEqual([
        '[ORG_1] supplies parts.', 'Signed by [PERSON_1] for himself.',
      ]);
      const restored = await unmask(docId, result.clauses.map(clause => ({
        clauseId:clause.id, risk:'low', explanation:clause.text, redline:'', questions:[],
      })));
      expect(restored.map(clause => clause.explanation)).toEqual(texts);
    });
    it('reuses a unique full-person identity for the titled surname reported by the model', async () => {
      const texts = ["Margaret O'Connell agrees.", "Ms. O'Connell handles repairs."];
      const result = await mask('landlord-title-alias', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })),
        fakeBridge([
          { text: "Margaret O'Connell", kind: 'person', party: true },
          { text: "Ms. O'Connell", kind: 'person', party: false },
        ]));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      const landlord = result.clauses[0]!.text.match(/\[[A-Z]+_[A-Z0-9]+\]/)![0];
      expect(result.clauses[1]!.text).toBe(`${landlord} handles repairs.`);
    });
  });

  it('keeps offer-letter pronouns when the model incorrectly reports Your as a party (#23)', async () => {
    const texts = [
      'Dear Samuel Osei, your manager is Dr. Anika Bose.',
      'Your start date is April 6, 2026.',
      'Your base salary is $148,000 per year.',
      'Your employment is at will.',
      'Yuri Petrov will contact Samuel Osei.',
    ];
    const result = await mask('offer-pronoun-regression',
      texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([
        { text: 'Your', kind: 'person', party: true },
        { text: 'Samuel Osei', kind: 'person', party: true },
        { text: 'Dr. Anika Bose', kind: 'person', party: false },
        { text: 'Yuri Petrov', kind: 'person', party: false },
      ]));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));
    const masked = result.clauses.map(clause => clause.text);
    expect(masked.slice(1, 4)).toEqual([
      'Your start date is [DATE_1].',
      'Your base salary is [AMOUNT_1] per year.',
      'Your employment is at will.',
    ]);
    expect(masked[0]).toContain('your manager');
    for (const name of ['Samuel', 'Osei', 'Anika', 'Bose', 'Yuri', 'Petrov']) {
      expect(masked.join(' ')).not.toContain(name);
    }
    const restored = await unmask('offer-pronoun-regression', result.clauses.map(clause => ({
      clauseId: clause.id, risk: 'low', explanation: clause.text, redline: '', questions: [],
    })));
    expect(restored.slice(1, 4).map(answer => answer.explanation)).toEqual(texts.slice(1, 4));
  });

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
    expect(result.clauses.map((c) => c.type)).toEqual([undefined, undefined]);
  });

  it('still masks names the on-device model misses', async () => {
    const texts = ['The landlord rents the unit to Wei Zhang and Lucia Fernandez.', 'Coastal Ridge Lending holds the deposit.'];
    const result = await mask('doc-9', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([]));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    // An uncorroborated coordinated span is held for review rather than guessed.
    expect(result.needsReview).toBe(true);
    const sent = result.clauses.map((c) => c.text).join(' ');
    for (const name of ['Wei Zhang', 'Lucia Fernandez', 'Coastal Ridge']) expect(sent).not.toContain(name);
    expect(sent).toContain('The landlord rents the unit to');
  });

  it('masks a last name used on its own, as in "Smith\'s", without a model', async () => {
    const texts = ["Smith's obligations end when Jane Smith resigns.", 'Notices go to Smith by email.'];
    const result = await mask('doc-possessive', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([], { status: 'unavailable' }));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    const [smith, jane] = [result.clauses[0]!.text, result.clauses[1]!.text];
    expect(`${smith} ${jane}`).not.toContain('Smith');
    expect(smith).toMatch(/^\[NAME_1\]'s obligations end when \[NAME_1\] resigns\.$/);
  });

  it('asks for review when the model finds a name the patterns could not see', async () => {
    const texts = ['Globex shall indemnify Initech.', 'Payment is due on receipt.'];
    const result = await mask('doc-model-only', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([
      { text: 'Globex', kind: 'organization', party: true },
      { text: 'Initech', kind: 'organization', party: true },
    ]));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    expect(result.clauses[0]!.text).toBe('[PARTY_A] shall indemnify [PARTY_B].');
    expect(result.needsReview).toBe(true);
  });

  it('labels each masked clause with the type the on-device model gives it, in one call per clause', async () => {
    const working = fakeBridge(model);
    const prompts: string[] = [];
    const bridge: AiBridge = {
      ...working,
      onDevice: (prompt, schema) => {
        prompts.push(prompt);
        return working.onDevice(prompt, schema);
      },
    };
    const result = await mask('doc-7', clauses, bridge);
    if (!result.ok) throw new Error('blocked');
    expect(result.clauses.map((c) => c.type)).toEqual(['payment', 'payment']);
    expect(prompts).toHaveLength(clauses.length);
  });

  it('still masks, without types, when the model gives no valid type', async () => {
    const result = await mask('doc-8', clauses, fakeBridge(model, { type: 'banana' }));
    if (!result.ok) throw new Error('blocked');

    expect(result.needsReview).toBe(false);
    expect(result.clauses[0]!.text).toContain('[PARTY_A]');
    expect(result.clauses.map((c) => c.type)).toEqual([undefined, undefined]);
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

  it('leaves "Your" alone when the model reports it as a name, and still masks real names (#23)', async () => {
    const texts = [
      'Quillfeather Software Corp. is pleased to offer you the position, reporting to Dr. Anika Bose. Your start date is April 6, 2026.',
      '1. Compensation. Your base salary is $148,000 per year.',
      '5. At-Will Employment. Your employment is at will. You may resign at any time.',
    ];
    const model = [
      { text: 'Your', kind: 'person', party: true },
      { text: 'You', kind: 'person', party: true },
      { text: 'Quillfeather Software Corp.', kind: 'organization', party: true },
      { text: 'Dr. Anika Bose', kind: 'person', party: true },
    ];
    const result = await mask('doc-14', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge(model));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    const [first, second, third] = result.clauses.map((c) => c.text);
    expect(first).toContain('Your start date is [DATE_1].');
    expect(second).toContain('Your base salary is');
    expect(third).toContain('Your employment is at will. You may resign');
    expect(first).not.toMatch(/Quillfeather|Anika|Bose/);
  });

  describe('"Exhibit A. Adebayo" (#20)', () => {
    const texts = [
      'This agreement is between Larkspur Media Group Ltd ("Client") and Okonkwo Adebayo ("Contractor").',
      '1. Services. Contractor will build the app as described in Exhibit A. Adebayo will report to Hannah Kowalczyk, Head of Product.',
      'CONTRACTOR\nBy: Okonkwo Adebayo',
    ];
    const contract = texts.map((text, index) => ({ id: `c${index + 1}`, index, text }));

    const expectKeptReference = (result: Awaited<ReturnType<typeof mask>>) => {
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      const contractor = result.clauses[2]!.text.replace('CONTRACTOR\nBy: ', '');
      expect(result.clauses[1]!.text).toMatch(/^1\. Services\. Contractor will build the app as described in Exhibit A\. /);
      expect(result.clauses[1]!.text).toContain(`Exhibit A. ${contractor} will report to`);
      expect(result.clauses[0]!.text).toContain(`and ${contractor} ("Contractor")`);
    };

    it('keeps the reference and the sentence end, and gives Adebayo the contractor placeholder, without the model', async () => {
      expectKeptReference(await mask('doc-12', contract, fakeBridge([], { status: 'unavailable' })));
    });

    it('does the same when the model reports the reference as part of the name', async () => {
      const model = [
        { text: 'Okonkwo Adebayo', kind: 'person', party: true },
        { text: 'Exhibit A. Adebayo', kind: 'person', party: false },
        { text: 'A. Adebayo', kind: 'person', party: false },
      ];
      expectKeptReference(await mask('doc-13', contract, fakeBridge(model)));
    });
  });

  describe('co-tenants named together and apart (#22)', () => {
    const texts = [
      'This Lease is made on January 15, 2026 between Margaret O\'Connell ("Landlord") and Wei Zhang and Lucia Fernandez ("Tenants").',
      '5. Maintenance. Tenants must report needed repairs promptly. Ms. O\'Connell can be reached at (503) 555-0187.',
      'Landlord: Margaret O\'Connell\nTenant: Wei Zhang\nTenant: Lucia Fernandez',
    ];
    const contract = texts.map((text, index) => ({ id: `c${index + 1}`, index, text }));

    async function expectEachPersonOwnPlaceholder(docId: string, bridge: AiBridge) {
      const result = await mask(docId, contract, bridge);
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      const [preamble, maintenance, signatures] = result.clauses.map((c) => c.text);
      const [landlord, wei, lucia] = signatures!.match(/\[[A-Z]+_[A-Z0-9]+\]/g)!;

      expect(new Set([landlord, wei, lucia]).size).toBe(3);
      expect(preamble).toContain(`between ${landlord} ("Landlord") and ${wei} and ${lucia} ("Tenants").`);
      expect(maintenance).toContain(`${landlord} can be reached`);

      // Restoring the preamble gives back each tenant exactly once.
      const [restored] = await unmask(docId, [
        { clauseId: 'c1', risk: 'low', explanation: preamble!, redline: '', questions: [] },
      ]);
      expect(restored!.explanation).toBe(texts[0]);
    }

    it('without the model', async () => {
      await expectEachPersonOwnPlaceholder('doc-15', fakeBridge([], { status: 'unavailable' }));
    });

    it('with the model reporting each person', async () => {
      const people = [
        { text: "Margaret O'Connell", kind: 'person', party: true },
        { text: 'Wei Zhang', kind: 'person', party: true },
        { text: 'Lucia Fernandez', kind: 'person', party: true },
        { text: "Ms. O'Connell", kind: 'person', party: true },
      ];
      await expectEachPersonOwnPlaceholder('doc-16', fakeBridge(people));
    });

    it('keeps a company name that contains "and" whole', async () => {
      const text = 'Payments go to Barnes and Noble Booksellers LLC ("Supplier") and to Wei Zhang.';
      const result = await mask('doc-17', [{ id: 'c1', index: 0, text }], fakeBridge([], { status: 'unavailable' }));
      if (!result.ok) throw new Error(JSON.stringify(result.leaks));
      expect(result.clauses[0]!.text).toMatch(/^Payments go to \[[A-Z]+_[A-Z0-9]+\] \("Supplier"\) and to \[[A-Z]+_[A-Z0-9]+\]\.$/);
    });
  });

  it('gives a company written short, or after "For" in a signature block, the placeholder of its full name', async () => {
    const texts = [
      'Payments go to Coastal Ridge Credit Union ("Lender") and Halcyon Cloud Systems GmbH ("Provider").',
      'The account is held at Coastal Ridge.',
      'For Halcyon Cloud Systems GmbH: Stefan Brandt',
    ];
    const result = await mask('doc-10', texts.map((text, index) => ({ id: `c${index + 1}`, index, text })), fakeBridge([], { status: 'unavailable' }));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    const [first, second, third] = result.clauses.map((c) => c.text);
    const [lender, provider] = first!.match(/\[[A-Z]+_\d+\]/g)!;
    expect(second).toBe(`The account is held at ${lender}.`);
    expect(third).toContain(`For ${provider}:`);
  });

  it('gives a last name two people share a placeholder of its own', async () => {
    const text = 'Rafael Mendoza borrows the money and Isabel Mendoza guarantees it. Rafael pays monthly, and Mendoza pays the costs.';
    const people = [
      { text: 'Rafael Mendoza', kind: 'person', party: false },
      { text: 'Isabel Mendoza', kind: 'person', party: false },
    ];
    const result = await mask('doc-11', [{ id: 'c1', index: 0, text }], fakeBridge(people));
    if (!result.ok) throw new Error(JSON.stringify(result.leaks));

    const sent = result.clauses[0]!.text;
    const [rafael, isabel, rafaelAgain, surname] = sent.match(/\[[A-Z]+_\d+\]/g)!;
    expect(sent).not.toMatch(/Mendoza|Rafael|Isabel/);
    expect(rafaelAgain).toBe(rafael);
    expect(new Set([rafael, isabel, surname]).size).toBe(3);
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

describe('readClause', () => {
  it('drops role words, section titles and bare places the model reports', async () => {
    const text = '3. Service Levels. The Tenants, Wei Zhang, rent 2210 Cedar Avenue under the laws of Oregon.';
    const bridge = fakeBridge([
      { text: 'Service Levels', kind: 'organization', party: false },
      { text: 'Tenants', kind: 'organization', party: true },
      { text: 'Oregon', kind: 'address', party: false },
      { text: 'Wei Zhang', kind: 'person', party: true },
      { text: '2210 Cedar Avenue', kind: 'address', party: false },
    ]);
    const reading = await readClause(bridge, { id: 'c1', index: 0, text });
    expect(reading.entities.map((e) => e.value)).toEqual(['Wei Zhang', '2210 Cedar Avenue']);
    expect(reading.type).toBe('payment');
  });

  it('drops places of law the model reports as organizations', async () => {
    const text = 'Halcyon Cloud, a Delaware corporation, agrees that the laws of the Netherlands apply and the courts of Amsterdam decide.';
    const bridge = fakeBridge([
      { text: 'Halcyon Cloud', kind: 'organization', party: true },
      { text: 'Delaware', kind: 'organization', party: false },
      { text: 'Netherlands', kind: 'organization', party: true },
      { text: 'Amsterdam', kind: 'organization', party: true },
    ]);
    expect((await readClause(bridge, { id: 'c1', index: 0, text })).entities.map((e) => e.value)).toEqual(['Halcyon Cloud']);
  });
});

describe('classify', () => {
  it('returns one type per clause and turns unreadable answers into "other"', async () => {
    expect(await classify(fakeBridge([]), clauses)).toEqual(['payment', 'payment']);
    expect(await classify(fakeBridge([], { answer: 'no idea' }), clauses)).toEqual(['other', 'other']);
  });
});
