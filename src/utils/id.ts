import * as Crypto from 'expo-crypto';

/** Gera o id (UUID) de uma nova entidade — ver docs/ARCHITECTURE.md (ids TEXT, não INTEGER PRIMARY KEY). */
export function generateId(): string {
  return Crypto.randomUUID();
}
