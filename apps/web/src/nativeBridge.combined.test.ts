import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve } from '@clause-guard/privacy-engine/approval';
const native = vi.hoisted(() => ({ analyzeClause: vi.fn(), onDeviceStatus: vi.fn(async () => ({ status: 'unavailable' })), onDevice: vi.fn() }));
vi.mock('@capacitor/core', () => ({ registerPlugin: () => native }));
import { NativeBridge } from './nativeBridge';
beforeEach(() => { native.analyzeClause.mockReset(); native.onDevice.mockClear(); });
const clauses = [{ id: 'c1', index: 0, text: 'Acme Corp pays Dana Reyes $12,500.' }];
async function preview() {
  const bridge = new NativeBridge();
  const result = await mask(crypto.randomUUID(), clauses, bridge);
  if (!result.ok) throw new Error('Expected synthetic masked preview');
  return { bridge, result };
}
function answer(request: { input: string }) {
  const { id } = JSON.parse(request.input);
  return { source: 'cloud', text: JSON.stringify({ clauseId: id, risk: 'medium', explanation: 'Review the stated payment obligation.', redline: '', questions: [] }) };
}
it('routes a genuinely approved batch through the registered plugin with masked projection only', async () => {
  const { bridge, result } = await preview();
  expect(() => approve(result)).toThrow();
  native.analyzeClause.mockImplementation(async request => answer(request));
  const outcome = await bridge.analyze(approve(result, { reviewed: true }));
  expect(outcome.results).toHaveLength(1);
  expect(outcome.ranOn).toBe('cloud');
  expect(native.analyzeClause).toHaveBeenCalledTimes(1);
  expect(native.onDevice).not.toHaveBeenCalled();
  const body = JSON.stringify(native.analyzeClause.mock.calls[0]![0]);
  for (const raw of ['Acme', 'Dana', 'Reyes', '$12,500', result.docId]) expect(body).not.toContain(raw);
  expect(JSON.parse(native.analyzeClause.mock.calls[0]![0].input)).toEqual({ id: 'c1', text: result.clauses[0]!.text });
});
it('rejects fenced replies through the production bridge and retains the confirmed source', async () => {
  const { bridge, result } = await preview();
  native.analyzeClause.mockImplementation(async request => ({ source: 'cloud', text: '```json\n' + answer(request).text + '\n```' }));
  const outcome = await bridge.analyze(approve(result, { reviewed: true }));
  expect(outcome.results).toEqual([]);
  expect(outcome.failed).toMatchObject([{ clauseId: 'c1', reason: 'invalid_response', ranOn: 'cloud' }]);
});
it('rejects stale approval before a registered native call', async () => {
  const { bridge, result } = await preview();
  const batch = approve(result, { reviewed: true });
  await mask(result.docId, clauses, bridge);
  await expect(bridge.analyze(batch)).rejects.toMatchObject({ code: 'stale' });
  expect(native.analyzeClause).not.toHaveBeenCalled();
});
