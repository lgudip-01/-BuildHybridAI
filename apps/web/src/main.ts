// Test page for the privacy engine against real Gemini Nano. The Web app role replaces this with the real UI.
import { mask } from '@clause-guard/core/privacy/mask';
import { classify } from '@clause-guard/core/privacy/onDevice';
import type { Clause, MaskResult } from '@clause-guard/core/types';
import { initAI } from './firebase';
import { WebBridge } from './webBridge';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const status = element<HTMLElement>('status');
const download = element<HTMLButtonElement>('download');
const progress = element<HTMLProgressElement>('progress');
const contract = element<HTMLTextAreaElement>('contract');
const run = element<HTMLButtonElement>('run');
const output = element<HTMLPreElement>('output');

let bridge: WebBridge;
try {
  bridge = new WebBridge(initAI());
} catch (error) {
  status.textContent = 'not configured';
  output.textContent = error instanceof Error ? error.message : String(error);
  run.disabled = true;
  throw error;
}

async function refreshStatus(): Promise<void> {
  const current = await bridge.onDeviceStatus();
  status.textContent = current;
  download.hidden = current !== 'downloadable' && current !== 'downloading';
}

download.addEventListener('click', async () => {
  download.disabled = true;
  progress.hidden = false;
  try {
    await bridge.downloadModel((fraction) => (progress.value = fraction));
  } catch (error) {
    output.textContent = `Download failed: ${String(error)}`;
  } finally {
    download.disabled = false;
    progress.hidden = true;
    await refreshStatus();
  }
});

run.addEventListener('click', async () => {
  run.disabled = true;
  output.textContent = 'Masking…';
  try {
    const clauses: Clause[] = contract.value
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text, index) => ({ id: `c${index + 1}`, index, text }));

    const started = performance.now();
    const result = await mask(crypto.randomUUID(), clauses, bridge);
    const maskMs = performance.now() - started;
    const types = result.ok && !result.needsReview ? await classify(bridge, clauses) : undefined;

    output.textContent = report(result, maskMs, types);
  } catch (error) {
    output.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    run.disabled = false;
  }
});

function report(result: MaskResult, maskMs: number, types?: string[]): string {
  if (!result.ok) {
    return [
      'BLOCKED by the leak check. Nothing would be sent.',
      '',
      ...result.leaks.map((l) => `${l.clauseId}  ${l.reason}: …${l.snippet}…`),
    ].join('\n');
  }
  return [
    `Masked in ${Math.round(maskMs)} ms. ${result.needsReview ? 'NEEDS REVIEW: masked without the on-device model.' : 'Masked with the on-device model.'}`,
    '',
    'What would be sent to the cloud:',
    ...result.clauses.map((c, i) => `\n${c.id}${types ? ` [${types[i]}]` : ''}\n${c.text}`),
    '',
    'Privacy ledger:',
    ...result.ledger.map((e) => `${e.placeholder.padEnd(14)} ${e.kind.padEnd(8)} ${e.clauseIds.join(', ')}`),
  ].join('\n');
}

await refreshStatus();
