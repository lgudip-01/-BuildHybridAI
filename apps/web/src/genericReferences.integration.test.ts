import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import type { AiBridge } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve } from '@clause-guard/privacy-engine/approval';
import { maskQuestion, prepareChatContext } from '@clause-guard/privacy-engine/chat';

const samples = ['nda', 'freelance', 'lease', 'offer-letter', 'promissory-note', 'saas'];
it.each(samples.flatMap(sample => [false, true].map(model => ({ sample, model }))))(
  'retains public-fixture privacy and useful wording: $sample (synthetic model: $model)', async ({ sample, model }) => {
    const text = readFileSync(new URL(`../../../samples/${sample}.txt`, import.meta.url), 'utf8');
    const expected = JSON.parse(readFileSync(new URL(`../../../samples/${sample}.json`, import.meta.url), 'utf8')) as { mask: string[]; keep: string[] };
    const clauses = text.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean)
      .map((text, index) => ({ id: `c${index + 1}`, index, text }));
    const analyze = vi.fn<AiBridge['analyze']>();
    const onDevice = vi.fn<AiBridge['onDevice']>(async prompt => JSON.stringify({ type: 'other', entities: [
      { text: 'the Purpose', kind: 'organization', party: false },
      { text: 'Proprietary Information and Inventions Agreement', kind: 'organization', party: false },
    ].filter(e => prompt.includes(e.text)) }));
    const result = await mask(crypto.randomUUID(), clauses, {
      onDeviceStatus: async () => model ? 'available' : 'unavailable', onDevice, analyze,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Public fixture privacy check blocked');
    const preview = result.clauses.map(c => c.text).join('\n').toLowerCase();
    for (const value of expected.mask) expect(preview, `sensitive value: ${value}`).not.toContain(value.toLowerCase());
    for (const value of expected.keep) expect(preview, `required term: ${value}`).toContain(value.toLowerCase());
    if (sample === 'nda') expect(preview).toContain('for the purpose only');
    if (sample === 'offer-letter') expect(preview).toContain('standard proprietary information and inventions agreement');
    expect(analyze).not.toHaveBeenCalled();
    if (!model) expect(onDevice).not.toHaveBeenCalled();
  },
);

it('refuses a shared explicit acronym in chat instead of choosing a company', async () => {
  const bridge: AiBridge = { onDeviceStatus: async () => 'unavailable',
    onDevice: vi.fn(), analyze: vi.fn() };
  const result = await mask(crypto.randomUUID(), [{ id: 'c1', index: 0,
    text: 'Alpha Systems LLC ("ATS") hires Atlantic Services LLC ("ATS"). ATS pays the fees.' }], bridge);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected masked companies');
  const context = prepareChatContext(approve(result, { reviewed: true }));
  await expect(maskQuestion(context, 'Can ATS raise the fees?', bridge)).rejects.toMatchObject({ code: 'ambiguous_entity' });
  expect(bridge.onDevice).not.toHaveBeenCalled();
  expect(bridge.analyze).not.toHaveBeenCalled();
});

it('blocks an explicit alias that collides with ordinary words instead of silently leaving it raw', async () => {
  const analyze = vi.fn<AiBridge['analyze']>();
  const result = await mask(crypto.randomUUID(), [{ id: 'c1', index: 0,
    text: 'Alpha Systems LLC ("AS") provides software as a service. AS pays the fees.' }], {
    onDeviceStatus: async () => 'unavailable', onDevice: vi.fn(), analyze,
  });
  expect(result).toMatchObject({ ok: false, leaks: [{ reason: expect.stringContaining('explicit name alias') }] });
  expect(analyze).not.toHaveBeenCalled();
});
