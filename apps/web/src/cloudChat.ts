import { getGenerativeModel, InferenceMode, InferenceSource, Schema, type AI } from 'firebase/ai';
import { ANALYSIS_MODEL } from '@clause-guard/core/analysis';
import { CHAT_LIMITS, CHAT_PROMPT, ChatError } from '@clause-guard/core/chat';
import { ApprovedChatDispatcher } from './chatDispatch';
import { loadAnalysisConfig } from './analysisConfig';

// Fixed verified no-billing model. A bounded 3.1 comparison also returned INTERNAL;
// no alternate model, automatic fallback or remote selector is enabled.
export const WEB_CHAT_MODEL = ANALYSIS_MODEL;
const quotaPaused = new WeakSet<object>();

const responseSchema = Schema.object({ properties: {
  status: Schema.enumString({ enum: ['answered', 'insufficient_context'] }),
  answer: Schema.string(), citations: Schema.array({ items: Schema.string(), maxItems: CHAT_LIMITS.citations }),
} });

/** Use only the App-Check-protected AI from initFirebase(). No new app or provider. */
export class CloudChatBridge extends ApprovedChatDispatcher {
  constructor(ai: AI) {
    super(ai.app, {
      loadConfig: () => {
        if (quotaPaused.has(ai.app)) throw new ChatError('quota_exhausted');
        return loadAnalysisConfig(ai.app);
      },
      prepare: () => {
        const model = getGenerativeModel(ai, { mode: InferenceMode.ONLY_IN_CLOUD,
          inCloudParams: { model: WEB_CHAT_MODEL, systemInstruction: CHAT_PROMPT,
            generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema, maxOutputTokens: 3072 } },
        }, { timeout: CHAT_LIMITS.timeoutMs });
        return (payload, signal) => model.generateContent(payload, { signal }).then(result => ({
          source: result.response.inferenceSource === InferenceSource.IN_CLOUD ? 'cloud' : undefined,
          text: () => result.response.text(),
        })).catch(error => {
          // Read numeric SDK status only; messages/causes can echo request data.
          const status = error?.customErrorData?.status;
          if (status === 429) { quotaPaused.add(ai.app); throw new ChatError('quota_exhausted'); }
          if (typeof status === 'number' && status >= 500 && status <= 599) throw new ChatError('provider_unavailable');
          throw error;
        });
      },
    });
  }
}
