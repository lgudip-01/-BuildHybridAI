import type { AiBridge, OnDeviceStatus } from '@clause-guard/core/types';
import {
  getGenerativeModel,
  InferenceMode,
  type AI,
  type GenerativeModel,
  type LanguageModelCreateOptions,
} from 'firebase/ai';

// Text only. The SDK's default also asks for image input, which needs Chrome's multimodal flag.
const CREATE_OPTIONS: LanguageModelCreateOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

type ChromeLanguageModel = { availability(options?: LanguageModelCreateOptions): Promise<OnDeviceStatus> };

/** AiBridge for Chrome: Gemini Nano through Firebase AI Logic. */
export class WebBridge implements AiBridge {
  // Chrome takes the JSON schema when the model is created, not per prompt, so there is one model per schema.
  private readonly models = new Map<object | undefined, GenerativeModel>();

  constructor(private readonly ai: AI) {}

  async onDeviceStatus(): Promise<OnDeviceStatus> {
    const api = (globalThis as { LanguageModel?: ChromeLanguageModel }).LanguageModel;
    return api ? api.availability(CREATE_OPTIONS) : 'unavailable';
  }

  /** Starts or joins the model download. Chrome only allows this from a user gesture, such as a click. */
  async downloadModel(onProgress: (fraction: number) => void): Promise<void> {
    await this.model().initializeDeviceModel(onProgress);
  }

  async onDevice(prompt: string, schema?: object): Promise<string> {
    const result = await this.model(schema).generateContent(prompt);
    return result.response.text();
  }

  async analyze(): Promise<never> {
    throw new Error('analyze() is part of the Cloud AI role and is not built yet');
  }

  private model(schema?: object): GenerativeModel {
    let model = this.models.get(schema);
    if (!model) {
      model = getGenerativeModel(this.ai, {
        mode: InferenceMode.ONLY_ON_DEVICE,
        onDeviceParams: {
          createOptions: CREATE_OPTIONS,
          ...(schema && { promptOptions: { responseConstraint: schema } }),
        },
      });
      this.models.set(schema, model);
    }
    return model;
  }
}
