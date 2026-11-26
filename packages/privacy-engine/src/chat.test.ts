import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';
import { ChatError, type ApprovedChatContext, type ApprovedChatQuestion, type ChatReply } from '@clause-guard/core/chat';
import { approve, assertApproved } from './approval';
import { mask } from './mask';
import { loadVault, useExternalKey } from './vault';
import * as vault from './vault';
import { CHAT_ENGINE_LIMITS, approveQuestion, assertChatApproved, assertChatCurrent, closeChatContext,
  consumeChatQuestion, maskQuestion, prepareChatContext, unmaskChatReply } from './chat';

type Named = { text: string; kind: 'person' | 'organization' | 'address'; party?: boolean };
const NAMES: Named[] = [
  { text: 'Lucia Martinez', kind: 'person', party: true },
  { text: 'Northwind Analytics, Inc.', kind: 'organization', party: true },
  { text: '42 Elm Street, Suite 300, Springfield, NJ 07001', kind: 'address' },
];
function local(entities: Named[] = [], available = true): AiBridge & { onDevice: ReturnType<typeof vi.fn<AiBridge['onDevice']>> } {
  return { onDeviceStatus: async () => available ? 'available' : 'unavailable',
    onDevice: vi.fn<AiBridge['onDevice']>().mockImplementation(async prompt => JSON.stringify({ type: 'other', entities: entities
      .filter(e => prompt.includes(e.text)).map(e => ({ ...e, party: e.party === true })) })),
    analyze: async () => { throw new Error('No cloud model in engine tests'); } };
}
const contract = 'Lucia Martinez represents Northwind Analytics, Inc. ("Northwind"). Payment is $100.\nNotices: 42 Elm Street, Suite 300, Springfield, NJ 07001.';
async function document(text = contract, entities = NAMES) {
  const docId = crypto.randomUUID(), result = await mask(docId, [{ id: 'c1', index: 0, text }], local(entities));
  if (!result.ok) throw new Error('Fixture did not mask');
  const batch = approve(result, { reviewed: true });
  return { docId, result, batch, context: prepareChatContext(batch), vault: (await loadVault(docId))! };
}
const tokenFor = (vault: Record<string, string>, value: string) => Object.entries(vault).find(([, raw]) => raw === value)?.[0]!;
async function question(context: ApprovedChatContext, raw = 'What must Lucia pay?', entities: Named[] = []) {
  const draft = await maskQuestion(context, raw, local(entities));
  return approveQuestion(context, draft, { reviewed: true });
}
function reply(context: ApprovedChatContext, q: ApprovedChatQuestion, answer: string, extra: Partial<ChatReply> = {}): ChatReply {
  return Object.freeze({ sessionId: context.sessionId, docId: context.docId, revision: context.revision, turnId: q.turnId,
    status: 'answered', answer, citations: Object.freeze(['c1']), ranOn: 'cloud', ...extra });
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }
beforeEach(() => { useExternalKey(undefined); });
afterEach(() => { vi.useRealTimers(); useExternalKey(undefined); });

