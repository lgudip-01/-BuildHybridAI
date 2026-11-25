import 'fake-indexeddb/auto';
import { expect, it, vi } from 'vitest';
import type { AiBridge } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve } from '@clause-guard/privacy-engine/approval';
import { analyzeApprovedNative, type AnalysisPlugin } from './nativeAnalyzer';

// Actual masking/vault/approval modules, with no Firebase SDK/provider execution.
const local: AiBridge = {
  onDeviceStatus: async () => 'unavailable',
  onDevice: async () => { throw new Error('Local model unavailable in this fixture.'); },
  analyze: async () => { throw new Error('This fixture must not call cloud analysis.'); },
};
const clauses = [
  { id: 'c1', index: 0, text: 'Acme Corp shall pay Dana Reyes $12,500.' },
  { id: 'c2', index: 1, text: 'Dana Reyes will perform the services for Acme Corp.' },
];
async function approved(docId: string) {
  const result = await mask(docId, clauses, local);
  if (!result.ok) throw new Error('Synthetic fixture did not produce an approvable preview.');
  return approve(result, { reviewed: true });
}
const response = (input: string) => {
  const clause = JSON.parse(input);
  return { source: 'cloud' as const, text: JSON.stringify({ clauseId: clause.id,
    risk: 'medium', explanation: 'Review the stated obligations.', redline: '', questions: [] }) };
};

it('accepts genuine engine authority, projects only masked fields and rejects a copied batch', async () => {
  const batch = await approved('native-parity-real-approval');
  const plugin: AnalysisPlugin = { analyzeClause: vi.fn(async request => response(request.input)) };
  const outcome = await analyzeApprovedNative(plugin, batch);
  expect(outcome.failed).toEqual([]);
  expect(outcome.results).toHaveLength(2);
  expect(outcome.ranOn).toBe('cloud');
  const calls = vi.mocked(plugin.analyzeClause).mock.calls;
  for (const [request] of calls) {
    const input = JSON.parse(request.input);
    expect(Object.keys(input).sort()).toEqual(Object.hasOwn(input, 'type') ? ['id', 'text', 'type'] : ['id', 'text']);
    for (const privateValue of ['Acme', 'Dana', 'Reyes', '12,500', batch.docId]) {
      expect(JSON.stringify(request)).not.toContain(privateValue);
    }
  }
  await expect(analyzeApprovedNative(plugin, { ...batch })).rejects.toMatchObject({ code: 'not_approved' });
  expect(plugin.analyzeClause).toHaveBeenCalledTimes(2);
});

it.each([false, true])('stops queued sends when genuine approval is invalidated during a native call (reject=%s)', async reject => {
  const id = `native-parity-stale-${reject}`;
  const batch = await approved(id);
  const plugin: AnalysisPlugin = { analyzeClause: vi.fn(async request => {
    await mask(id, clauses, local);
    if (reject) throw new Error('Synthetic private provider detail');
    return response(request.input);
  }) };
  await expect(analyzeApprovedNative(plugin, batch)).rejects.toMatchObject({ code: 'stale' });
  expect(plugin.analyzeClause).toHaveBeenCalledTimes(1);
});
