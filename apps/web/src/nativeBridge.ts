import { assertApproved } from './approvalGuard';
import { registerPlugin } from '@capacitor/core';
import type { AiBridge, AnalyzeResult, ApprovedBatch, OnDeviceStatus } from '@clause-guard/core/types';
import { analyzeApprovedNative, type AnalysisPlugin } from './nativeAnalyzer';

/** Native plugin implemented in Kotlin (Android) and Swift (iOS): apps/mobile/plugins/clause-guard-ai. */
interface ClauseGuardAIPlugin extends AnalysisPlugin {
  onDeviceStatus(): Promise<{ status: OnDeviceStatus }>;
  /** Starts the model download if needed. Resolves when it is available. Progress arrives as 'downloadProgress' events. */
  downloadModel(): Promise<void>;
  /** The only call that carries raw contract text. Runs ONLY_ON_DEVICE. */
  onDevice(options: { prompt: string; schema?: object }): Promise<{ text: string }>;
  // analyzeClause(request): one masked clause through Firebase AI Logic (cloud first, then on-device). See AnalysisPlugin.
  /** The vault's AES key as base64 (32 bytes). Created on first use and kept in the iOS Keychain or Android Keystore. */
  vaultKey(): Promise<{ key: string }>;
  addListener(event: 'downloadProgress', cb: (e: { fraction: number }) => void): Promise<{ remove(): Promise<void> }>;
}

const Native = registerPlugin<ClauseGuardAIPlugin>('ClauseGuardAI');

const LOCAL_READ_DEADLINE_MS = 30_000;
// The plugin is shared across bridge instances. Keep the fence until the native
// request actually settles: a caller timeout does not cancel Apple/Nano work.
let pendingLocalRead: Promise<{ text: string }> | undefined;

class LocalReadUnavailable extends Error {
  constructor(readonly code: 'local_read_timeout' | 'local_read_busy') {
    super(code === 'local_read_timeout'
      ? 'The on-device model did not finish in time.'
      : 'The on-device model is still finishing an earlier read.');
    this.name = 'LocalReadUnavailable';
  }
}

/** The vault key from the device keystore, for `useExternalKey` in the privacy engine. */
export async function nativeVaultKey(): Promise<Uint8Array> {
  const { key } = await Native.vaultKey();
  return Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
}

/** AiBridge for the Android and iOS apps. Same contract as WebBridge, backed by the native plugin. */
export class NativeBridge implements AiBridge {
  async onDeviceStatus(): Promise<OnDeviceStatus> {
    if (pendingLocalRead) return 'unavailable';
    const { status } = await Native.onDeviceStatus();
    return pendingLocalRead ? 'unavailable' : status;
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
    if (pendingLocalRead) throw new LocalReadUnavailable('local_read_busy');
    const request = Native.onDevice({ prompt, schema });
    pendingLocalRead = request;
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new LocalReadUnavailable('local_read_timeout')), LOCAL_READ_DEADLINE_MS);
      const finished = () => {
        clearTimeout(timer);
        if (pendingLocalRead === request) pendingLocalRead = undefined;
      };
      request.then(reply => {
        finished();
        if (typeof reply?.text !== 'string') reject(new Error('The on-device model returned an invalid reply.'));
        else resolve(reply.text);
      }, error => {
        finished();
        reject(error);
      });
    });
  }

  /** PREFER_IN_CLOUD in effect: cloud first, then on-device when allowed. Approval is checked around every native call. */
  analyze(batch: ApprovedBatch): Promise<AnalyzeResult> {
    return analyzeApprovedNative(Native, batch);
  }
}
