import { assertApproved } from './approvalGuard';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { AiBridge, AnalyzeResult, ApprovedBatch, OnDeviceStatus } from '@clause-guard/core/types';
import { analyzeApprovedNative, type AnalysisPlugin } from './nativeAnalyzer';
import { ScanError, scannedText, type ScanPage } from './scanText';

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
  /**
   * Opens the system document scanner and reads each page's text on the phone. Returns text and line boxes only:
   * page images stay in native memory or the app's cache and are deleted before this resolves or rejects.
   * Rejects with code CANCELED, UNAVAILABLE, PERMISSION_DENIED or SCAN_FAILED.
   */
  scanDocument(): Promise<{ pages: ScanPage[] }>;
  addListener(event: 'downloadProgress', cb: (e: { fraction: number }) => void): Promise<{ remove(): Promise<void> }>;
}

const Native = registerPlugin<ClauseGuardAIPlugin>('ClauseGuardAI');

/** The vault key from the device keystore, for `useExternalKey` in the privacy engine. */
export async function nativeVaultKey(): Promise<Uint8Array> {
  const { key } = await Native.vaultKey();
  return Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
}

/**
 * Scans a paper contract with the phone's camera. Resolves with its text, or null when the user cancels.
 * Fixed messages only: native errors never carry recognized text.
 */
export async function scanContract(): Promise<string | null> {
  let pages: ScanPage[];
  try {
    ({ pages } = await Native.scanDocument());
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (code === 'CANCELED') return null;
    if (code === 'UNAVAILABLE') {
      throw new ScanError('unavailable', Capacitor.getPlatform() === 'ios'
        ? "This device can't run the document scanner. It needs a camera."
        : "Scanning needs Google Play services, which this phone doesn't have or couldn't start.");
    }
    if (code === 'PERMISSION_DENIED') {
      throw new ScanError('permission', 'Camera access is off for Clause Guard. Turn it on in Settings to scan a contract.');
    }
    throw new ScanError('failed', "The scan couldn't be read. Try again.");
  }
  return scannedText(Array.isArray(pages) ? pages : []);
}

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

  /** PREFER_IN_CLOUD in effect: cloud first, then on-device when allowed. Approval is checked around every native call. */
  analyze(batch: ApprovedBatch): Promise<AnalyzeResult> {
    return analyzeApprovedNative(Native, batch);
  }
}
