import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteVault, loadVault, purgeExpiredVaults, saveVault, useExternalKey, VAULT_TTL_MS } from './vault';

const keyOf = (byte: number) => async () => new Uint8Array(32).fill(byte);

describe('vault with an external key', () => {
  afterEach(() => useExternalKey(undefined));

  it('saves and loads with a key from the device keystore', async () => {
    useExternalKey(keyOf(1));
    await saveVault('doc-a', { '[PARTY_A]': 'Acme Corp' });
    expect(await loadVault('doc-a')).toEqual({ '[PARTY_A]': 'Acme Corp' });
  });

  it('cannot read a vault sealed with a different key', async () => {
    useExternalKey(keyOf(1));
    await saveVault('doc-b', { '[PARTY_A]': 'Acme Corp' });
    useExternalKey(keyOf(2));
    await expect(loadVault('doc-b')).rejects.toThrow();
  });

  it('deletes after a pending save and keeps another document readable with the same key', async () => {
    let release!: (key: Uint8Array) => void;
    const key = new Promise<Uint8Array>(resolve => { release = resolve; });
    useExternalKey(() => key);
    const save = saveVault('selected', { '[NAME_1]': 'Selected' });
    const remove = deleteVault('selected');
    const other = saveVault('retained', { '[NAME_1]': 'Retained' });
    release(new Uint8Array(32).fill(5));
    await Promise.all([save, remove, other]);
    await deleteVault('selected'); // Repeating a completed deletion is harmless.
    expect(await loadVault('selected')).toBeUndefined();
    expect(await loadVault('retained')).toEqual({ '[NAME_1]': 'Retained' });
  });

  it('rejects a key that is not 32 bytes', async () => {
    useExternalKey(async () => new Uint8Array(16));
    await expect(saveVault('doc-c', {})).rejects.toThrow('32 bytes');
  });
});

describe('vault expiry', () => {
  afterEach(() => { vi.useRealTimers(); useExternalKey(undefined); });

  it('stops reading a vault and deletes it once it is older than the TTL', async () => {
    useExternalKey(keyOf(3));
    vi.useFakeTimers({ toFake: ['Date'], now: 0 });
    await saveVault('old', { '[NAME_1]': 'Old Name' });
    vi.setSystemTime(VAULT_TTL_MS - 1);
    await saveVault('recent', { '[NAME_1]': 'Recent Name' });
    expect(await loadVault('old')).toEqual({ '[NAME_1]': 'Old Name' });

    vi.setSystemTime(VAULT_TTL_MS);
    expect(await loadVault('old')).toBeUndefined();
    await purgeExpiredVaults();
    vi.setSystemTime(0); // Back inside the TTL: only a deleted record stays unreadable.
    expect(await loadVault('old')).toBeUndefined();
    expect(await loadVault('recent')).toEqual({ '[NAME_1]': 'Recent Name' });
  });

  it('keeps a vault saved again after the purge started', async () => {
    useExternalKey(keyOf(4));
    vi.useFakeTimers({ toFake: ['Date'], now: 0 });
    await saveVault('resaved', { '[NAME_1]': 'First' });
    vi.setSystemTime(VAULT_TTL_MS * 2);
    const save = saveVault('resaved', { '[NAME_1]': 'Second' });
    await Promise.all([save, purgeExpiredVaults()]);
    expect(await loadVault('resaved')).toEqual({ '[NAME_1]': 'Second' });
  });
});