describe('real engine context and ticket authority', () => {
  it('rejects a copied/hand-built batch and freezes only masked public context fields', async () => {
    const d = await document();
    for (const b of [{ ...d.batch }, { docId: d.docId, clauses: d.batch.clauses }]) expect(() => prepareChatContext(b)).toThrow(expect.objectContaining({ code: 'not_approved' }));
    expect(Object.keys(d.context).sort()).toEqual(['clauses', 'docId', 'revision', 'sessionId']);
    expect(JSON.stringify(d.context)).not.toContain('Lucia'); expect(JSON.stringify(d.batch)).not.toContain('Lucia');
    expect(Object.isFrozen(d.context)).toBe(true); expect(Object.isFrozen(d.context.clauses)).toBe(true); expect(Object.isFrozen(d.context.clauses[0])).toBe(true);
    expect(d.context.clauses).not.toBe(d.batch.clauses);
  });
  it('requires explicit review for EVERY question, then consumes one ticket once', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'What must Lucia pay?', local());
    expect(draft.needsReview).toBe(true); expect(Object.isFrozen(draft)).toBe(true); expect(Object.isFrozen(draft.reviewWords)).toBe(true);
    expect(() => approveQuestion(d.context, draft)).toThrow(expect.objectContaining({ code: 'review_required' }));
    expect(() => approveQuestion(d.context, draft, { reviewed: false })).toThrow(expect.objectContaining({ code: 'review_required' }));
    const q = approveQuestion(d.context, draft, { reviewed: true }); assertChatApproved(d.context, q);
    expect(() => approveQuestion(d.context, draft, { reviewed: true })).toThrow(expect.objectContaining({ code: 'turn_consumed' }));
    consumeChatQuestion(d.context, q); assertChatCurrent(d.context, q);
    expect(() => consumeChatQuestion(d.context, q)).toThrow(expect.objectContaining({ code: 'turn_consumed' }));
    expect(() => assertChatApproved(d.context, q)).toThrow(expect.objectContaining({ code: 'turn_consumed' }));
  });
  it.each(['context', 'draft', 'question', 'raw'])('does not trust a copied or raw %s object', async kind => {
    const d = await document(), draft = await maskQuestion(d.context, 'What must Lucia pay?', local()), q = approveQuestion(d.context, draft, { reviewed: true });
    if (kind === 'context') await expect(maskQuestion({ ...d.context }, 'raw question', local())).rejects.toMatchObject({ code: 'not_approved' });
    if (kind === 'draft') expect(() => approveQuestion(d.context, { ...draft }, { reviewed: true })).toThrow(expect.objectContaining({ code: 'not_approved' }));
    if (kind === 'question') expect(() => consumeChatQuestion(d.context, { ...q })).toThrow(expect.objectContaining({ code: 'not_approved' }));
    if (kind === 'raw') expect(() => assertChatApproved(d.context, 'raw question' as unknown as ApprovedChatQuestion)).toThrow(expect.objectContaining({ code: 'not_approved' }));
  });
  it('binds drafts/tickets to context identity even for the same document run', async () => {
    const d = await document(), other = prepareChatContext(d.batch), draft = await maskQuestion(d.context, 'What must Lucia pay?', local());
    expect(() => approveQuestion(other, draft, { reviewed: true })).toThrow(expect.objectContaining({ code: 'wrong_session' }));
    const q = approveQuestion(d.context, draft, { reviewed: true });
    for (const guard of [assertChatApproved, consumeChatQuestion, assertChatCurrent]) expect(() => guard(other, q)).toThrow(expect.objectContaining({ code: 'wrong_session' }));
  });
  it('invalidates contexts/drafts/tickets before a remask awaits, even if masking fails', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'What must Lucia pay?', local()), q = approveQuestion(d.context, draft, { reviewed: true });
    const p = deferred<'unavailable'>(), bridge = local(); bridge.onDeviceStatus = () => p.promise;
    const remask = mask(d.docId, [{ id: 'bad', index: 0, text: 'Replacement.' }], bridge);
    expect(() => prepareChatContext(d.batch)).toThrow(expect.objectContaining({ code: 'stale' }));
    expect(() => assertChatApproved(d.context, q)).toThrow(expect.objectContaining({ code: 'stale' }));
    await expect(maskQuestion(d.context, 'old', local())).rejects.toMatchObject({ code: 'stale' });
    p.resolve('unavailable'); await remask;
  });
  it('failed remask with invalid clause IDs still invalidates the old turn', async () => {
    const d = await document(), q = await question(d.context);
    await expect(mask(d.docId, [{ id: '', index: 0, text: 'invalid' }], local())).rejects.toThrow();
    expect(() => consumeChatQuestion(d.context, q)).toThrow(expect.objectContaining({ code: 'stale' }));
  });
  it('close permanently invalidates all pending objects and leaves the document approval/vault alone', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'What must Lucia pay?', local()), q = approveQuestion(d.context, draft, { reviewed: true });
    closeChatContext(d.context); closeChatContext(d.context);
    expect(() => assertChatCurrent(d.context, q)).toThrow(expect.objectContaining({ code: 'stale' }));
    expect(() => approveQuestion(d.context, draft, { reviewed: true })).toThrow(expect.objectContaining({ code: 'stale' }));
    assertApproved(d.batch); expect(await loadVault(d.docId)).toEqual(d.vault); expect(prepareChatContext(d.batch)).not.toBe(d.context);
  });
});

