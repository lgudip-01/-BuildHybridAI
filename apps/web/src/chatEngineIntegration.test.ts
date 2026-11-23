import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { AiBridge } from '@clause-guard/core/types';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { mask, reviseMask } from '@clause-guard/privacy-engine/mask';
import { loadVault } from '@clause-guard/privacy-engine/vault';
import { assertChatCurrent, approveQuestion, maskQuestion, prepareChatContext } from '@clause-guard/privacy-engine/chat';
const sdk = vi.hoisted(() => ({ generate: vi.fn(), factory: vi.fn() }));
// Unmocked production bindings and REAL engine authority. Only the outbound
// provider/config calls are mocked in these integration tests.
vi.mock('firebase/ai', async original => ({ ...await original<typeof import('firebase/ai')>(), getGenerativeModel: sdk.factory }));
vi.mock('./analysisConfig', async original => {
  const actual = await original<typeof import('./analysisConfig')>();
  return { ...actual, loadAnalysisConfig: async () => actual.DEFAULT_ANALYSIS_CONFIG };
});
import { CloudChatBridge } from './cloudChat';
import { ReviewSession } from './reviewFlow';

const bridge: AiBridge = {
  onDeviceStatus: async () => 'available',
  onDevice: async prompt => JSON.stringify({ type: 'other', entities: [
    { text: 'Lucia Martinez', kind: 'person', party: true },
    { text: 'Sam Ortega', kind: 'person', party: false },
  ].filter(e => prompt.includes(e.text)) }),
  analyze: async batch => { assertApproved(batch); return { docId: batch.docId, results: batch.clauses.map(c => ({
    clauseId: c.id, risk: 'low', explanation: 'Review the stated terms.', redline: '', questions: [],
  })), failed: [], ranOn: 'cloud' }; },
};
const contract = 'Lucia Martinez must pay $100.';
function result(text: string) { return { response: { inferenceSource: 'in_cloud', text: () => text } }; }
function response(input: string) {
  const payload = JSON.parse(input), token = payload.question.text.match(/\[[A-Z]+_[A-Z0-9]+\]/)?.[0];
  return result(JSON.stringify({ status: 'answered', answer: `${token ?? 'No other person'} is referenced in the question.`, citations: ['c1'] }));
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }
beforeEach(() => {
  vi.clearAllMocks(); sdk.generate.mockReset().mockImplementation(async (input: string) => response(input));
  sdk.factory.mockImplementation(() => ({ generateContent: sdk.generate }));
});
async function reviewed() {
  const s = new ReviewSession(bridge, contract); await s.mask(); await s.analyzeReviewed();
  expect(s.getSnapshot().phase).toBe('results'); return s;
}

