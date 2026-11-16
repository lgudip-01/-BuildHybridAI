import { openDB, type IDBPDatabase } from 'idb';

/** Placeholder → real value. */
export type VaultEntries = Record<string, string>;

type Sealed = { iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer };

const DB_NAME = 'clause-guard';
const KEY_ID = 'vault-key';

let dbPromise: Promise<IDBPDatabase> | undefined;
let keyPromise: Promise<CryptoKey> | undefined;

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

export async function saveVault(docId: string, entries: VaultEntries): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: docBytes(docId) },
    await vaultKey(),
    new TextEncoder().encode(JSON.stringify(entries)),
  );
  const sealed: Sealed = { iv, data };
  await (await db()).put('vaults', sealed, docId);
}

export async function loadVault(docId: string): Promise<VaultEntries | undefined> {
  const sealed: Sealed | undefined = await (await db()).get('vaults', docId);
  if (!sealed) return undefined;
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: sealed.iv, additionalData: docBytes(docId) },
    await vaultKey(),
    sealed.data,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as VaultEntries;
}

export async function deleteVault(docId: string): Promise<void> {
  await (await db()).delete('vaults', docId);
}
