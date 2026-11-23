import { getGenerativeModel, InferenceMode, InferenceSource, Schema, type AI } from 'firebase/ai';
import { ANALYSIS_MODEL } from '@clause-guard/core/analysis';
import { CHAT_LIMITS, CHAT_PROMPT } from '@clause-guard/core/chat';
import { ApprovedChatDispatcher } from './chatDispatch';
import { loadAnalysisConfig } from './analysisConfig';

const responseSchema = Schema.object({ properties: {
  status: Schema.enumString({ enum: ['answered', 'insufficient_context'] }),
  answer: Schema.string(), citations: Schema.array({ items: Schema.string(), maxItems: CHAT_LIMITS.citations }),
} });

/** Use only the App-Check-protected AI from initFirebase(). No new app or provider. */
export class CloudChatBridge extends ApprovedChatDispatcher {
  constructor(ai: AI) {
    super(ai.app, {
      loadConfig: () => loadAnalysisConfig(ai.app),
      prepare: () => {
        const model = getGenerativeModel(ai, { mode: InferenceMode.ONLY_IN_CLOUD,
          inCloudParams: { model: ANALYSIS_MODEL, systemInstruction: CHAT_PROMPT,
            generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema, maxOutputTokens: 3072 } },
        }, { timeout: CHAT_LIMITS.timeoutMs });
        return (payload, signal) => model.generateContent(payload, { signal }).then(result => ({
          source: result.response.inferenceSource === InferenceSource.IN_CLOUD ? 'cloud' : undefined,
          text: () => result.response.text(),
        }));
      },
    });
  }
}
