import { afterEach, expect, it, vi } from 'vitest';
import type { AiBridge } from '@clause-guard/core/types';
import { evaluateClassification, CLASSIFICATION_LIMITS, type ClassificationCase } from './classificationEvaluation';
import { publicClassificationCases } from './classificationDiagnostic';

const cases: ClassificationCase[] = [1, 2].map(n => ({ sample: 'public', group: 'prior-mismatch',
  clause: { id: `c${n}`, index: n - 1, text: 'Acme LLC owns the work product.' }, expected: ['ip'] }));
function bridge(): AiBridge {
  return { onDeviceStatus: vi.fn(async () => 'available' as const),
    onDevice: vi.fn(async () => JSON.stringify({ type: 'payment', entities: [{ text: 'Acme LLC', kind: 'organization', party: true }] })),
    analyze: vi.fn() };
}
afterEach(() => vi.useRealTimers());

it('preserves actual mismatches and reports counts without source/entity values or cloud dispatch', async () => {
  const ai = bridge(), progress = vi.fn();
  const result = await evaluateClassification(cases, ai, progress);
  expect(result.status).toBe('complete');
  expect(result.rows.map(r => [r.actual, r.matched, r.entityCount])).toEqual([['payment', false, 1], ['payment', false, 1]]);
  expect(progress).toHaveBeenCalledTimes(2);
  expect(JSON.stringify(result)).not.toContain('Acme');
  expect(ai.onDevice).toHaveBeenCalledTimes(2);
  expect(ai.analyze).not.toHaveBeenCalled();
});

it('never dispatches when the local model is unavailable', async () => {
  const ai = bridge(); ai.onDeviceStatus = vi.fn<AiBridge['onDeviceStatus']>(async () => 'unavailable');
  expect(await evaluateClassification(cases, ai)).toEqual({ status: 'unavailable', rows: [] });
  expect(ai.onDevice).not.toHaveBeenCalled();
});

it('stops after timeout and ignores a late SDK completion without another dispatch', async () => {
  vi.useFakeTimers();
  const ai = bridge(); let finish!: (value: string) => void;
  ai.onDevice = vi.fn<AiBridge['onDevice']>(() => new Promise<string>(resolve => { finish = resolve; }));
  const pending = evaluateClassification(cases, ai);
  await vi.advanceTimersByTimeAsync(CLASSIFICATION_LIMITS.readMs);
  const result = await pending;
  expect(result).toEqual({ status: 'stopped', rows: [], stop: 'local_timeout' });
  finish('{"type":"ip","entities":[]}'); await vi.advanceTimersByTimeAsync(1);
  expect(result.rows).toEqual([]);
  expect(ai.onDevice).toHaveBeenCalledTimes(1);
  expect(ai.analyze).not.toHaveBeenCalled();
});

it.each([
  ['malformed', '{"entities":', 'local_read_failed'],
  ['missing entities', '{"type":"ip"}', 'local_read_failed'],
  ['invalid type', '{"type":"invented","entities":[]}', 'invalid_type'],
] as const)('stops safely on %s', async (_, response, stop) => {
  const ai = bridge(); ai.onDevice = vi.fn(async () => response);
  expect(await evaluateClassification(cases, ai)).toEqual({ status: 'stopped', rows: [], stop });
  expect(ai.onDevice).toHaveBeenCalledTimes(1);
});

it('sanitizes SDK errors without dispatching another clause', async () => {
  const ai = bridge(); vi.mocked(ai.onDevice).mockRejectedValueOnce(new Error('Acme secret SDK detail'));
  expect(await evaluateClassification(cases, ai)).toEqual({ status: 'stopped', rows: [], stop: 'local_read_failed' });
  expect(ai.onDevice).toHaveBeenCalledTimes(1);
});

it('enforces total deadline before dispatching the next clause', async () => {
  vi.useFakeTimers();
  const ai = bridge();
  const result = await evaluateClassification(cases, ai, () => vi.setSystemTime(Date.now() + CLASSIFICATION_LIMITS.totalMs));
  expect(result.status).toBe('stopped'); expect(result.stop).toBe('total_deadline');
  expect(result.rows).toHaveLength(1); expect(ai.onDevice).toHaveBeenCalledTimes(1);
});

it.each([
  [], [...cases, cases[0]!],
  [{ ...cases[0]!, clause: { ...cases[0]!.clause, text: 'x'.repeat(2001) } }],
  Array.from({ length: 18 }, (_, n) => ({ ...cases[0]!, clause: { ...cases[0]!.clause, id: `c${n}` } })),
].map(invalid => ({ invalid })))('rejects invalid bounds before any model work %#', async ({ invalid }) => {
  const ai = bridge(); await expect(evaluateClassification(invalid, ai)).rejects.toThrow('bounded');
  expect(ai.onDeviceStatus).not.toHaveBeenCalled(); expect(ai.onDevice).not.toHaveBeenCalled();
});

it('loads exactly the recorded eleven mismatches and six controls from unchanged public fixtures', async () => {
  const selected = await publicClassificationCases();
  expect(selected).toHaveLength(17);
  expect(selected.filter(c => c.group === 'prior-mismatch')).toHaveLength(11);
  expect(selected.filter(c => c.group === 'control')).toHaveLength(6);
  expect(selected.find(c => c.sample === 'freelance' && c.clause.id === 'c6')?.expected).toEqual(['ip']);
  expect(selected.find(c => c.sample === 'nda' && c.clause.id === 'c2')?.expected).toEqual(['other']);
  expect(selected.every(c => c.clause.text.length > 0 && c.clause.text.length <= 2000)).toBe(true);
});
