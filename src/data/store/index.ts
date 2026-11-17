import * as SQLite from 'expo-sqlite';

import type { Collection, DocumentStore, StoreInfo } from './types';

export * from './types';

/**
 * SQLite implementation for a later native build (iOS/Android).
 * The web app uses index.web.ts instead – this file is never bundled for the browser.
 *
 * Migrations are indexed by PRAGMA user_version: append, never edit.
 */
const DB_NAME = 'storytune.db';

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS documents (
     collection TEXT NOT NULL,
     id         TEXT NOT NULL,
     value_json TEXT NOT NULL,
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (collection, id)
   );`,
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      for (let v = row?.user_version ?? 0; v < MIGRATIONS.length; v++) {
        await db.withExclusiveTransactionAsync(async (txn) => {
          await txn.execAsync(MIGRATIONS[v]);
          await txn.execAsync(`PRAGMA user_version = ${v + 1}`);
        });
      }
      return db;
    })().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

export const store: DocumentStore = {
  async get<T>(collection: Collection, id: string) {
    const db = await openDb();
    const row = await db.getFirstAsync<{ value_json: string }>(
      'SELECT value_json FROM documents WHERE collection = ? AND id = ?',
      collection,
      id,
    );
    return row ? (JSON.parse(row.value_json) as T) : undefined;
  },
  async put<T>(collection: Collection, id: string, value: T) {
    const db = await openDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO documents (collection, id, value_json, updated_at) VALUES (?, ?, ?, ?)',
      collection,
      id,
      JSON.stringify(value),
      Date.now(),
    );
  },
  async remove(collection: Collection, id: string) {
    const db = await openDb();
    await db.runAsync('DELETE FROM documents WHERE collection = ? AND id = ?', collection, id);
  },
  async list<T>(collection: Collection) {
    const db = await openDb();
    const rows = await db.getAllAsync<{ value_json: string }>(
      'SELECT value_json FROM documents WHERE collection = ? ORDER BY updated_at DESC',
      collection,
    );
    return rows.map((r) => JSON.parse(r.value_json) as T);
  },
  async clear(collection: Collection) {
    const db = await openDb();
    await db.runAsync('DELETE FROM documents WHERE collection = ?', collection);
  },
  async info(): Promise<StoreInfo> {
    await openDb();
    return { engine: 'SQLite', persistent: null };
  },
};
