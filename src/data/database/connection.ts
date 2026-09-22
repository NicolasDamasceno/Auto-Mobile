import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

const DATABASE_NAME = 'automobile.db';

/**
 * Versão do schema. Incremente ao adicionar uma migração nova em
 * `runMigrations` (nunca edite o SQL de uma versão já publicada).
 */
const DATABASE_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Conexão única com o SQLite, aberta e migrada uma vez por processo do app. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (tx) => {
    if (currentVersion < 1) {
      await tx.execAsync(SCHEMA_SQL);
      currentVersion = 1;
    }
    // Próxima migração: if (currentVersion < 2) { await tx.execAsync(...); currentVersion = 2; }
  });

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}
