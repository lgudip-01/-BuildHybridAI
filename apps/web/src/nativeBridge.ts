import { registerPlugin } from '@capacitor/core';
import type { AiBridge, Analysis, MaskedClause, OnDeviceStatus } from '@clause-guard/core/types';

/** Native plugin implemented in Kotlin (Android) and Swift (iOS): apps/mobile/plugins/clause-guard-ai. */
interface ClauseGuardAIPlugin {
  onDeviceStatus(): Promise<{ status: OnDeviceStatus }>;
  /** Starts the model download if needed. Resolves when it is available. Progress arrives as 'downloadProgress' events. */
  downloadModel(): Promise<void>;
  /** The only call that carries raw contract text. Runs ONLY_ON_DEVICE. */
  onDevice(options: { prompt: string; schema?: object }): Promise<{ text: string }>;
  /** PREFER_IN_CLOUD. Receives leak-checked text only. */
  analyze(options: { clauses: MaskedClause[] }): Promise<{ results: Analysis[]; ranOn: 'cloud' | 'device' }>;
  addListener(event: 'downloadProgress', cb: (e: { fraction: number }) => void): Promise<{ remove(): Promise<void> }>;
}

const Native = registerPlugin<ClauseGuardAIPlugin>('ClauseGuardAI');

/** AiBridge for the Android and iOS apps. Same contract as WebBridge, backed by the native plugin. */
export class NativeBridge implements AiBridge {
  async onDeviceStatus(): Promise<OnDeviceStatus> {
    return (await Native.onDeviceStatus()).status;
  }

  async downloadModel(onProgress: (fraction: number) => void): Promise<void> {
    const sub = await Native.addListener('downloadProgress', (e) => onProgress(e.fraction));
    try {
      await Native.downloadModel();
    } finally {
      await sub.remove();
    }
  }

  async onDevice(prompt: string, schema?: object): Promise<string> {
    return (await Native.onDevice({ prompt, schema })).text;
  }

  analyze(clauses: MaskedClause[]) {
    return Native.analyze({ clauses });
  }
}