it('runs real mask/approve/context/question/consume/restore through the UI, with provider calls mocked', async () => {
  const s = await reviewed(), before = await loadVault(s.docId), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI));
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare();
  expect(conversation.getSnapshot().phase).toBe('review'); expect(sdk.generate).not.toHaveBeenCalled();
  expect(conversation.getSnapshot().preview?.text).not.toContain('Lucia'); await conversation.approveAndSend();
  expect(conversation.getSnapshot().messages[0]?.answer).toContain('Lucia Martinez');
  const payload = sdk.generate.mock.calls[0]![0] as string;
  for (const raw of ['Lucia', '$100', s.docId, 'reviewWords', 'needsReview', 'sessionId', 'revision', 'turnId']) expect(payload).not.toContain(raw);
  expect(await loadVault(s.docId)).toEqual(before);
});
it('keeps restored display values out of a real multi-turn masked history', async () => {
  const s = await reviewed(), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI));
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare(); await conversation.approveAndSend();
  conversation.editQuestion('Can Sam Ortega sign?'); await conversation.prepare(); await conversation.approveAndSend();
  expect(conversation.getSnapshot().messages.map(m => m.answer).join(' ')).toContain('Sam Ortega');
  const payload = JSON.parse(sdk.generate.mock.calls[1]![0]); expect(payload.history).toHaveLength(2);
  expect(JSON.stringify(payload)).not.toContain('Lucia'); expect(JSON.stringify(payload)).not.toContain('Sam');
  expect(payload.question.text).toMatch(/\[PERSON_\d+\]/);
});
it('a failed dispatched turn never enters later transport history and needs a new approval', async () => {
  const s = await reviewed(), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI));
  sdk.generate.mockResolvedValueOnce(result('{"status":"answered","answer":"[PERSON_999] signs.","citations":["c1"]}'));
  conversation.editQuestion('Can Sam Ortega sign?'); await conversation.prepare(); await conversation.approveAndSend();
  expect(conversation.getSnapshot().phase).toBe('error'); await conversation.approveAndSend(); expect(sdk.generate).toHaveBeenCalledOnce();
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare(); await conversation.approveAndSend();
  expect(JSON.parse(sdk.generate.mock.calls[1]![0]).history).toEqual([]); expect(conversation.getSnapshot().messages).toHaveLength(1);
});
it('rejects a real remask during SDK setup before ticket consumption or provider dispatch', async () => {
  const s = await reviewed(), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI));
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare();
  sdk.factory.mockImplementationOnce(() => { void mask(s.docId, [{ id: '', index: 0, text: 'Invalid replacement.' }], bridge).catch(() => {}); return { generateContent: sdk.generate }; });
  await conversation.approveAndSend(); expect(sdk.generate).not.toHaveBeenCalled(); expect(conversation.getSnapshot()).toMatchObject({ phase: 'closed', messages: [] });
});
it('document edit closes the real engine context and discards an in-flight SDK result', async () => {
  const s = await reviewed(), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI)), gate = deferred<ReturnType<typeof result>>();
  sdk.generate.mockReturnValueOnce(gate.promise); conversation.editQuestion('What must Lucia pay?'); await conversation.prepare();
  const asking = conversation.approveAndSend(); await vi.waitFor(() => expect(sdk.generate).toHaveBeenCalledOnce());
  s.edit('Replacement contract.'); gate.resolve(response(sdk.generate.mock.calls[0]![0])); await asking;
  expect(conversation.getSnapshot()).toEqual({ phase: 'closed', question: '', messages: [] }); expect(s.getSnapshot().phase).toBe('editing');
});
it('external remasking clears previously restored messages on the next question operation', async () => {
  const s = await reviewed(), conversation = s.openChat(new CloudChatBridge({ app: {} } as AI));
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare(); await conversation.approveAndSend(); expect(conversation.getSnapshot().messages).toHaveLength(1);
  await mask(s.docId, [{ id: 'new', index: 0, text: 'Replacement.' }], bridge);
  conversation.editQuestion('Another question'); await conversation.prepare(); expect(conversation.getSnapshot()).toMatchObject({ phase: 'closed', messages: [] });
});
it('cannot create runtime authority from copied genuine objects', async () => {
  const id = crypto.randomUUID(), masked = await mask(id, [{ id: 'c1', index: 0, text: contract }], bridge);
  if (!masked.ok) throw new Error('Mask failed');
  const batch = approve(masked, { reviewed: true }), context = prepareChatContext(batch);
  expect(() => prepareChatContext({ ...batch })).toThrow(expect.objectContaining({ code: 'not_approved' }));
  await expect(maskQuestion({ ...context }, 'What must Lucia pay?', bridge)).rejects.toMatchObject({ code: 'not_approved' });
  expect(() => assertChatCurrent(context, { sessionId: context.sessionId } as never)).toThrow(expect.objectContaining({ code: 'not_approved' }));
  expect(sdk.generate).not.toHaveBeenCalled();
});

it('explicit chat-only document approval reaches the real cloud path without clause analysis', async () => {
  const analyze = vi.fn(bridge.analyze);
  const session = new ReviewSession({ ...bridge, analyze }, contract);
  session.approveForChat();
  expect(() => session.openChat(new CloudChatBridge({app:{}} as AI))).toThrow();
  await session.mask();
  expect(session.getSnapshot().phase).toBe('review');
  session.approveForChat();
  expect(session.getSnapshot().phase).toBe('chat');
  expect(analyze).not.toHaveBeenCalled(); expect(sdk.generate).not.toHaveBeenCalled();
  const conversation = session.openChat(new CloudChatBridge({app:{}} as AI));
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare();
  expect(sdk.generate).not.toHaveBeenCalled();
  await conversation.approveAndSend();
  expect(conversation.getSnapshot().messages[0]?.ranOn).toBe('cloud');
  expect(conversation.getSnapshot().messages[0]?.answer).toContain('Lucia Martinez');
  expect(sdk.generate).toHaveBeenCalledOnce(); expect(analyze).not.toHaveBeenCalled();
  session.edit('New contract.');
  expect(conversation.getSnapshot()).toMatchObject({phase:'closed',question:'',messages:[]});
  expect(() => session.openChat(new CloudChatBridge({app:{}} as AI))).toThrow();
});
it('chat-only document approval rejects an externally stale preview before cloud setup', async () => {
  const session = new ReviewSession(bridge, contract); await session.mask();
  await mask(session.docId,[{id:'new',index:0,text:'Replacement contract.'}],bridge);
  session.approveForChat(); expect(session.getSnapshot().phase).toBe('error');
  expect(() => session.openChat(new CloudChatBridge({app:{}} as AI))).toThrow();
  expect(sdk.factory).not.toHaveBeenCalled(); expect(sdk.generate).not.toHaveBeenCalled();
});