describe('local question masking and append-only identity', () => {
  it('reuses full/first/last, defined organization and partial-street variants', async () => {
    const d = await document(), person = tokenFor(d.vault, 'Lucia Martinez'), org = tokenFor(d.vault, 'Northwind Analytics, Inc.'), address = tokenFor(d.vault, NAMES[2]!.text);
    const draft = await maskQuestion(d.context, 'Does Lucia Martinez or Lucia or Martinez represent Northwind at 42 Elm Street?', local());
    expect(draft.text).toContain(person); expect(draft.text.split(person)).toHaveLength(4); expect(draft.text).toContain(org); expect(draft.text).toContain(address);
    for (const raw of ['Lucia', 'Martinez', 'Northwind', 'Elm']) expect(draft.text).not.toContain(raw);
    expect(draft.text).toMatch(/^Does /); expect(draft.reviewWords).not.toContain('PARTY');
  });
  it('rejects shared surnames while full names stay distinct and usable', async () => {
    const entities: Named[] = [{ text: 'Rafael Mendoza', kind: 'person', party: true }, { text: 'Isabel Mendoza', kind: 'person', party: true }];
    const d = await document('Rafael Mendoza and Isabel Mendoza are the borrowers.\nBy: Rafael Mendoza\nBy: Isabel Mendoza', entities);
    await expect(maskQuestion(d.context, 'What does Mendoza owe?', local())).rejects.toMatchObject({ code: 'ambiguous_entity' });
    const draft = await maskQuestion(d.context, 'What do Rafael Mendoza and Isabel Mendoza owe?', local());
    expect(draft.text).toContain(tokenFor(d.vault, 'Rafael Mendoza')); expect(draft.text).toContain(tokenFor(d.vault, 'Isabel Mendoza'));
  });
  it('blocks a shared street prefix instead of choosing a unit', async () => {
    const addresses: Named[] = [{ text: '42 Elm Street, Suite 100', kind: 'address' }, { text: '42 Elm Street, Suite 200', kind: 'address' }];
    const d = await document('Notices: 42 Elm Street, Suite 100.\nDelivery: 42 Elm Street, Suite 200.', addresses);
    await expect(maskQuestion(d.context, 'What about 42 Elm Street?', local())).rejects.toMatchObject({ code: 'ambiguous_entity' });
  });
  it('masks lowercase known first names without relying on a model response', async () => {
    const d = await document(); const draft = await maskQuestion(d.context, 'What must lucia pay?', local([], false));
    expect(draft.text).toContain(tokenFor(d.vault, 'Lucia Martinez'));
    expect(draft.text).not.toContain('lucia');
  });
  it('keeps complete contacts distinct from a known name inside them', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'Can notices go to Lucia at Lucia@example.test?', local());
    expect(draft.text).toContain(tokenFor(d.vault, 'Lucia Martinez')); expect(draft.text).toMatch(/\[EMAIL_\d+\]/); expect(draft.text).not.toContain('@');
  });
  it('numbers a new PERSON after the highest document suffix and restores it locally', async () => {
    const people: Named[] = ['Alice Stone', 'Boris Lane', 'Carla Dunn'].map(text => ({ text, kind: 'person' }));
    const d = await document('Alice Stone, Boris Lane and Carla Dunn may sign.', people);
    const raw = 'Can Sam Ortega sign?', extra: Named[] = [{ text: 'Sam Ortega', kind: 'person' }];
    const draft = await maskQuestion(d.context, raw, local(extra)); expect(draft.text).toContain('[PERSON_4]');
    const q = approveQuestion(d.context, draft, { reviewed: true }); consumeChatQuestion(d.context, q);
    expect((await unmaskChatReply(d.context, q, reply(d.context, q, '[PERSON_4] is not identified in the contract.'))).answer).toContain('Sam Ortega');
    expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('reuses a newly found first name within the same question and future questions', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'Can Sam Ortega sign, and what does Sam owe?', local([{ text: 'Sam Ortega', kind: 'person' }]));
    const token = draft.text.match(/\[PERSON_\d+\]/)![0]; expect(draft.text.split(token)).toHaveLength(3);
    expect((await maskQuestion(d.context, 'What about Sam?', local())).text).toContain(token);
  });
  it('new full names do not inherit a known first name’s identity', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'What about Lucia Chen?', local([{ text: 'Lucia Chen', kind: 'person' }]));
    expect(draft.text).not.toContain(tokenFor(d.vault, 'Lucia Martinez')); expect(draft.text).not.toContain('Chen');
    await expect(maskQuestion(d.context, 'What about Lucia?', local())).rejects.toMatchObject({ code: 'ambiguous_entity' });
  });
  it('does not promote a new question person or organization to a document party based on the local model flag', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'Can Sam Ortega represent Juniper Labs LLC?', local([
      { text: 'Sam Ortega', kind: 'person', party: true }, { text: 'Juniper Labs LLC', kind: 'organization', party: true },
    ]));
    expect(draft.text).toMatch(/\[PERSON_\d+\]/); expect(draft.text).toMatch(/\[ORG_\d+\]/);
    expect(draft.text).not.toContain('[PARTY_');
  });
  it('returns unreplaced capitalized review words when no model runs; still requires explicit review', async () => {
    const d = await document(), bridge = local([], false), draft = await maskQuestion(d.context, 'Can Ada sign?', bridge);
    expect(draft.reviewWords).toContain('Ada'); expect(draft.needsReview).toBe(true); expect(bridge.onDevice).not.toHaveBeenCalled();
    expect(() => approveQuestion(d.context, draft)).toThrow(expect.objectContaining({ code: 'review_required' }));
  });
  it('ignores hallucinated model names that are absent from the question', async () => {
    const d = await document(), bridge = local(); bridge.onDevice.mockResolvedValueOnce(JSON.stringify({ type: 'other', entities: [{ text: 'Invented Person', kind: 'person', party: false }] }));
    const draft = await maskQuestion(d.context, 'What must Lucia pay?', bridge); expect(draft.text).not.toContain('PERSON_');
    expect(JSON.stringify(draft)).not.toContain('Invented');
  });
  it('handles a failing local model without returning its raw error message', async () => {
    const d = await document(), bridge = local(); bridge.onDevice.mockRejectedValueOnce(new Error('PRIVATE_RAW_QUESTION'));
    const draft = await maskQuestion(d.context, 'What must Lucia pay?', bridge); expect(draft.text).not.toContain('Lucia'); expect(JSON.stringify(draft)).not.toContain('PRIVATE');
  });
  it.each(['', 'x'.repeat(2001), '[PERSON_999]', '[broken'])('bounds/rejects invalid input before local model setup', async raw => {
    const d = await document(), bridge = local(); await expect(maskQuestion(d.context, raw, bridge)).rejects.toBeInstanceOf(ChatError); expect(bridge.onDevice).not.toHaveBeenCalled();
  });
  it('does not publish a late local result after remasking or closing', async () => {
    const d = await document(), gate = deferred<string>(), bridge = local(); bridge.onDevice.mockReturnValueOnce(gate.promise);
    const pending = maskQuestion(d.context, 'Can Sam Ortega sign?', bridge); await vi.waitFor(() => expect(bridge.onDevice).toHaveBeenCalledOnce());
    closeChatContext(d.context); gate.resolve(JSON.stringify({ type: 'other', entities: [{ text: 'Sam Ortega', kind: 'person', party: false }] }));
    await expect(pending).rejects.toMatchObject({ code: 'stale' }); expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('bounds a hung local call and discards its late names', async () => {
    const d = await document(); vi.useFakeTimers(); const gate = deferred<string>(), bridge = local(); bridge.onDevice.mockReturnValueOnce(gate.promise);
    const pending = maskQuestion(d.context, 'Can Ada sign?', bridge); await vi.advanceTimersByTimeAsync(CHAT_ENGINE_LIMITS.localTimeoutMs);
    const draft = await pending; expect(draft.reviewWords).toContain('Ada');
    gate.resolve(JSON.stringify({ type: 'other', entities: [{ text: 'Ada', kind: 'person', party: false }] })); await Promise.resolve();
    expect((await maskQuestion(d.context, 'Can Ada sign?', local([], false))).reviewWords).toContain('Ada');
  });
  it('supports external keystore keys without reading/writing a vault for chat', async () => {
    const key = vi.fn(async () => new Uint8Array(32).fill(7)); useExternalKey(key); const d = await document(); const calls = key.mock.calls.length;
    const loads = vi.spyOn(vault, 'loadVault'), saves = vi.spyOn(vault, 'saveVault');
    const q = await question(d.context); consumeChatQuestion(d.context, q);
    await unmaskChatReply(d.context, q, reply(d.context, q, `${tokenFor(d.vault, 'Lucia Martinez')} pays ${tokenFor(d.vault, '$100')}.`));
    expect(loads).not.toHaveBeenCalled(); expect(saves).not.toHaveBeenCalled(); loads.mockRestore(); saves.mockRestore();
    expect(key).toHaveBeenCalledTimes(calls); expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('handles a Unicode new full name and its first-name reuse without losing the accents', async () => {
    const d = await document(), draft = await maskQuestion(d.context, 'Can Zoë Ångström sign, and what can Zoë do?', local([{ text: 'Zoë Ångström', kind: 'person' }]));
    const token = draft.text.match(/\[PERSON_\d+\]/)![0]; expect(draft.text.split(token)).toHaveLength(3); expect(draft.text).not.toContain('Zoë');
    const q = approveQuestion(d.context, draft, { reviewed: true }); consumeChatQuestion(d.context, q);
    expect((await unmaskChatReply(d.context, q, reply(d.context, q, `${token} is not identified in the contract.`))).answer).toContain('Zoë Ångström');
  });
  it('rejects ambiguous new short forms within the same question without publishing a partial map', async () => {
    const d = await document();
    await expect(maskQuestion(d.context, 'Can Lucia Chen sign with Lucia?', local([{ text: 'Lucia Chen', kind: 'person' }]))).rejects.toMatchObject({ code: 'ambiguous_entity' });
    // The failed preview published no new token; the original contract identity remains usable.
    expect((await maskQuestion(d.context, 'Can Lucia Martinez sign?', local())).text).toContain(tokenFor(d.vault, 'Lucia Martinez'));
    expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('allocates unique stable tokens when overlapping local calls complete out of order', async () => {
    const d = await document(), first = deferred<string>(), second = deferred<string>(), bridge = local();
    bridge.onDevice.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const a = maskQuestion(d.context, 'Can Sam Ortega sign?', bridge), b = maskQuestion(d.context, 'Can Elena Cruz sign?', bridge);
    await vi.waitFor(() => expect(bridge.onDevice).toHaveBeenCalledTimes(2));
    second.resolve(JSON.stringify({ type: 'other', entities: [{ text: 'Elena Cruz', kind: 'person', party: false }] })); const bDraft = await b;
    first.resolve(JSON.stringify({ type: 'other', entities: [{ text: 'Sam Ortega', kind: 'person', party: false }] })); const aDraft = await a;
    const aToken = aDraft.text.match(/\[PERSON_\d+\]/)![0], bToken = bDraft.text.match(/\[PERSON_\d+\]/)![0]; expect(aToken).not.toBe(bToken);
    const q = approveQuestion(d.context, bDraft, { reviewed: true }); consumeChatQuestion(d.context, q);
    expect((await unmaskChatReply(d.context, q, reply(d.context, q, `${bToken} is not identified in the contract.`))).answer).toContain('Elena Cruz');
  });
  it('preserves document PARTY lettering after Z without promoting a new question name to a party', async () => {
    const signers: Named[] = Array.from({ length: 26 }, (_, i) => ({ text: `Signer${String.fromCharCode(65 + i)}`, kind: 'person', party: true }));
    const d = await document(signers.map(s => s.text).join(', ') + ' may sign.', signers);
    expect(Object.hasOwn(d.vault, '[PARTY_Z]')).toBe(true);
    const draft = await maskQuestion(d.context, 'Can SignerZ or SignerExtra sign?', local([{ text: 'SignerExtra', kind: 'person', party: true }]));
    expect(draft.text).toContain('[PARTY_Z]'); expect(draft.text).toContain('[PERSON_1]'); expect(draft.text).not.toContain('[PARTY_AA]'); expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('bounds draft creation and requires a new session at the limit', async () => {
    const d = await document(), bridge = local([], false);
    for (let i = 0; i < CHAT_ENGINE_LIMITS.drafts; ++i) await maskQuestion(d.context, 'What is stated?', bridge);
    await expect(maskQuestion(d.context, 'What is stated?', bridge)).rejects.toMatchObject({ code: 'history_limit' });
  });
  it('bounds token growth before committing a new sensitive value', async () => {
    const docId = crypto.randomUUID(), emails = Array.from({ length: CHAT_ENGINE_LIMITS.tokens }, (_, i) => `a${i}@x.io`);
    const result = await mask(docId, [0, 1].map(index => ({ id: `c${index}`, index, text: emails.slice(index * 256, (index + 1) * 256).join(' ') })), local([], false));
    if (!result.ok) throw new Error('Token-bound fixture failed');
    const batch = approve(result, { reviewed: true }), context = prepareChatContext(batch), before = await loadVault(docId);
    await expect(maskQuestion(context, 'Can notices go to new@x.io?', local([], false))).rejects.toMatchObject({ code: 'history_limit' });
    expect(await loadVault(docId)).toEqual(before);
  });
});

describe('per-turn response restoration', () => {
  it('requires dispatch consumption, validates metadata and returns a new frozen display object', async () => {
    const d = await document(), q = await question(d.context), input = reply(d.context, q, `${tokenFor(d.vault, 'Lucia Martinez')} pays ${tokenFor(d.vault, '$100')}.`);
    await expect(unmaskChatReply(d.context, q, input)).rejects.toMatchObject({ code: 'not_approved' });
    consumeChatQuestion(d.context, q); const restored = await unmaskChatReply(d.context, q, input);
    expect(restored.answer).toBe('Lucia Martinez pays $100.'); expect(restored).not.toBe(input); expect(Object.isFrozen(restored)).toBe(true);
    expect(input.answer).not.toContain('Lucia');
    await expect(unmaskChatReply(d.context, q, restored)).rejects.toMatchObject({ code: 'privacy_check_failed' });
  });
  it.each(['sessionId', 'docId', 'revision', 'turnId', 'ranOn'])('rejects reply metadata mismatch: %s', async field => {
    const d = await document(), q = await question(d.context); consumeChatQuestion(d.context, q);
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, 'No other term is stated.', { [field]: 'wrong' }))).rejects.toMatchObject({ code: 'invalid_response' });
  });
  it('rejects raw known names, unknown placeholders and unknown clause citations', async () => {
    const d = await document(), q = await question(d.context); consumeChatQuestion(d.context, q);
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, 'Lucia Martinez signs.'))).rejects.toMatchObject({ code: 'privacy_check_failed' });
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, '[PERSON_999] signs.'))).rejects.toMatchObject({ code: 'unknown_placeholder' });
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, 'No term is stated.', { citations: Object.freeze(['missing']) }))).rejects.toMatchObject({ code: 'unknown_citation' });
  });
  it('earlier answers keep their original meaning after later question tokens are added', async () => {
    const d = await document(), q = await question(d.context, 'Can Sam Ortega sign?', [{ text: 'Sam Ortega', kind: 'person' }]); consumeChatQuestion(d.context, q);
    const token = q.text.match(/\[PERSON_\d+\]/)![0], input = reply(d.context, q, `${token} is not identified in the contract.`);
    const first = await unmaskChatReply(d.context, q, input);
    await maskQuestion(d.context, 'Can Elena Cruz sign?', local([{ text: 'Elena Cruz', kind: 'person' }]));
    expect((await unmaskChatReply(d.context, q, input)).answer).toBe(first.answer); expect(first.answer).toContain('Sam Ortega');
  });
  it('does not authorize later/unsent question tokens in an earlier answer', async () => {
    const d = await document(), q = await question(d.context); consumeChatQuestion(d.context, q);
    const later = await maskQuestion(d.context, 'Can Sam Ortega sign?', local([{ text: 'Sam Ortega', kind: 'person' }]));
    const token = later.text.match(/\[PERSON_\d+\]/)![0];
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, `${token} signs.`))).rejects.toMatchObject({ code: 'unknown_placeholder' });
  });
  it('a consumed but unsuccessful turn does not authorize its new tokens in a later reply', async () => {
    const d = await document(), failed = await question(d.context, 'Can Sam Ortega sign?', [{ text: 'Sam Ortega', kind: 'person' }]);
    consumeChatQuestion(d.context, failed); // Provider failed: no validated/restored completion.
    const q = await question(d.context); consumeChatQuestion(d.context, q);
    const token = failed.text.match(/\[PERSON_\d+\]/)![0];
    await expect(unmaskChatReply(d.context, q, reply(d.context, q, `${token} signs.`))).rejects.toMatchObject({ code: 'unknown_placeholder' });
  });
  it('rechecks the run after asynchronous restoration scheduling', async () => {
    const d = await document(), q = await question(d.context); consumeChatQuestion(d.context, q);
    const restoring = unmaskChatReply(d.context, q, reply(d.context, q, 'No term is stated.'));
    const remask = mask(d.docId, [{ id: 'new', index: 0, text: 'Replacement.' }], local([], false));
    await expect(restoring).rejects.toMatchObject({ code: 'stale' }); await remask;
  });
});


