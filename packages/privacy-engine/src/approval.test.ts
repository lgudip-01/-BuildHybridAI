import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { AiBridge, ApprovedBatch, Clause, MaskResult } from '@clause-guard/core/types';
import { approve, assertApproved } from './approval';
import { mask } from './mask';
import { loadVault } from './vault';

type Masked = Extract<MaskResult, { ok: true }>;

const unused = async (): Promise<never> => {
  throw new Error('not used');
};
const noModel: AiBridge = { onDeviceStatus: async () => 'unavailable', onDevice: unused, analyze: unused };
// The model ran but found nothing to add, so the patterns alone mask the text and no review is needed.
const quietModel: AiBridge = {
  onDeviceStatus: async () => 'available',
  onDevice: async (prompt) => (prompt.startsWith('Classify') ? '{"type": "other"}' : '{"entities": []}'),
  analyze: unused,
};

const contract = (email: string): Clause[] => [
  { id: 'c1', index: 0, text: `Send notices to ${email} by January 1, 2026.` },
  { id: 'c2', index: 1, text: 'Either party may end this agreement with 30 days notice.' },
];

async function masked(docId: string, bridge: AiBridge = noModel, email = 'dana@example.test'): Promise<Masked> {
  const result = await mask(docId, contract(email), bridge);
  if (!result.ok) throw new Error(`Blocked: ${JSON.stringify(result.leaks)}`);
  return result;
}

const code = (c: string) => expect.objectContaining({ code: c });

describe('approve', () => {
  it('turns a mask() result into a frozen batch that assertApproved accepts', async () => {
    const result = await masked('doc-a1', quietModel);
    expect(result.docId).toBe('doc-a1');
    expect(result.needsReview).toBe(false);

    const batch = approve(result);
    expect(batch.docId).toBe('doc-a1');
    expect(batch.clauses.map((c) => c.text)).toEqual(result.clauses.map((c) => c.text));
    expect(Object.isFrozen(batch) && Object.isFrozen(batch.clauses) && batch.clauses.every(Object.isFrozen)).toBe(true);
    expect(() => assertApproved(batch)).not.toThrow();
  });

  it('requires review when masking ran without the model', async () => {
    const result = await masked('doc-a2');
    expect(result.needsReview).toBe(true);
    expect(() => approve(result)).toThrow(code('review_required'));
    expect(() => approve(result, { reviewed: false })).toThrow(code('review_required'));
    expect(() => assertApproved(approve(result, { reviewed: true }))).not.toThrow();
  });

  it('rejects anything that is not the exact object mask() returned', async () => {
    const result = await masked('doc-a3');
    for (const copy of [structuredClone(result), { ...result }, JSON.parse(JSON.stringify(result)) as Masked]) {
      expect(() => approve(copy, { reviewed: true })).toThrow(code('not_approved'));
    }
  });

  it('cannot be tricked by changing the result after masking', async () => {
    const result = await masked('doc-a4');
    expect(() => {
      (result as { needsReview: boolean }).needsReview = false;
    }).toThrow(TypeError);
    expect(() => {
      (result.clauses[0] as { text: string }).text = 'Send notices to dana@example.test';
    }).toThrow(TypeError);
    expect(() => (result.clauses as unknown[]).push({ id: 'c3', text: 'raw' })).toThrow(TypeError);
    expect(() => approve(result)).toThrow(code('review_required'));
    expect(approve(result, { reviewed: true }).clauses[0]!.text).not.toContain('dana@example.test');
  });
});

describe('assertApproved', () => {
  it('rejects a batch built by hand or copied', async () => {
    const batch = approve(await masked('doc-b1'), { reviewed: true });
    const fakes: ApprovedBatch[] = [
      { docId: batch.docId, clauses: batch.clauses },
      structuredClone(batch),
      { ...batch },
    ];
    for (const fake of fakes) expect(() => assertApproved(fake)).toThrow(code('not_approved'));
    expect(() => assertApproved(null as unknown as ApprovedBatch)).toThrow(code('not_approved'));
  });

  it('makes earlier results and batches stale once the document is masked again', async () => {
    const first = await masked('doc-b2');
    const batch = approve(first, { reviewed: true });
    const other = approve(await masked('doc-b2-other'), { reviewed: true });

    const second = await masked('doc-b2');
    expect(() => assertApproved(batch)).toThrow(code('stale'));
    expect(() => approve(first, { reviewed: true })).toThrow(code('stale'));
    expect(() => assertApproved(approve(second, { reviewed: true }))).not.toThrow();
    expect(() => assertApproved(other)).not.toThrow(); // another document is unaffected
  });

  it('goes stale the moment a new run starts, before it awaits anything', async () => {
    const batch = approve(await masked('doc-b3'), { reviewed: true });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const pending = mask('doc-b3', contract('dana@example.test'), {
      ...noModel,
      onDeviceStatus: async () => {
        await gate;
        return 'unavailable';
      },
    });
    expect(() => assertApproved(batch)).toThrow(code('stale'));
    release();
    await pending;
  });

  it('goes stale even when the new run fails', async () => {
    const batch = approve(await masked('doc-b4'), { reviewed: true });
    await expect(mask('doc-b4', contract('dana@example.test'), { ...noModel, onDeviceStatus: unused })).rejects.toThrow();
    expect(() => assertApproved(batch)).toThrow(code('stale'));
  });
});

describe('mask', () => {
  it('keeps the newest run in the vault when an older overlapping run finishes last', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const slow: AiBridge = {
      ...noModel,
      onDeviceStatus: async () => {
        await gate;
        return 'unavailable';
      },
    };
    const older = mask('doc-c1', contract('alice@example.test'), slow);
    const newer = await masked('doc-c1', noModel, 'bob@example.test');
    release();
    const old = await older;
    if (!old.ok) throw new Error('blocked');

    const stored = Object.values((await loadVault('doc-c1')) ?? {});
    expect(stored).toContain('bob@example.test');
    expect(stored).not.toContain('alice@example.test');
    expect(() => approve(old, { reviewed: true })).toThrow(code('stale'));
    expect(() => assertApproved(approve(newer, { reviewed: true }))).not.toThrow();
  });

  it('refuses clauses without a unique, non-empty id', async () => {
    const twice = [
      { id: 'c1', index: 0, text: 'One.' },
      { id: 'c1', index: 1, text: 'Two.' },
    ];
    await expect(mask('doc-c2', twice, noModel)).rejects.toThrow('unique, non-empty id');
    await expect(mask('doc-c3', [{ id: ' ', index: 0, text: 'One.' }], noModel)).rejects.toThrow('unique, non-empty id');
  });
});
