import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHAT_LIMITS, CHAT_PROMPT, ChatError, type ApprovedChatContext, type ApprovedChatQuestion } from '@clause-guard/core/chat';
import { ANALYSIS_MODEL } from '@clause-guard/core/analysis';
import type { CleanText } from '@clause-guard/core/types';
vi.mock('./chatRelease', () => ({ assertChatEgressEnabled: () => {} }));

// Private TEST-ONLY registry. Production chatGuard still rejects every ticket.
const mock = vi.hoisted(() => ({ chat: vi.fn(), contexts: new WeakSet<object>(),
  questions: new WeakMap<object, object>(), consumed: new WeakSet<object>(), stale: new WeakSet<object>(), web: vi.fn() }));
vi.mock('@capacitor/core', () => ({ registerPlugin: () => ({ chat: mock.chat }) }));
vi.mock('./chatGuard', () => ({
  assertChatApproved: (c: object, q: object) => check(c, q, false),
  consumeChatQuestion: (c: object, q: object) => { check(c, q, false); mock.consumed.add(q); },
  assertChatCurrent: (c: object, q: object) => check(c, q, true),
}));
vi.mock('./firebase', () => ({ initAI: mock.web, initFirebase: mock.web }));
import { NativeChatBridge, type NativeChatRequest, type NativeChatResponse } from './nativeChat';

