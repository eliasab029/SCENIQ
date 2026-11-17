/**
 * Local document store – the single persistence API for structured app data.
 *
 * Implementations:
 *   index.web.ts → IndexedDB (browser; the app's primary platform)
 *   index.ts     → SQLite via expo-sqlite (a later native iOS/Android build)
 *
 * Metro picks the right file per platform; screens only import `@/data/store`.
 * Values are plain JSON-serializable objects. Repositories for analyses,
 * favorites, feedback and the music profile are built on top of this in Phase 3.
 */

export type Collection = 'analyses' | 'favorites' | 'feedback' | 'profile';

export const COLLECTIONS: Collection[] = ['analyses', 'favorites', 'feedback', 'profile'];

export interface StoreInfo {
  engine: 'IndexedDB' | 'SQLite';
  /**
   * Whether the browser promised not to evict the data.
   * null = not applicable / unknown (native, or API not supported).
   */
  persistent: boolean | null;
}

export interface DocumentStore {
  get<T>(collection: Collection, id: string): Promise<T | undefined>;
  put<T>(collection: Collection, id: string, value: T): Promise<void>;
  remove(collection: Collection, id: string): Promise<void>;
  list<T>(collection: Collection): Promise<T[]>;
  clear(collection: Collection): Promise<void>;
  /** Opens the store and reports engine + persistence. Throws if storage is unavailable. */
  info(): Promise<StoreInfo>;
}

export type StoreStatus =
  | { state: 'ready'; info: StoreInfo }
  | { state: 'error'; message: string };

export async function getStoreStatus(store: DocumentStore): Promise<StoreStatus> {
  try {
    return { state: 'ready', info: await store.info() };
  } catch (e) {
    return { state: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}
