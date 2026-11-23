import { ChatError, type ApprovedChatContext, type ApprovedChatQuestion, type ChatQuestionPreview, type ChatReply } from '@clause-guard/core/chat';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';

export type { ChatQuestionPreview } from '@clause-guard/core/chat';

// Activation seam only. Replace with direct real engine exports after owner
// delivery/review. No local ticket issuer, vault access or simulated masking.
export function prepareChatContext(_batch: ApprovedBatch): ApprovedChatContext { throw new ChatError('not_approved'); }
export async function maskQuestion(_context: ApprovedChatContext, _raw: string, _bridge: AiBridge): Promise<ChatQuestionPreview> {
  throw new ChatError('not_approved');
}
export function approveQuestion(_context: ApprovedChatContext, _draft: ChatQuestionPreview, _options: { reviewed: true }): ApprovedChatQuestion {
  throw new ChatError('not_approved');
}
/** Returns a NEW locally restored display object. Never mutate the masked reply. */
export async function unmaskChatReply(_context: ApprovedChatContext, _question: ApprovedChatQuestion, _reply: ChatReply): Promise<ChatReply> {
  throw new ChatError('not_approved');
}
/** Candidate engine cleanup seam; still fails closed pending real binding/review. */
export function closeChatContext(_context: ApprovedChatContext): void { throw new ChatError('not_approved'); }
