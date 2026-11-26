import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';
import type { ChatBridge } from '@clause-guard/core/chat';
import { assertApproved } from '@clause-guard/privacy-engine/approval';
import { mask } from '@clause-guard/privacy-engine/mask';
const fixture = vi.hoisted(() => ({ created: vi.fn(), closed: vi.fn() }));
// Tests only the ReviewSession ownership lifecycle. No test ticket registry or
// production authorization; the REAL fail-closed controller is tested separately.
vi.mock('./chatFlow', () => ({ ChatConversation: class {
  private phase = 'editing';
  constructor(batch: ApprovedBatch, local: AiBridge, cloud: ChatBridge) { assertApproved(batch); fixture.created(batch, local, cloud); }
  getSnapshot() { return { phase: this.phase }; }
  close() { this.phase = 'closed'; fixture.closed(); }
} }));
import { ReviewSession } from './reviewFlow';
const cloud: ChatBridge = { ask: vi.fn(), clear: vi.fn() };
const local: AiBridge = {
  onDeviceStatus: async () => 'unavailable', onDevice: async () => { throw new Error('No model'); },
  analyze: async batch => { assertApproved(batch); return { docId: batch.docId, results: batch.clauses.map(clause => ({
    clauseId: clause.id, risk: 'low', explanation: 'Review wording.', redline: '', questions: [],
  })), failed: [], ranOn: 'cloud' }; },
};
beforeEach(() => { vi.clearAllMocks(); });
async function reviewed() { const s = new ReviewSession(local, 'Payment is $100.'); await s.mask(); await s.analyzeReviewed(); return s; }

it('cannot open chat before explicit document approval and successful current results', async () => {
  const s = new ReviewSession(local, 'Payment is $100.');
  expect(() => s.openChat(cloud)).toThrow(expect.objectContaining({ code: 'not_approved' }));
  await s.mask(); expect(() => s.openChat(cloud)).toThrow(expect.objectContaining({ code: 'not_approved' }));
  expect(fixture.created).not.toHaveBeenCalled();
});
it('hands the exact genuine batch to chat and keeps one active conversation per review', async () => {
  const s = await reviewed(), first = s.openChat(cloud);
  expect(s.openChat(cloud)).toBe(first); expect(fixture.created).toHaveBeenCalledOnce();
  const batch = fixture.created.mock.calls[0]![0]; assertApproved(batch);
  expect(batch.docId).toBe(s.docId); expect(batch.clauses[0].text).not.toContain('$100');
  expect(fixture.created).toHaveBeenCalledWith(batch, local, cloud);
});
it('closes chat synchronously on an accepted document edit and cannot reopen the old review', async () => {
  const s = await reviewed(); s.openChat(cloud);
  fixture.closed.mockImplementationOnce(() => { expect(s.getSnapshot().phase).toBe('results'); });
  expect(s.edit('Replacement contract.')).toBe(true); expect(fixture.closed).toHaveBeenCalledOnce();
  expect(() => s.openChat(cloud)).toThrow(expect.objectContaining({ code: 'not_approved' }));
});
it('closes chat before a remask await, even if the remask fails', async () => {
  let failing = false;
  const bridge = { ...local, onDeviceStatus: async () => { if (failing) throw new Error('Model status failed'); return 'unavailable' as const; } };
  const s = new ReviewSession(bridge, 'Payment is $100.'); await s.mask(); await s.analyzeReviewed(); s.openChat(cloud);
  failing = true; const pending = s.mask(); expect(fixture.closed).toHaveBeenCalledOnce(); await pending;
  expect(s.getSnapshot().phase).toBe('error'); expect(() => s.openChat(cloud)).toThrow(expect.objectContaining({ code: 'not_approved' }));
});
it('refuses an externally invalidated batch before creating a conversation', async () => {
  const s = await reviewed(); await mask(s.docId, [{ id: 'new', index: 0, text: 'Replacement.' }], local);
  expect(() => s.openChat(cloud)).toThrow(expect.objectContaining({ code: 'stale' })); expect(fixture.created).not.toHaveBeenCalled();
});
it('closes/replaces a conversation when the transport changes; unmount does not discard the document', async () => {
  const s = await reviewed(), first = s.openChat(cloud), different = { ...cloud };
  expect(s.openChat(different)).not.toBe(first); expect(fixture.closed).toHaveBeenCalledOnce();
  s.closeChat(); expect(fixture.closed).toHaveBeenCalledTimes(2); expect(s.getSnapshot().phase).toBe('results');
  expect(s.openChat(different)).toBeDefined(); expect(fixture.created).toHaveBeenCalledTimes(3);
});
