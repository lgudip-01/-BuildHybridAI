import type { FirebaseApp } from 'firebase/app';
import { getGenerativeModel, InferenceMode, InferenceSource, Schema, type AI } from 'firebase/ai';
import { ANALYSIS_MODEL, validateBatch } from '@clause-guard/core/analysis';
import {
  CHAT_LIMITS, CHAT_PROMPT, ChatError, chatPlaceholders, sanitizeChatError, validateChatContent,
  type ApprovedChatContext, type ApprovedChatQuestion, type ChatBridge, type ChatReply, type MaskedChatContent,
} from '@clause-guard/core/chat';
import { assertChatApproved, assertChatCurrent, consumeChatQuestion } from './chatGuard';
import { loadAnalysisConfig } from './analysisConfig';

type Turn = { question: string; reply: MaskedChatContent };
type Session = { turns: Turn[]; chars: number; busy: boolean; closed: boolean; pending?: AbortController };
// Shared by bridge instances for an app; history cannot fork through a new wrapper.
// Identity-bound weak keys: copied metadata cannot retrieve another session.
const apps = new WeakMap<FirebaseApp, WeakMap<ApprovedChatContext, Session>>();
const responseSchema = Schema.object({ properties: {
  status: Schema.enumString({ enum: ['answered', 'insufficient_context'] }),
  answer: Schema.string(), citations: Schema.array({ items: Schema.string(), maxItems: CHAT_LIMITS.citations }),
} });
const offline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
const turnSize = (turn: Turn) => turn.question.length + turn.reply.answer.length +
  turn.reply.status.length + turn.reply.citations.reduce((sum, id) => sum + id.length, 0);

/** No raw question overload, restored text input, public history setter or engine bypass. */
export class CloudChatBridge implements ChatBridge {
  constructor(private readonly ai: AI) {}

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
      const config = await Promise.race([loadAnalysisConfig(this.ai.app), aborted]);
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
      // Require the App-Check-protected AI from initFirebase(); never initialize
      // another provider, persist a provider chat session, or enable tools here.
      const model = getGenerativeModel(this.ai, { mode: InferenceMode.ONLY_IN_CLOUD,
        inCloudParams: { model: ANALYSIS_MODEL, systemInstruction: CHAT_PROMPT,
          generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema, maxOutputTokens: 3072 } },
      }, { timeout: CHAT_LIMITS.timeoutMs });
      if (state.closed) throw new ChatError('stale');
      if (controller.signal.aborted) throw new ChatError('model_error');
      if (offline()) throw new ChatError('offline');
      // NO await between atomic engine authorization/consumption and dispatch.
      consumeChatQuestion(context, question);
      consumed = true;
      const result = await Promise.race([model.generateContent(payload, { signal: controller.signal }), aborted]);
      current();
      if (controller.signal.aborted) throw new ChatError('model_error');
      if (result.response.inferenceSource !== InferenceSource.IN_CLOUD) throw new ChatError('invalid_response');
      let text: string;
      try { text = result.response.text(); } catch { throw new ChatError('invalid_response'); }
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
    let contexts = apps.get(this.ai.app);
    if (!contexts) { contexts = new WeakMap(); apps.set(this.ai.app, contexts); }
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
