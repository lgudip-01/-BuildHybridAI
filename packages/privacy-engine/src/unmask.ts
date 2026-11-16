import type { Analysis } from '@clause-guard/core/types';
import { PLACEHOLDER } from './placeholders';
import { loadVault } from './vault';

/** Puts the real values back into the cloud's answer. Placeholders the vault doesn't know are left as they are. */
export async function unmask(docId: string, results: Analysis[]): Promise<Analysis[]> {
  const entries = await loadVault(docId);
  if (!entries) throw new Error(`No vault for document ${docId}`);

  const restore = (text: string) =>
    text.replace(PLACEHOLDER, (placeholder) => (Object.hasOwn(entries, placeholder) ? entries[placeholder]! : placeholder));

  return results.map((r) => ({
    ...r,
    explanation: restore(r.explanation),
    redline: restore(r.redline),
    questions: r.questions.map(restore),
  }));
}