describe('reported case and currency-free question misses', () => {
  it.each(['Acme', 'acme', 'ACME', 'aCmE'])('masks known company alias %s with the original token', async name => {
    const d = await document('Acme Corp must pay $12,500.', []);
    const draft = await maskQuestion(d.context, `What must ${name} pay?`, local([], false));
    expect(draft.text).toBe(`What must ${tokenFor(d.vault, 'Acme Corp')} pay?`);
    expect(draft.needsReview).toBe(true);
  });
  it('masks a currency-free number without guessing its currency or changing local restoration', async () => {
    const d = await document('Acme Corp must pay $12,500.', []);
    const draft = await maskQuestion(d.context, 'Does acme pay 12,500?', local([], false));
    expect(draft.text).not.toMatch(/acme|12,500/i);
    const q = approveQuestion(d.context, draft, {reviewed:true}); consumeChatQuestion(d.context,q);
    const amount = draft.text.match(/\[AMOUNT_\d+\]/)![0];
    const restored = await unmaskChatReply(d.context,q,reply(d.context,q,`The question mentions ${amount}.`));
    expect(restored.answer).toBe('The question mentions 12,500.');
    expect(await loadVault(d.docId)).toEqual(d.vault);
  });
  it('keeps unrelated word interiors and ordinary deadlines unchanged', async () => {
    const d = await document('Acme Corp must pay $12,500.', []);
    const draft = await maskQuestion(d.context,'Does acmeology last 30 days under section 12.5?',local([],false));
    expect(draft.text).toBe('Does acmeology last 30 days under section 12.5?');
  });
});


it('masks plain 12500 in questions without inferring currency and keeps it out of the document vault', async () => {
  const d = await document('Acme Corp must pay $12,500.', []);
  const draft = await maskQuestion(d.context,'Does acme pay 12500?',local([],false));
  expect(draft.text).not.toMatch(/acme|12500/i);
  const q=approveQuestion(d.context,draft,{reviewed:true});consumeChatQuestion(d.context,q);
  const token=draft.text.match(/\[AMOUNT_\d+\]/)![0];
  expect((await unmaskChatReply(d.context,q,reply(d.context,q,`The question says ${token}.`))).answer).toBe('The question says 12500.');
  expect(await loadVault(d.docId)).toEqual(d.vault);
});
