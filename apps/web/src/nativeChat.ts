import { registerPlugin } from '@capacitor/core';
import { ANALYSIS_MODEL } from '@clause-guard/core/analysis';
import { CHAT_LIMITS, CHAT_PROMPT } from '@clause-guard/core/chat';
import { ApprovedChatDispatcher } from './chatDispatch';
import { DEFAULT_ANALYSIS_CONFIG } from './analysisConfig';

/** Swift/Kotlin contract: cloud only, stateless, no native/provider history. */
export type NativeChatRequest = {
  system: string;
  input: string;
  schema: object;
  model: string;
  cloudOnly: true;
  timeoutMs: number;
};
export type NativeChatResponse = { text: string; source: 'cloud' };
export interface NativeChatPlugin {
  chat(request: NativeChatRequest): Promise<NativeChatResponse>;
}

const Native = registerPlugin<NativeChatPlugin>('ClauseGuardAI');
const schema = Object.freeze({ type: 'object', properties: {
  status: { type: 'string', enum: ['answered', 'insufficient_context'] },
  answer: { type: 'string' },
  citations: { type: 'array', items: { type: 'string' }, maxItems: CHAT_LIMITS.citations },
}, required: ['status', 'answer', 'citations'], additionalProperties: false });

/**
 * Same approval, masked projection, deadlines and history as web. No web Firebase
 * initialization on phones. Native chat() must verify actual cloud execution;
 * neither the request's cloudOnly flag nor a missing source is a confirmation.
 * JS clear/timeout discards late native completion; it cannot recall server work.
 */
export class NativeChatBridge extends ApprovedChatDispatcher {
  constructor() {
    super(Native, {
      loadConfig: async () => DEFAULT_ANALYSIS_CONFIG,
      prepare: () => (input, _signal) => Native.chat({
        system: CHAT_PROMPT, input, schema, model: ANALYSIS_MODEL,
        cloudOnly: true, timeoutMs: CHAT_LIMITS.timeoutMs,
      }).then(reply => ({ source: reply?.source, text: () => reply?.text })),
    });
  }
}
