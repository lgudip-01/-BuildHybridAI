import { CHAT_LIMITS, ChatError, sanitizeChatError, type ApprovedChatContext, type ChatBridge, type ChatReply } from '@clause-guard/core/chat';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';
import { approveQuestion, closeChatContext, maskQuestion, prepareChatContext, unmaskChatReply, type ChatQuestionPreview } from './chatEngine';
import { assertChatCurrent } from './chatGuard';

/** Display-only values: never accepted as transport input or transport history. */
export type ChatMessage = Readonly<{
  question: string; answer: string; status: ChatReply['status'];
  citations: readonly string[]; ranOn: 'cloud';
}>;
export type ChatSnapshot = Readonly<{
  phase: 'editing' | 'masking' | 'review' | 'sending' | 'error' | 'closed';
  question: string;
  preview?: ChatQuestionPreview;
  messages: readonly ChatMessage[];
  error?: string;
}>;

/**
 * Headless UI lifecycle shared by web/iOS/Android; subscribe with
 * useSyncExternalStore. The engine alone prepares/masks/approves/restores.
 * No render code, Firebase setup, automatic send or production mock answers.
 */
export class ChatConversation {
  private readonly context: ApprovedChatContext;
  private state: ChatSnapshot = Object.freeze({ phase: 'editing', question: '', messages: Object.freeze([]) });
  private listeners = new Set<() => void>();
  private generation = 0;

  constructor(batch: ApprovedBatch, private readonly local: AiBridge, private readonly cloud: ChatBridge) {
    try { this.context = prepareChatContext(batch); } catch (error) { throw sanitizeChatError(error); }
  }
  getSnapshot = (): ChatSnapshot => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(state: ChatSnapshot): void {
    this.state = Object.freeze(state);
    this.listeners.forEach(listener => listener());
  }
  private fail(error: unknown, question: string, messages: readonly ChatMessage[]): void {
    const safe = sanitizeChatError(error);
    if (safe.code === 'stale' || safe.code === 'wrong_session') {
      this.close();
      this.update({ ...this.state, error: safe.message });
      return;
    }
    this.update({ phase: 'error', question, messages, error: safe.message });
  }
  editQuestion(question: string): boolean {
    if (this.state.phase === 'closed' || this.state.phase === 'sending' || question === this.state.question) return false;
    ++this.generation;
    this.update({ phase: 'editing', question, messages: this.state.messages });
    return true;
  }
  /** Local masking only; completion must never approve or send automatically. */
  async prepare(): Promise<void> {
    if (['closed', 'sending', 'masking'].includes(this.state.phase)) return;
    const { question, messages } = this.state;
    if (!question.trim() || question.length > CHAT_LIMITS.question) {
      this.update({ phase: 'error', question, messages, error: 'Enter a question of at most 2,000 characters.' });
      return;
    }
    const generation = ++this.generation;
    this.update({ phase: 'masking', question, messages });
    try {
      const preview = await maskQuestion(this.context, question, this.local);
      if (generation !== this.generation) return;
      this.update({ phase: 'review', question, messages, preview });
    } catch (error) {
      if (generation === this.generation) this.fail(error, question, messages);
    }
  }
  /** Bind ONLY to the explicit per-question masked-preview approval action. */
  async approveAndSend(): Promise<void> {
    const current = this.state;
    if (current.phase !== 'review' || !current.preview) return;
    const generation = ++this.generation;
    this.update({ phase: 'sending', question: current.question, messages: current.messages });
    try {
      const ticket = approveQuestion(this.context, current.preview, { reviewed: true });
      const masked = await this.cloud.ask(this.context, ticket);
      if (generation !== this.generation) return;
      assertChatCurrent(this.context, ticket);
      const restored = await unmaskChatReply(this.context, ticket, masked);
      if (generation !== this.generation) return;
      assertChatCurrent(this.context, ticket);
      if (restored.sessionId !== this.context.sessionId || restored.docId !== this.context.docId ||
          restored.revision !== this.context.revision || restored.turnId !== ticket.turnId || restored.ranOn !== 'cloud') {
        throw new ChatError('invalid_response');
      }
      const message: ChatMessage = Object.freeze({ question: current.question, answer: restored.answer,
        status: restored.status, citations: Object.freeze([...restored.citations]), ranOn: 'cloud' });
      this.update({ phase: 'editing', question: '', messages: Object.freeze([...current.messages, message]) });
    } catch (error) {
      if (generation !== this.generation) return;
      // No ticket/preview survives failure; a retry needs fresh local masking and
      // explicit review. There is no automatic resend of a consumed ticket.
      this.fail(error, current.question, current.messages);
    }
  }
  /** Call before document edit/remask/import/reset, and on view unmount. */
  close(): void {
    if (this.state.phase === 'closed') return;
    ++this.generation;
    try { this.cloud.clear(this.context); } catch {
      // A transport cleanup error must not retain display data or expose an SDK
      // error. Local generation invalidation still discards every completion.
    } finally {
      try { closeChatContext(this.context); } catch { /* Unbound engine/cleanup cannot retain UI state. */ }
      this.update({ phase: 'closed', question: '', messages: Object.freeze([]) });
    }
  }
}
