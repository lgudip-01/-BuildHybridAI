import { ChatError } from '@clause-guard/core/chat';

/**
 * Outbound chat stays disabled until the documented release checks pass.
 * Real engine authorization remains required after this stop is removed.
 * No environment flag, caller option or UI boolean can enable sending.
 * Transport tests may mock this stop; it never issues approval or tickets.
 */
export function assertChatEgressEnabled(): void {
  throw new ChatError('release_pending');
}
