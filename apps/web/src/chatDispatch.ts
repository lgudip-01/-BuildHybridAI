import { ANALYSIS_MODEL, validateBatch } from '@clause-guard/core/analysis';
import {
  CHAT_LIMITS, ChatError, chatPlaceholders, sanitizeChatError, validateChatContent,
  type ApprovedChatContext, type ApprovedChatQuestion, type ChatBridge, type ChatReply, type MaskedChatContent,
} from '@clause-guard/core/chat';
import { assertChatApproved, assertChatCurrent, consumeChatQuestion } from './chatGuard';

/** Transport implementations cannot issue approval; the engine checks below are unconditional. */
export interface ChatTransport {
  loadConfig(): Promise<{ enabled: boolean; model: string }>;
  /** Synchronous setup only. The returned call must dispatch synchronously before its first await. */
  prepare(): (payload: string, signal: AbortSignal) => Promise<{ source: unknown; text(): string }>;
}
type Turn = { question: string; reply: MaskedChatContent };
type Session = { turns: Turn[]; chars: number; busy: boolean; closed: boolean; pending?: AbortController };
// Shared by bridge instances for an app; history cannot fork through a new wrapper.
// Identity-bound weak keys: copied metadata cannot retrieve another session.
const apps = new WeakMap<object, WeakMap<ApprovedChatContext, Session>>();
const offline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
const turnSize = (turn: Turn) => turn.question.length + turn.reply.answer.length +
  turn.reply.status.length + turn.reply.citations.reduce((sum, id) => sum + id.length, 0);

/** No raw question overload, restored text input, public history setter or engine bypass. */
export class ApprovedChatDispatcher implements ChatBridge {
  constructor(private readonly owner: object, private readonly transport: ChatTransport) {}

  async ask(context: ApprovedChatContext, question: ApprovedChatQuestion): Promise<ChatReply> {
    // FIRST operation, before config, metadata access, model setup or session lookup.
    try { assertChatApproved(context, question); } catch (error) { throw sanitizeChatError(error); }
    try { validateInput(context, question); } catch (error) { throw sanitizeChatError(error); }
    const state = this.state(context);
    if (state.closed) throw new ChatError('stale');
    if (state.busy) throw new ChatError('busy');
    if (state.turns.length >= CHAT_LIMITS.turns || state.chars + question.text.length > CHAT_LIMITS.history) throw new ChatError('history_limit');
    if (offline()) throw new ChatError('offline');
    state.busy = true; // Before the first await; UI locking alone is insufficient.
    let consumed = false;
    const controller = new AbortController();
    state.pending = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const current = () => {
      if (state.closed) throw new ChatError('stale');
      assertChatCurrent(context, question);
    };
    // Bound the complete operation, even if SDK setup/config hangs or ignores abort.
    let rejectAbort!: (error: ChatError) => void;
    const aborted = new Promise<never>((_, reject) => { rejectAbort = reject; });
    const onAbort = () => rejectAbort(new ChatError(state.closed ? 'stale' : 'model_error'));
    controller.signal.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => controller.abort(), CHAT_LIMITS.timeoutMs);
    try {
      const config = await Promise.race([this.transport.loadConfig(), aborted]);
      if (state.closed) throw new ChatError('stale');
      assertChatApproved(context, question);
      if (!config.enabled || config.model !== ANALYSIS_MODEL) throw new ChatError('model_error');
      if (offline()) throw new ChatError('offline');
      const contract = context.clauses.map(clause => ({ id: clause.id, ...(clause.type && { type: clause.type }), text: clause.text }));
      const history = state.turns.flatMap(turn => [
        { role: 'user', text: turn.question },
        { role: 'assistant', content: { status: turn.reply.status, answer: turn.reply.answer, citations: [...turn.reply.citations] } },
      ]);
      const payload = JSON.stringify({ contract, history, question: { text: question.text } });
      const allowed = chatPlaceholders([...contract.map(clause => clause.text), question.text,
        ...state.turns.flatMap(turn => [turn.question, turn.reply.answer])]);
      const clauseIds = new Set(contract.map(clause => clause.id));
      const generate = this.transport.prepare();
      if (state.closed) throw new ChatError('stale');
      if (controller.signal.aborted) throw new ChatError('model_error');
      if (offline()) throw new ChatError('offline');
      // NO await between atomic engine authorization/consumption and dispatch.
      consumeChatQuestion(context, question);
      consumed = true;
      const result = await Promise.race([generate(payload, controller.signal), aborted]);
      current();
      if (controller.signal.aborted) throw new ChatError('model_error');
      if (result.source !== 'cloud') throw new ChatError('invalid_response');
      let text: string;
      try { text = result.text(); } catch { throw new ChatError('invalid_response'); }
      const content = validateChatContent(text, allowed, clauseIds);
      const turn = { question: question.text, reply: content };
      const size = turnSize(turn);
      if (state.chars + size > CHAT_LIMITS.history) throw new ChatError('history_limit');
      current();
      // Defensive copies: later UI restoration cannot mutate future model history.
      state.turns.push(turn);
      state.chars += size;
      return Object.freeze({ ...content, citations: Object.freeze([...content.citations]), sessionId: context.sessionId,
        docId: context.docId, revision: context.revision, turnId: question.turnId, ranOn: 'cloud' as const });
    } catch (error) {
      // A remask/clear supersedes a provider/config failure. Consumed tickets use
      // the post-dispatch check, never assertChatApproved() or an automatic resend.
      if (state.closed) throw new ChatError('stale');
      if (consumed) {
        try { current(); } catch (stale) { state.turns = []; state.chars = 0; state.closed = true; throw sanitizeChatError(stale); }
      } else {
        try { assertChatApproved(context, question); } catch (stale) { throw sanitizeChatError(stale); }
      }
      throw sanitizeChatError(error);
    } finally {
      if (timer) clearTimeout(timer);
      controller.signal.removeEventListener('abort', onAbort);
      state.pending = undefined;
      state.busy = false;
    }
  }

  clear(context: ApprovedChatContext): void {
    const state = this.state(context);
    state.closed = true;
    state.turns = [];
    state.chars = 0;
    state.pending?.abort();
  }

  private state(context: ApprovedChatContext): Session {
    let contexts = apps.get(this.owner);
    if (!contexts) { contexts = new WeakMap(); apps.set(this.owner, contexts); }
    let state = contexts.get(context);
    if (!state) { state = { turns: [], chars: 0, busy: false, closed: false }; contexts.set(context, state); }
    return state;
  }
}

function validateInput(context: ApprovedChatContext, question: ApprovedChatQuestion): void {
  if (!context || !question || !Object.isFrozen(context) || !Object.isFrozen(context.clauses) ||
      !Object.isFrozen(question) || !Array.isArray(context.clauses) ||
      !context.clauses.every(clause => clause && Object.isFrozen(clause)) ||
      ![context.sessionId, context.docId, context.revision, question.sessionId, question.revision, question.turnId]
        .every(value => typeof value === 'string' && value.trim() && value.length <= 1000) ||
      typeof question.text !== 'string' || !question.text.trim() || question.text.length > CHAT_LIMITS.question) throw new ChatError('invalid_response');
  if (context.sessionId !== question.sessionId) throw new ChatError('wrong_session');
  if (context.revision !== question.revision) throw new ChatError('stale');
  try { validateBatch(context); } catch { throw new ChatError('invalid_response'); }
  if (context.clauses.some(clause => clause.id.length > 200)) throw new ChatError('invalid_response');
}
