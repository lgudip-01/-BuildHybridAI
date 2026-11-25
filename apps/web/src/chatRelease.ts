import { ChatError } from '@clause-guard/core/chat';

/**
 * Native chat stays disabled until its SDK/device release checks pass.
 * Web chat uses the shared dispatcher with real engine authorization.
 * No environment flag, caller option or UI boolean can enable sending.
 * Transport tests may mock this stop; it never issues approval or tickets.
 */
export function assertChatEgressEnabled(): void {
  throw new ChatError('release_pending');
}
