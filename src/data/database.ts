import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

/**
 * Local SQLite database.
 *
 * Migrations are plain SQL steps indexed by PRAGMA user_version.
 * To change the schema: append a new entry to MIGRATIONS – never edit an existing one.
 */

const DB_NAME = 'storytune.db';

const MIGRATIONS: string[] = [
  // v1 – initial schema
  `
  CREATE TABLE IF NOT EXISTS analyses (
    id            TEXT PRIMARY KEY NOT NULL,
    created_at    INTEGER NOT NULL,
    image_uri     TEXT NOT NULL,
    desired_effect TEXT,
    source        TEXT NOT NULL,          -- 'ollama' | 'on-device' | 'demo'
    model         TEXT,
    result_json   TEXT NOT NULL           -- ImageAnalysis
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id            TEXT PRIMARY KEY NOT NULL,
    analysis_id   TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    song_id       TEXT NOT NULL,
    slot          TEXT NOT NULL,          -- RecommendationSlot
    position      INTEGER NOT NULL,
    score         REAL NOT NULL,
    reasons_json  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_recommendations_analysis ON recommendations(analysis_id);

  CREATE TABLE IF NOT EXISTS feedback (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id       TEXT NOT NULL,
    analysis_id   TEXT,
    kind          TEXT NOT NULL CHECK (kind IN ('like','dislike','more','not_my_style')),
    created_at    INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_feedback_song ON feedback(song_id);

  CREATE TABLE IF NOT EXISTS favorites (
    song_id       TEXT PRIMARY KEY NOT NULL,
    analysis_id   TEXT,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profile (
    key           TEXT PRIMARY KEY NOT NULL,
    value_json    TEXT NOT NULL,
    updated_at    INTEGER NOT NULL
  );
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[v]);
      await txn.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return db;
}

/** Returns the shared database connection (opened + migrated once). */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === 'web') {
    return Promise.reject(new Error('SQLite ist in der Web-Vorschau deaktiviert.'));
  }
  if (!dbPromise) {
    dbPromise = openAndMigrate().catch((e) => {
      dbPromise = null; // allow retry
      throw e;
    });
  }
  return dbPromise;
}

export type DatabaseStatus =
  | { state: 'ready'; schemaVersion: number }
  | { state: 'unsupported'; message: string }
  | { state: 'error'; message: string };

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  if (Platform.OS === 'web') {
    return { state: 'unsupported', message: 'Nur in der Web-Vorschau nicht verfügbar' };
  }
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return { state: 'ready', schemaVersion: row?.user_version ?? 0 };
  } catch (e) {
    return { state: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}
