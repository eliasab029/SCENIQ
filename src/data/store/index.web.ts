import { COLLECTIONS, type Collection, type DocumentStore, type StoreInfo } from './types';

export * from './types';

/**
 * IndexedDB implementation (browser).
 * One object store per collection, documents keyed by id.
 *
 * Schema changes: bump DB_VERSION and handle the new version in onupgradeneeded.
 */
const DB_NAME = 'storytune';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Dieser Browser unterstützt keine lokale Speicherung.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of COLLECTIONS) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Lokaler Speicher konnte nicht geöffnet werden.'));
    req.onblocked = () => reject(new Error('Lokaler Speicher ist in einem anderen Tab blockiert.'));
  }).catch((e) => {
    dbPromise = null; // allow a retry
    throw e;
  });
  return dbPromise;
}

async function run<T>(
  collection: Collection,
  mode: IDBTransactionMode,
  action: (os: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(collection, mode);
    const req = action(tx.objectStore(collection));
    tx.oncomplete = () => resolve(req.result as T);
    tx.onerror = () => reject(tx.error ?? req.error);
    tx.onabort = () => reject(tx.error ?? new Error('Speichervorgang abgebrochen.'));
  });
}

let persistRequested: Promise<boolean | null> | null = null;

/** Ask the browser not to evict our data (granted e.g. for installed home-screen apps). */
function requestPersistence(): Promise<boolean | null> {
  if (!persistRequested) {
    persistRequested = (async () => {
      try {
        if (!navigator.storage?.persist) return null;
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      } catch {
        return null;
      }
    })();
  }
  return persistRequested;
}

export const store: DocumentStore = {
  async get<T>(collection: Collection, id: string) {
    return run<T | undefined>(collection, 'readonly', (os) => os.get(id));
  },
  async put<T>(collection: Collection, id: string, value: T) {
    await run(collection, 'readwrite', (os) => os.put(value, id));
  },
  async remove(collection: Collection, id: string) {
    await run(collection, 'readwrite', (os) => os.delete(id));
  },
  async list<T>(collection: Collection) {
    return run<T[]>(collection, 'readonly', (os) => os.getAll());
  },
  async clear(collection: Collection) {
    await run(collection, 'readwrite', (os) => os.clear());
  },
  async info(): Promise<StoreInfo> {
    await openDb();
    return { engine: 'IndexedDB', persistent: await requestPersistence() };
  },
};
