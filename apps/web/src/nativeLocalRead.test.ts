import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({ onDevice: vi.fn(), onDeviceStatus: vi.fn(), analyzeClause: vi.fn() }));
vi.mock('@capacitor/core', () => ({ registerPlugin: () => native }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetModules();
  // IndexedDB uses setImmediate; leave it real while advancing only the deadline.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  native.onDevice.mockReset();
  native.analyzeClause.mockReset();
  native.onDeviceStatus.mockReset().mockResolvedValue({ status: 'available' });
});
afterEach(() => vi.useRealTimers());

it('settles a never-returning native read at 30 seconds without sending another prompt', async () => {
  const { NativeBridge } = await import('./nativeBridge');
  native.onDevice.mockReturnValue(new Promise(() => {}));
  const settled = vi.fn();
  void new NativeBridge().onDevice('fictional local text').then(settled, settled);
  await vi.advanceTimersByTimeAsync(29_999);
  expect(settled).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  expect(settled).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ code: 'local_read_timeout' }));
  expect(native.onDevice).toHaveBeenCalledTimes(1);
  expect(native.analyzeClause).not.toHaveBeenCalled();
});

it('keeps the native read fenced across bridge instances until its actual late reply', async () => {
  const { NativeBridge } = await import('./nativeBridge');
  const old = deferred<{ text: string }>();
  native.onDevice.mockReturnValueOnce(old.promise).mockResolvedValue({ text: 'fresh' });
  const first = new NativeBridge(), second = new NativeBridge();
  const read = first.onDevice('first fictional text');
  const rejected = expect(read).rejects.toMatchObject({ code: 'local_read_timeout' });
  await expect(second.onDevice('overlap')).rejects.toMatchObject({ code: 'local_read_busy' });
  await vi.advanceTimersByTimeAsync(30_000);
  await rejected;
  await expect(second.onDeviceStatus()).resolves.toBe('unavailable');
  await expect(second.onDevice('after deadline')).rejects.toMatchObject({ code: 'local_read_busy' });
  expect(native.onDevice).toHaveBeenCalledTimes(1);
  old.resolve({ text: 'late response must not revive expired caller' });
  await Promise.resolve();
  await expect(second.onDeviceStatus()).resolves.toBe('available');
  await expect(second.onDevice('new local text')).resolves.toBe('fresh');
  expect(vi.getTimerCount()).toBe(0);
});

it('clears its timer and fence on a normal reply or native rejection', async () => {
  const { NativeBridge } = await import('./nativeBridge');
  native.onDevice.mockResolvedValueOnce({ text: 'local reply' }).mockRejectedValueOnce(new Error('native failure'));
  const bridge = new NativeBridge();
  await expect(bridge.onDevice('fictional text')).resolves.toBe('local reply');
  await expect(bridge.onDevice('another fictional text')).rejects.toThrow('native failure');
  expect(vi.getTimerCount()).toBe(0);
  await expect(bridge.onDeviceStatus()).resolves.toBe('available');
});

it('does not report available if a read starts while native status is pending', async () => {
  const { NativeBridge } = await import('./nativeBridge');
  const status = deferred<{ status: 'available' }>(), read = deferred<{ text: string }>();
  native.onDeviceStatus.mockReturnValue(status.promise);
  native.onDevice.mockReturnValue(read.promise);
  const bridge = new NativeBridge();
  const checking = bridge.onDeviceStatus();
  const pending = bridge.onDevice('fictional text');
  status.resolve({ status: 'available' });
  await expect(checking).resolves.toBe('unavailable');
  read.resolve({ text: 'done' });
  await pending;
});

it('does not strand the fence or timer on a malformed reply or synchronous plugin failure', async () => {
  const { NativeBridge } = await import('./nativeBridge');
  native.onDevice.mockResolvedValueOnce(undefined).mockImplementationOnce(() => { throw new Error('sync failure'); });
  const bridge = new NativeBridge();
  await expect(bridge.onDevice('fictional text')).rejects.toThrow('invalid reply');
  await expect(bridge.onDevice('fictional text')).rejects.toThrow('sync failure');
  expect(vi.getTimerCount()).toBe(0);
  await expect(bridge.onDeviceStatus()).resolves.toBe('available');
});

it('returns the real engine to a review-required patterns preview after a stalled read', async () => {
  const [{ NativeBridge }, { mask }, { approve }, { splitClauses }] = await Promise.all([
    import('./nativeBridge'), import('@clause-guard/privacy-engine/mask'),
    import('@clause-guard/privacy-engine/approval'), import('./clauses'),
  ]);
  const late = deferred<{ text: string }>();
  native.onDevice.mockReturnValue(late.promise);
  const clauses = splitClauses(readFileSync(new URL('../../../samples/nda.txt', import.meta.url), 'utf8'));
  const pending = mask(crypto.randomUUID(), clauses, new NativeBridge());
  await vi.advanceTimersByTimeAsync(30_000);
  const result = await pending;
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected reviewable public-fixture preview');
  expect(result.clauses).toHaveLength(10);
  expect(result.modelReadClauses).toBe(0);
  expect(result.needsReview).toBe(true);
  expect(() => approve(result)).toThrow();
  expect(native.onDevice).toHaveBeenCalledTimes(1);
  expect(native.analyzeClause).not.toHaveBeenCalled();
  const preview = result.clauses.map(c => c.text).join('\n');
  late.resolve({ text: JSON.stringify({ type: 'payment', entities: [] }) });
  await Promise.resolve();
  expect(result.modelReadClauses).toBe(0);
  expect(result.clauses.map(c => c.text).join('\n')).toBe(preview);
});

it('keeps the rest of a timed-out batch on patterns even when the native reply arrives before the next clause', async () => {
  const [{ NativeBridge }, { mask }] = await Promise.all([
    import('./nativeBridge'), import('@clause-guard/privacy-engine/mask'),
  ]);
  const late = deferred<{ text: string }>();
  native.onDevice.mockReturnValueOnce(late.promise).mockResolvedValue({
    text: JSON.stringify({ type: 'other', entities: [] }),
  });
  const bridge = new NativeBridge();
  const read = bridge.onDevice.bind(bridge);
  bridge.onDevice = async (...args) => {
    try { return await read(...args); }
    catch (error) {
      // Deliver the abandoned reply before the engine handles the timeout.
      late.resolve({ text: JSON.stringify({ type: 'payment', entities: [] }) });
      await Promise.resolve();
      expect(await bridge.onDeviceStatus()).toBe('available');
      throw error;
    }
  };
  const pending = mask(crypto.randomUUID(), [
    { id: 'c1', index: 0, text: 'Acme Corp pays $12,500.' },
    { id: 'c2', index: 1, text: 'Dana Miller signs the agreement.' },
  ], bridge);
  await vi.advanceTimersByTimeAsync(30_000);
  const result = await pending;
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected patterns preview');
  expect(result.modelReadClauses).toBe(0);
  expect(result.needsReview).toBe(true);
  expect(native.onDevice).toHaveBeenCalledTimes(1);
  expect(native.analyzeClause).not.toHaveBeenCalled();
});
