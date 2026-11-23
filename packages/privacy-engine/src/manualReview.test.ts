import 'fake-indexeddb/auto';
import { expect, it, vi } from 'vitest';
import type { AiBridge, MaskResult } from '@clause-guard/core/types';
import { approve, assertApproved } from './approval';
import { mask, revealReviewValue, reviseMask } from './mask';
import { loadVault } from './vault';

const bridge: AiBridge = { onDeviceStatus: async () => 'available',
  onDevice: async () => '{"entities":[],"type":"other"}', analyze: vi.fn() };
function success(result: MaskResult) {
  if (!result.ok) throw new Error('Expected preview');
  return result;
}
async function document() {
  return success(await mask(crypto.randomUUID(), [
    { id: 'c1', index: 0, text: 'code Bluebird. Send to demo@example.test. Literal [PRIVATE_1].' },
    { id: 'c2', index: 1, text: 'use BLUEBIRD with the passphrase.' },
  ], bridge));
}

it('adds across clauses, preserves automatic masks and types, and undoes exact original spelling', async () => {
  const initial = await document();
  const batch = approve(initial);
  const pending = reviseMask(initial, { add: 'bluebird' });
  expect(() => assertApproved(batch)).toThrow(expect.objectContaining({ code: 'stale' }));
  const edited = success(await pending);
  expect(edited.clauses[0]).toMatchObject({ type: 'other', text: 'code [PRIVATE_2]. Send to [EMAIL_1]. Literal [PRIVATE_1].' });
  expect(edited.ledger.at(-1)).toEqual({ placeholder: '[PRIVATE_2]', kind: 'PRIVATE', clauseIds: ['c1','c2'] });
  expect(() => approve(edited)).toThrow(expect.objectContaining({ code: 'review_required' }));
  expect(await revealReviewValue(edited, '[EMAIL_1]')).toBe('demo@example.test');
  expect(JSON.stringify(approve(edited,{ reviewed:true }))).not.toContain('demo@example.test');
  const second = success(await reviseMask(edited, { add: 'passphrase' }));
  const undone = success(await reviseMask(second, { unmask: '[PRIVATE_2]' }));
  expect(undone.clauses[0]).toEqual(initial.clauses[0]);
  expect(undone.clauses[1]!.text).toBe('use BLUEBIRD with the [PRIVATE_3].');
  expect(await loadVault(undone.docId)).toEqual({ '[EMAIL_1]': 'demo@example.test', '[PRIVATE_3]': 'passphrase' });
});

it('rejects stale and copied previews and prevents edits to detected identifiers or token interiors', async () => {
  const initial = await document();
  await expect(reviseMask({ ...initial }, { add: 'Bluebird' })).rejects.toMatchObject({ code: 'not_approved' });
  await expect(reviseMask(initial, { add: 'EMAIL' })).rejects.toThrow('not found');
  await expect(reviseMask(initial, { unmask: '[EMAIL_1]' })).rejects.toThrow('manually added');
  const pending = reviseMask(initial, { add: 'bluebird' });
  await expect(reviseMask(initial, { add: 'passphrase' })).rejects.toMatchObject({ code: 'stale' });
  const edited = success(await pending);
  await expect(revealReviewValue(initial, '[EMAIL_1]')).rejects.toMatchObject({ code: 'stale' });
  expect(await revealReviewValue(edited, '[PRIVATE_2]')).toBe('Bluebird');
});

it('discards an edit overtaken by a remask and preserves the other document’s vault', async () => {
  const initial = await document();
  const other = await document();
  const rejectedEdit = expect(reviseMask(initial, { add: 'bluebird' })).rejects.toMatchObject({ code: 'stale' });
  const newScan = mask(initial.docId, [{ id: 'c1', index: 0, text: 'Contact replacement@example.test.' }], bridge);
  await Promise.all([rejectedEdit, newScan]);
  expect(await loadVault(initial.docId)).toEqual({ '[EMAIL_1]': 'replacement@example.test' });
  expect(await revealReviewValue(other, '[EMAIL_1]')).toBe('demo@example.test');
});
