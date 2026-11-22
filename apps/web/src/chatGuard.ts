import { ChatError, type ApprovedChatContext, type ApprovedChatQuestion } from '@clause-guard/core/chat';

// Deliberately fail closed until Likhil delivers the real registry-backed chat
// exports agreed in #13. Replace these with direct engine re-exports then.
// No WeakSet, reviewed boolean, token issuer, fallback or injectable authorizer
// exists in production. Tests mock this module; the app does not import chat.
export function assertChatApproved(_context: ApprovedChatContext, _question: ApprovedChatQuestion): void {
  throw new ChatError('not_approved');
}
/** Must perform every approval check and consume atomically in the engine. */
export function consumeChatQuestion(_context: ApprovedChatContext, _question: ApprovedChatQuestion): void {
  throw new ChatError('not_approved');
}
/** Post-dispatch check allows the consumed ticket, but never authorizes a send. */
export function assertChatCurrent(_context: ApprovedChatContext, _question: ApprovedChatQuestion): void {
  throw new ChatError('not_approved');
}
