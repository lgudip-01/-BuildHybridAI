import { ChatError, type ApprovedChatContext, type ApprovedChatQuestion, type ChatReply, type MaskedQuestionDraft } from '@clause-guard/core/chat';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';

/** Proposed concrete UI shape for the review-word list confirmed in #13. */
export type ChatQuestionPreview = MaskedQuestionDraft & {
  readonly reviewWords: readonly string[];
  readonly needsReview: boolean;
};

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
