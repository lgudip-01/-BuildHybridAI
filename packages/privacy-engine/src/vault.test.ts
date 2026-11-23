import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { deleteVault, loadVault, saveVault, useExternalKey } from './vault';

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
