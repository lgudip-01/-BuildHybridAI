// @vitest-environment happy-dom
import 'fake-indexeddb/auto';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { mask } from '@clause-guard/privacy-engine/mask';
import { loadVault } from '@clause-guard/privacy-engine/vault';
import { App } from './App';

it('cancels or confirms deletion of the visible review and preserves a second document', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  let selected!: ApprovedBatch;
  const bridge: AiBridge & { downloadModel(): Promise<void> } = {
    onDeviceStatus: async () => 'unavailable',
    onDevice: async () => { throw new Error('Unexpected inference'); },
    downloadModel: async () => {},
    analyze: async batch => {
      assertApproved(batch);
      selected = batch;
      return { docId: batch.docId, ranOn: 'device', failed: [], results: batch.clauses.map(c => ({
        clauseId: c.id, risk: 'low', explanation: c.text, redline: '', questions: [],
      })) };
    },
  };

  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const button = (label: string) => {
    const match = [...host.querySelectorAll('button')].find(b => b.textContent === label);
    if (!match) throw new Error('Missing button: ' + label);
    return match;
  };
  try {
    const other = await mask('retained-ui-doc', [{ id: 'c1', index: 0, text: 'Email other@example.test.' }], bridge);
    if (!other.ok) throw new Error('Expected masked document');
    const otherBatch = approve(other, { reviewed: true });
    const otherValues = await loadVault(other.docId);
    await act(async () => root.render(<App bridge={bridge} />));
    await act(async () => {
      button('Mask contract').click();
      await vi.waitFor(() => expect(host.textContent).toContain('Approve & analyze'));
    });
    await act(async () => {
      button('Approve & analyze').click();
      await vi.waitFor(() => expect(host.querySelector('.analysis-card')).toBeTruthy());
    });
    const original = host.querySelector('textarea')!.value;
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    vi.stubGlobal('confirm', confirm);
    await act(() => button('Delete this document').click());
    expect(host.querySelector('textarea')!.value).toBe(original);
    expect(host.querySelector('.analysis-card')).toBeTruthy();
    expect(await loadVault(selected.docId)).toBeDefined();
    await act(async () => {
      button('Delete this document').click();
      expect(() => assertApproved(selected)).toThrow(expect.objectContaining({ code: 'stale' }));
      await vi.waitFor(() => expect(host.querySelector('textarea')!.value).toBe(''));
    });
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(host.textContent).toContain('Document and saved values deleted');
    expect(host.querySelector('.analysis-card, .ledger, .clauses')).toBeNull();
    expect(await loadVault(selected.docId)).toBeUndefined();
    expect(otherValues).toBeDefined();
    expect(await loadVault(other.docId)).toEqual(otherValues);
    expect(() => assertApproved(otherBatch)).not.toThrow();
  } finally {
    await act(() => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