function check(c: object, q: object, consumed: boolean) {
  if (!mock.contexts.has(c) || mock.questions.get(q) !== c) throw new ChatError('not_approved');
  if (mock.stale.has(c)) throw new ChatError('stale');
  if (!consumed && mock.consumed.has(q)) throw new ChatError('turn_consumed');
}
let sequence = 0;
function fixture() {
  const context = Object.freeze({ sessionId: 'PRIVATE_SESSION', docId: 'PRIVATE_DOC', revision: 'PRIVATE_REVISION',
    clauses: Object.freeze([Object.freeze({ id: 'c1', text: '[PARTY_A] pays [AMOUNT_1].' as CleanText, raw: 'PRIVATE_CONTRACT' })]),
    vault: 'PRIVATE_VAULT', restored: 'PRIVATE_RESTORED', filename: 'PRIVATE_FILENAME' });
  mock.contexts.add(context);
  return context;
}
function question(context: ApprovedChatContext, text = 'What does [PARTY_A] pay?') {
  const q = Object.freeze({ sessionId: context.sessionId, revision: context.revision, turnId: `PRIVATE_TURN_${++sequence}`,
    text: text as CleanText, __brand: 'approvedChatQuestion' as const, raw: 'PRIVATE_RAW_QUESTION' });
  mock.questions.set(q, context);
  return q;
}
const response = (): NativeChatResponse => ({ source: 'cloud', text: JSON.stringify({
  status: 'answered', answer: '[PARTY_A] pays [AMOUNT_1].', citations: ['c1'],
}) });
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }
beforeEach(() => {
  vi.clearAllMocks(); mock.contexts = new WeakSet(); mock.questions = new WeakMap(); mock.consumed = new WeakSet(); mock.stale = new WeakSet();
  mock.chat.mockReset().mockResolvedValue(response()); vi.stubGlobal('navigator', { onLine: true });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('native cloud-only chat boundary', () => {
  it('rejects forged and copied tickets before any plugin call', async () => {
    const c = fixture(), q = question(c), bridge = new NativeChatBridge();
    await expect(bridge.ask(c, { ...q })).rejects.toMatchObject({ code: 'not_approved' });
    await expect(bridge.ask({ ...c }, q)).rejects.toMatchObject({ code: 'not_approved' });
    expect(mock.chat).not.toHaveBeenCalled();
  });
  it('consumes atomically before native dispatch and never sends raw metadata', async () => {
    const c = fixture(), q = question(c);
    mock.chat.mockImplementationOnce(async (request: NativeChatRequest) => {
      expect(mock.consumed.has(q)).toBe(true);
      expect(JSON.parse(request.input)).toEqual({ contract: [{ id: 'c1', text: '[PARTY_A] pays [AMOUNT_1].' }],
        history: [], question: { text: q.text } });
      expect(JSON.stringify(request)).not.toContain('PRIVATE_');
      expect(request).toMatchObject({ system: CHAT_PROMPT, model: ANALYSIS_MODEL, cloudOnly: true, timeoutMs: CHAT_LIMITS.timeoutMs });
      expect(Object.keys(request).sort()).toEqual(['cloudOnly', 'input', 'model', 'schema', 'system', 'timeoutMs']);
      expect(request.schema).toMatchObject({ required: ['status', 'answer', 'citations'], additionalProperties: false });
      return response();
    });
    const result = await new NativeChatBridge().ask(c, q);
    expect(result.ranOn).toBe('cloud'); expect(Object.isFrozen(result)).toBe(true);
    expect(mock.web).not.toHaveBeenCalled();
    await expect(new NativeChatBridge().ask(c, q)).rejects.toMatchObject({ code: 'turn_consumed' });
    expect(mock.chat).toHaveBeenCalledOnce();
  });
  it.each(['device', undefined, 'in_cloud'])('rejects an unconfirmed native source %s', async source => {
    mock.chat.mockResolvedValueOnce({ ...response(), source }); const c = fixture();
    await expect(new NativeChatBridge().ask(c, question(c))).rejects.toMatchObject({ code: 'invalid_response' });
  });
  it.each([
    { status: 'answered', answer: '[PERSON_99] pays.', citations: ['c1'] },
    { status: 'answered', answer: 'A fee applies.', citations: ['missing'] },
  ])('applies shared token and exact citation validation to native output', async content => {
    mock.chat.mockResolvedValueOnce({ source: 'cloud', text: JSON.stringify(content) }); const c = fixture();
    await expect(new NativeChatBridge().ask(c, question(c))).rejects.toBeInstanceOf(ChatError);
  });
  it('shares busy/history across wrapper instances and stores only successful masked pairs', async () => {
    const c = fixture(), pending = deferred<NativeChatResponse>(); mock.chat.mockReturnValueOnce(pending.promise);
    const first = new NativeChatBridge().ask(c, question(c)); await vi.waitFor(() => expect(mock.chat).toHaveBeenCalledOnce());
    await expect(new NativeChatBridge().ask(c, question(c))).rejects.toMatchObject({ code: 'busy' });
    pending.resolve(response()); await first;
    const bridge = new NativeChatBridge(); mock.chat.mockRejectedValueOnce(new Error('PRIVATE_ERROR'));
    await expect(bridge.ask(c, question(c, 'What is [EMAIL_9]?'))).rejects.toThrow('Chat could not complete a confirmed cloud answer. No answer was added.');
    await bridge.ask(c, question(c));
    const history = JSON.parse(mock.chat.mock.calls[2]![0].input).history;
    expect(history).toHaveLength(2); expect(JSON.stringify(history)).not.toContain('EMAIL_9');
    expect(history[0]).toEqual({ role: 'user', text: 'What does [PARTY_A] pay?' });
  });
  it('rejects offline with no native call or ticket consumption', async () => {
    vi.stubGlobal('navigator', { onLine: false }); const c = fixture(), q = question(c);
    await expect(new NativeChatBridge().ask(c, q)).rejects.toMatchObject({ code: 'offline' });
    expect(mock.chat).not.toHaveBeenCalled(); expect(mock.consumed.has(q)).toBe(false);
  });
  it('discards a native reply after remasking', async () => {
    const c = fixture(), pending = deferred<NativeChatResponse>(); mock.chat.mockReturnValueOnce(pending.promise);
    const asking = new NativeChatBridge().ask(c, question(c)); await vi.waitFor(() => expect(mock.chat).toHaveBeenCalledOnce());
    mock.stale.add(c); pending.resolve(response()); await expect(asking).rejects.toMatchObject({ code: 'stale' });
  });
  it('clear aborts the JS wait and permanently closes the context, even if native ignores cancellation', async () => {
    const c = fixture(), pending = deferred<NativeChatResponse>(), bridge = new NativeChatBridge(); mock.chat.mockReturnValueOnce(pending.promise);
    const asking = bridge.ask(c, question(c)); await vi.waitFor(() => expect(mock.chat).toHaveBeenCalledOnce());
    bridge.clear(c); await expect(asking).rejects.toMatchObject({ code: 'stale' });
    pending.resolve(response()); await expect(new NativeChatBridge().ask(c, question(c))).rejects.toMatchObject({ code: 'stale' });
    expect(mock.chat).toHaveBeenCalledOnce();
  });
  it('bounds a noncooperative native call and does not replay its consumed ticket', async () => {
    vi.useFakeTimers(); const c = fixture(), q = question(c), pending = deferred<NativeChatResponse>(), bridge = new NativeChatBridge();
    mock.chat.mockReturnValueOnce(pending.promise); const asking = bridge.ask(c, q);
    const rejected = expect(asking).rejects.toMatchObject({ code: 'model_error' });
    await vi.advanceTimersByTimeAsync(CHAT_LIMITS.timeoutMs); await rejected;
    pending.resolve(response()); await Promise.resolve();
    await expect(bridge.ask(c, q)).rejects.toMatchObject({ code: 'turn_consumed' });
    await bridge.ask(c, question(c)); expect(JSON.parse(mock.chat.mock.calls[1]![0].input).history).toEqual([]);
  });
});
