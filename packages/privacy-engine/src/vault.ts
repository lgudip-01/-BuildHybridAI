import { forgetRun } from './approval';
import { openDB, type IDBPDatabase } from 'idb';

/** Placeholder → real value. */
export type VaultEntries = Record<string, string>;

type Sealed = { iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer; savedAt?: number };

/**
 * How long a vault is kept after its last save. A document id lives only as long as the page that made it,
 * so a vault left by an earlier visit can never be read again; this bounds how long its real values stay on disk.
 */
export const VAULT_TTL_MS = 24 * 60 * 60 * 1000;
// A record from before savedAt existed counts as expired.
const expired = (sealed: Sealed, now: number) => !(now - (sealed.savedAt ?? -Infinity) < VAULT_TTL_MS);

const DB_NAME = 'clause-guard';
const KEY_ID = 'vault-key';

let dbPromise: Promise<IDBPDatabase> | undefined;
let keyPromise: Promise<CryptoKey> | undefined;
let externalKey: (() => Promise<Uint8Array>) | undefined;

/**
 * Use a key held outside the browser, such as the iOS Keychain or Android Keystore, instead of one stored in
 * IndexedDB. Mobile WebViews can't store a CryptoKey in IndexedDB, and the OS keystore is the stronger home for
 * it anyway. `source` returns the 32 raw key bytes; the key is imported into the page as non-extractable.
 * Call this once at startup, before the first mask or unmask.
 */
export function useExternalKey(source: (() => Promise<Uint8Array>) | undefined): void {
  externalKey = source;
  keyPromise = undefined;
}

function db(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore('keys');
      database.createObjectStore('vaults');
    },
  });
  return dbPromise;
}

// One AES-GCM key per device. It is non-extractable: the browser can use it, but no code can read it out.
function vaultKey(): Promise<CryptoKey> {
  keyPromise ??= (async () => {
    if (externalKey) {
      const raw = await externalKey();
      if (raw.byteLength !== 32) throw new Error('The vault key from the device keystore must be 32 bytes.');
      return crypto.subtle.importKey('raw', raw as Uint8Array<ArrayBuffer>, 'AES-GCM', false, ['encrypt', 'decrypt']);
    }
    const database = await db();
    const existing: CryptoKey | undefined = await database.get('keys', KEY_ID);
    if (existing) return existing;
    const created = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    try {
      await database.add('keys', created, KEY_ID);
      return created;
    } catch (error) {
      // Another tab created the key first. Use theirs, or vaults it already sealed become unreadable.
      if (!(error instanceof DOMException) || error.name !== 'ConstraintError') throw error;
      const winner: CryptoKey | undefined = await database.get('keys', KEY_ID);
      if (!winner) throw error;
      return winner;
    }
  })().catch((error: unknown) => {
    keyPromise = undefined;
    throw error;
  });
  return keyPromise;
}

// The document id is bound in as additional data, so one document's vault can't be swapped in for another's.
const docBytes = (docId: string) => new TextEncoder().encode(docId);

// Serialize mutations for a single document, including encryption before the IndexedDB write.
const pendingWrites = new Map<string, Promise<void>>();

function inWriteOrder(docId: string, operation: () => Promise<void>): Promise<void> {
  const previous = pendingWrites.get(docId) ?? Promise.resolve();
  const next = previous.then(operation, operation);
  pendingWrites.set(docId, next);
  return next.finally(() => {
    if (pendingWrites.get(docId) === next) pendingWrites.delete(docId);
  });
}

export function saveVault(docId: string, entries: VaultEntries): Promise<void> {
  return inWriteOrder(docId, async () => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: docBytes(docId) },
      await vaultKey(),
      new TextEncoder().encode(JSON.stringify(entries)),
    );
    const sealed: Sealed = { iv, data, savedAt: Date.now() };
    await (await db()).put('vaults', sealed, docId);
  });
}

export async function loadVault(docId: string): Promise<VaultEntries | undefined> {
  const sealed: Sealed | undefined = await (await db()).get('vaults', docId);
  if (!sealed || expired(sealed, Date.now())) return undefined;
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: sealed.iv, additionalData: docBytes(docId) },
    await vaultKey(),
    sealed.data,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as VaultEntries;
}

export async function deleteVault(docId: string): Promise<void> {
  forgetRun(docId);
  await inWriteOrder(docId, async () => (await db()).delete('vaults', docId));
}

/** Deletes every vault not saved in the last VAULT_TTL_MS. Call it once at startup. */
export async function purgeExpiredVaults(now = Date.now()): Promise<void> {
  const database = await db();
  const docIds = (await database.getAllKeys('vaults')).map(String);
  await Promise.all(docIds.map(docId => inWriteOrder(docId, async () => {
    // Checked again in write order, so a save that landed after the scan is kept.
    const sealed: Sealed | undefined = await database.get('vaults', docId);
    if (sealed && expired(sealed, now)) await database.delete('vaults', docId);
  })));
}
