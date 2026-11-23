import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatError, type ApprovedChatContext, type ApprovedChatQuestion, type ChatBridge, type ChatReply } from '@clause-guard/core/chat';
import type { AiBridge, ApprovedBatch, CleanText } from '@clause-guard/core/types';
const mock = vi.hoisted(() => ({ prepare: vi.fn(), mask: vi.fn(), approve: vi.fn(), restore: vi.fn(), current: vi.fn() }));
vi.mock('./chatEngine', () => ({ prepareChatContext: mock.prepare, maskQuestion: mock.mask, approveQuestion: mock.approve, unmaskChatReply: mock.restore }));
vi.mock('./chatGuard', () => ({ assertChatCurrent: mock.current }));
import { ChatConversation } from './chatFlow';
import type { ChatQuestionPreview } from './chatEngine';

const batch = { docId: 'd', clauses: [] } as ApprovedBatch;
const local = {} as AiBridge;
const context = Object.freeze({ docId: 'd', sessionId: 's', revision: 'r', clauses: Object.freeze([]) }) as ApprovedChatContext;
const preview: ChatQuestionPreview = Object.freeze({ sessionId: 's', revision: 'r', turnId: 't', text: 'What does [PARTY_A] pay?' as CleanText,
  reviewWords: Object.freeze(['What']), needsReview: true });
const ticket = Object.freeze({ ...preview, __brand: 'approvedChatQuestion' }) as ApprovedChatQuestion;
const masked: ChatReply = Object.freeze({ sessionId: 's', docId: 'd', revision: 'r', turnId: 't', status: 'answered',
  answer: '[PARTY_A] pays [AMOUNT_1].', citations: Object.freeze(['c1']), ranOn: 'cloud' });
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }
let bridge: { ask: ReturnType<typeof vi.fn<ChatBridge['ask']>>; clear: ReturnType<typeof vi.fn<ChatBridge['clear']>> };
beforeEach(() => {
  vi.resetAllMocks(); mock.prepare.mockReturnValue(context); mock.mask.mockResolvedValue(preview); mock.approve.mockReturnValue(ticket);
  mock.restore.mockResolvedValue({ ...masked, answer: 'Dana pays $20.' });
  bridge = { ask: vi.fn<ChatBridge['ask']>().mockResolvedValue(masked), clear: vi.fn<ChatBridge['clear']>() };
});
function conversation() { const c = new ChatConversation(batch, local, bridge); c.editQuestion('What does Dana pay?'); return c; }