it('manual changes revoke prepared chat and require fresh approval with PRIVATE restoration', async () => {
  const session = new ReviewSession(bridge, 'Lucia Martinez must use code bluebird and pay $100.');
  await session.mask(); session.approveForChat();
  const cloud = new CloudChatBridge({ app: {} } as AI), old = session.openChat(cloud);
  old.editQuestion('What must Lucia pay?'); await old.prepare();
  const revision = session.revise({ add: 'bluebird' });
  expect(old.getSnapshot()).toMatchObject({ phase: 'closed', messages: [], question: '' });
  await old.approveAndSend(); expect(sdk.factory).not.toHaveBeenCalled();
  await revision; expect(() => session.openChat(cloud)).toThrow(); session.approveForChat();
  const current = session.openChat(cloud);
  current.editQuestion('Does Lucia use bluebird?'); await current.prepare();
  expect(current.getSnapshot().preview?.text).toContain('[PRIVATE_1]');
  expect(current.getSnapshot().preview?.text).toContain('[PARTY_A]');
  sdk.generate.mockResolvedValueOnce(result(JSON.stringify({ status: 'answered', answer: '[PARTY_A] uses [PRIVATE_1].', citations: ['c1'] })));
  await current.approveAndSend();
  expect(current.getSnapshot().messages[0]?.answer).toBe('Lucia Martinez uses bluebird.');
  for (const raw of ['Lucia', 'bluebird', '$100']) expect(sdk.generate.mock.calls[0]![0]).not.toContain(raw);
});

it('manual edits invalidate engine tickets and undo retains original chat aliases', async () => {
  const preview = await mask(crypto.randomUUID(), [{id:'c1',index:0,text:'Lucia Martinez uses bluebird.'}], bridge);
  if (!preview.ok) throw new Error('Expected preview');
  const context = prepareChatContext(approve(preview, {reviewed:true}));
  const ticket = approveQuestion(context, await maskQuestion(context, 'Does Lucia use bluebird?', bridge), {reviewed:true});
  const revising = reviseMask(preview, {add:'bluebird'});
  expect(() => assertChatCurrent(context, ticket)).toThrow(expect.objectContaining({code:'stale'}));
  const revised = await revising; if (!revised.ok) throw new Error('Expected revision');
  const undone = await reviseMask(revised, {unmask:'[PRIVATE_1]'}); if (!undone.ok) throw new Error('Expected undo');
  const updatedContext = prepareChatContext(approve(undone, {reviewed:true}));
  expect((await maskQuestion(updatedContext, 'What does Lucia use?', bridge)).text).toContain('[PARTY_A]');
  expect(updatedContext.clauses[0]!.text).toContain('bluebird');
  expect(await loadVault(preview.docId)).not.toHaveProperty('[PRIVATE_1]');
});

it('manual edit during dispatch clears history and discards the late provider result', async () => {
  const session = await reviewed(), cloud = new CloudChatBridge({app:{}} as AI);
  const chat = session.openChat(cloud), gate = deferred<ReturnType<typeof result>>();
  sdk.generate.mockReturnValueOnce(gate.promise);
  chat.editQuestion('What must Lucia pay?'); await chat.prepare();
  const pending = chat.approveAndSend(); await vi.waitFor(() => expect(sdk.generate).toHaveBeenCalledOnce());
  await session.revise({add:'must pay'});
  gate.resolve(response(sdk.generate.mock.calls[0]![0])); await pending;
  expect(chat.getSnapshot()).toMatchObject({phase:'closed',question:'',messages:[]});
  expect(session.getSnapshot()).toMatchObject({phase:'review',outcome:undefined});
  expect(() => session.openChat(cloud)).toThrow();
});

it('deletion discards pending chat, isolates vaults and clears manual choices for the next document', async () => {
  const session = new ReviewSession(bridge,'Lucia Martinez uses bluebird.');
  await session.mask(); await session.revise({add:'bluebird'}); session.approveForChat();
  const id = session.docId, cloud = new CloudChatBridge({app:{}} as AI), chat = session.openChat(cloud);
  const other = await mask(crypto.randomUUID(),[{id:'c1',index:0,text:'Contact other@example.test.'}],bridge);
  if (!other.ok) throw new Error('Expected other preview');
  const otherBatch = approve(other,{reviewed:true}), otherVault = await loadVault(other.docId);
  const gate = deferred<ReturnType<typeof result>>(); sdk.generate.mockReturnValueOnce(gate.promise);
  chat.editQuestion('What does Lucia use?'); await chat.prepare();
  const pending = chat.approveAndSend(); await vi.waitFor(()=>expect(sdk.generate).toHaveBeenCalledOnce());
  const deletion = session.deleteDocument(); expect(chat.getSnapshot()).toMatchObject({phase:'closed',messages:[]});
  await deletion; gate.resolve(response(sdk.generate.mock.calls[0]![0])); await pending;
  expect(session.getSnapshot()).toEqual({contract:'',phase:'deleted'});
  expect(session.docId).not.toBe(id); expect(await loadVault(id)).toBeUndefined();
  expect(await loadVault(other.docId)).toEqual(otherVault); expect(()=>assertApproved(otherBatch)).not.toThrow();
  session.edit('Lucia Martinez uses bluebird.'); await session.mask();
  const next = session.getSnapshot().masked; expect(next).not.toHaveProperty('manuallyEdited');
  if (next?.ok) expect(next.clauses[0]!.text).toContain('bluebird');
});
