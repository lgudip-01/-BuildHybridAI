import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import type { Analysis, CleanText } from '@clause-guard/core/types';
import { sourceQuotedSignatoryReview, sourceQuotedGuaranteeReview } from '@clause-guard/core/analysis';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve } from '@clause-guard/privacy-engine/approval';
import { unmask } from '@clause-guard/privacy-engine/unmask';
import { loadVault, deleteVault } from '@clause-guard/privacy-engine/vault';
import { splitClauses } from './clauses';
const native = vi.hoisted(() => ({ analyzeClause: vi.fn(), onDeviceStatus: vi.fn(async () => ({ status: 'unavailable' })), onDevice: vi.fn() }));
vi.mock('@capacitor/core', () => ({ registerPlugin: () => native }));
import { NativeBridge } from './nativeBridge';
const samples = ['nda', 'freelance', 'lease', 'offer-letter', 'promissory-note', 'saas'];
beforeEach(() => { native.analyzeClause.mockReset(); native.onDevice.mockClear(); });
// Replies are synthetic source echoes, not model/legal-quality evidence.
it.each(samples.flatMap(sample => ['cloud', 'device'].map(source => ({ sample, source }))))(
  '$sample: genuine native-boundary approval/validation/restoration with synthetic $source metadata', async ({ sample, source }) => {
    const text = readFileSync(new URL(`../../../samples/${sample}.txt`, import.meta.url), 'utf8');
    const expected = JSON.parse(readFileSync(new URL(`../../../samples/${sample}.json`, import.meta.url), 'utf8')) as { mask: string[]; keep: string[] };
    const clauses = splitClauses(text);
    const bridge = new NativeBridge();
    const result = await mask(crypto.randomUUID(), clauses, bridge);
    if (!result.ok) throw new Error('Public fixture blocked before synthetic dispatch');
    expect(result.needsReview).toBe(true);
    expect(result.modelReadClauses).toBe(0);
    expect(() => approve(result)).toThrow();
    expect(native.analyzeClause).not.toHaveBeenCalled();
    const masked = result.clauses.map(c => c.text).join('\n').toLowerCase();
    for (const value of expected.mask) expect(masked).not.toContain(value.toLowerCase());
    for (const value of expected.keep) expect(masked).toContain(value.toLowerCase());
    const entries = await loadVault(result.docId);
    expect(entries).toBeTruthy();
    expect(Object.keys(entries!)).not.toHaveLength(0);
    native.analyzeClause.mockImplementation(async request => {
      const clause = JSON.parse(request.input) as { id: string; text: CleanText };
      expect(Object.keys(clause).sort()).toEqual(['id', 'text']);
      expect(request.pin).toBe(native.analyzeClause.mock.calls.length === 1 ? null : source);
      for (const value of expected.mask) expect(request.input.toLowerCase()).not.toContain(value.toLowerCase());
      const answer: Analysis = { clauseId: clause.id, risk: 'medium',
        explanation: sourceQuotedSignatoryReview(clause.text) ?? sourceQuotedGuaranteeReview(clause.text) ?? clause.text,
        redline: '', questions: [] };
      return { source, text: JSON.stringify(answer) };
    });
    const batch = approve(result, { reviewed: true });
    const answer = await bridge.analyze(batch);
    expect(answer.failed).toEqual([]);
    expect(answer.results).toHaveLength(clauses.length);
    expect(answer.ranOn).toBe(source);
    expect(native.analyzeClause).toHaveBeenCalledTimes(clauses.length);
    expect(native.onDevice).not.toHaveBeenCalled();
    const restored = await unmask(result.docId, answer.results);
    const restore = (value: string) => value.replace(/\[[A-Z]+_\d+\]/g, token => entries![token] ?? token);
    expect(restored.map(value => value.explanation)).toEqual(answer.results.map(value => restore(value.explanation)));
    for (const value of restored) expect(value.explanation).not.toMatch(/\[[A-Z]+_\d+\]/);
    await deleteVault(result.docId);
    native.analyzeClause.mockClear();
    await expect(bridge.analyze(batch)).rejects.toMatchObject({ code: 'stale' });
    expect(native.analyzeClause).not.toHaveBeenCalled();
  });