describe('headless UI conversation lifecycle (mocked engine, no authority)', () => {
  it('requires actual engine context preparation and sanitizes a failure', () => {
    mock.prepare.mockImplementationOnce(() => { throw new Error('PRIVATE_ENGINE_ERROR'); });
    expect(() => conversation()).toThrow('Chat could not complete a confirmed cloud answer. No answer was added.');
    expect(bridge.ask).not.toHaveBeenCalled();
  });
  it('masking only produces a review preview; every send needs a separate approval action', async () => {
    const c = conversation(); await c.approveAndSend(); expect(bridge.ask).not.toHaveBeenCalled();
    await c.prepare(); expect(c.getSnapshot()).toMatchObject({ phase: 'review', preview });
    expect(mock.mask).toHaveBeenCalledWith(context, 'What does Dana pay?', local);
    expect(mock.approve).not.toHaveBeenCalled(); expect(bridge.ask).not.toHaveBeenCalled();
    await c.approveAndSend(); expect(mock.approve).toHaveBeenCalledWith(context, preview, { reviewed: true });
    expect(bridge.ask).toHaveBeenCalledWith(context, ticket);
    expect(c.getSnapshot()).toMatchObject({ phase: 'editing', question: '', messages: [{ question: 'What does Dana pay?', answer: 'Dana pays $20.', citations: ['c1'] }] });
    expect(masked.answer).toBe('[PARTY_A] pays [AMOUNT_1].');
  });
  it('never hands restored display messages or raw question strings to the cloud bridge', async () => {
    const c = conversation(); await c.prepare(); await c.approveAndSend();
    c.editQuestion('What about Dana?'); await c.prepare(); await c.approveAndSend();
    for (const args of bridge.ask.mock.calls) { expect(args).toEqual([context, ticket]); expect(JSON.stringify(args)).not.toContain('Dana'); }
    const state = c.getSnapshot(); expect(Object.isFrozen(state)).toBe(true); expect(Object.isFrozen(state.messages)).toBe(true);
    expect(Object.isFrozen(state.messages[0])).toBe(true); expect(Object.isFrozen(state.messages[0]!.citations)).toBe(true);
  });
  it('editing a preview discards its approval path', async () => {
    const c = conversation(); await c.prepare(); c.editQuestion('A different question'); await c.approveAndSend();
    expect(c.getSnapshot().preview).toBeUndefined(); expect(mock.approve).not.toHaveBeenCalled(); expect(bridge.ask).not.toHaveBeenCalled();
  });
  it('editing while local masking is pending discards the old preview', async () => {
    const pending = deferred<ChatQuestionPreview>(); mock.mask.mockReturnValueOnce(pending.promise);
    const c = conversation(), masking = c.prepare(); c.editQuestion('Newer question'); pending.resolve(preview); await masking;
    expect(c.getSnapshot()).toMatchObject({ phase: 'editing', question: 'Newer question' }); expect(c.getSnapshot().preview).toBeUndefined();
  });
  it.each(['', 'x'.repeat(2001)])('bounds raw input before local processing', async text => {
    const c = conversation(); c.editQuestion(text); await c.prepare(); expect(c.getSnapshot().phase).toBe('error');
    expect(mock.mask).not.toHaveBeenCalled(); expect(bridge.ask).not.toHaveBeenCalled();
  });
  it('reports ambiguity without approving or sending', async () => {
    mock.mask.mockRejectedValueOnce(new ChatError('ambiguous_entity')); const c = conversation(); await c.prepare();
    expect(c.getSnapshot().error).toContain('Use the full name'); expect(mock.approve).not.toHaveBeenCalled(); expect(bridge.ask).not.toHaveBeenCalled();
  });
  it('blocks duplicate sends and editing while a turn is in flight', async () => {
    const pending = deferred<ChatReply>(); bridge.ask.mockReturnValueOnce(pending.promise); const c = conversation(); await c.prepare();
    const asking = c.approveAndSend(); await c.approveAndSend(); expect(c.editQuestion('new')).toBe(false);
    expect(bridge.ask).toHaveBeenCalledOnce(); pending.resolve(masked); await asking;
  });
  it('does not reuse a preview/ticket or add an answer after failure', async () => {
    bridge.ask.mockRejectedValueOnce(new Error('PRIVATE_PROVIDER_ERROR')); const c = conversation(); await c.prepare(); await c.approveAndSend();
    expect(c.getSnapshot()).toMatchObject({ phase: 'error', messages: [] }); expect(c.getSnapshot().preview).toBeUndefined();
    expect(c.getSnapshot().error).not.toContain('PRIVATE'); await c.approveAndSend(); expect(bridge.ask).toHaveBeenCalledOnce();
  });
  it.each(['masking', 'sending', 'restoring'])('close discards pending %s completion and releases display state', async stage => {
    const c = conversation(); let finish!: () => void; let work: Promise<void>;
    if (stage === 'masking') { const p = deferred<ChatQuestionPreview>(); mock.mask.mockReturnValueOnce(p.promise); work = c.prepare(); finish = () => p.resolve(preview); }
    else {
      await c.prepare();
      if (stage === 'sending') { const p = deferred<ChatReply>(); bridge.ask.mockReturnValueOnce(p.promise); work = c.approveAndSend(); finish = () => p.resolve(masked); }
      else { const p = deferred<ChatReply>(); mock.restore.mockReturnValueOnce(p.promise); work = c.approveAndSend(); await vi.waitFor(() => expect(mock.restore).toHaveBeenCalledOnce()); finish = () => p.resolve({ ...masked, answer: 'PRIVATE_LATE_DISPLAY' }); }
    }
    c.close(); finish(); await work;
    expect(c.getSnapshot()).toEqual({ phase: 'closed', question: '', messages: [] }); expect(bridge.clear).toHaveBeenCalledWith(context);
    expect(c.editQuestion('new')).toBe(false); await c.prepare(); await c.approveAndSend(); c.close(); expect(bridge.clear).toHaveBeenCalledOnce();
  });
  it('checks the current engine revision again after asynchronous restoration', async () => {
    mock.current.mockImplementationOnce(() => {}).mockImplementationOnce(() => { throw new ChatError('stale'); });
    const c = conversation(); await c.prepare(); await c.approveAndSend();
    expect(c.getSnapshot().phase).toBe('error'); expect(c.getSnapshot().messages).toEqual([]); expect(mock.current).toHaveBeenCalledTimes(2);
  });
  it('rejects a restored result belonging to a different turn', async () => {
    mock.restore.mockResolvedValueOnce({ ...masked, turnId: 'other' }); const c = conversation(); await c.prepare(); await c.approveAndSend();
    expect(c.getSnapshot().messages).toEqual([]); expect(c.getSnapshot().phase).toBe('error');
  });
  it('notifies and unsubscribes without changing snapshot identity on reads', () => {
    const c = conversation(), listener = vi.fn(), unsubscribe = c.subscribe(listener), snapshot = c.getSnapshot();
    expect(c.getSnapshot()).toBe(snapshot); c.editQuestion('new'); expect(listener).toHaveBeenCalledOnce(); unsubscribe(); c.editQuestion('another'); expect(listener).toHaveBeenCalledOnce();
  });
});
