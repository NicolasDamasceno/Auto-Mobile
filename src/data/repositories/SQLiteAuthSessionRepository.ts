import { AuthSession } from '../../domain/entities/AuthSession';
import { AuthSessionRepository } from '../../domain/repositories/AuthSessionRepository';
import { getDatabase } from '../database/connection';
import { fromEpochSeconds, toEpochSeconds } from '../database/mappers';

interface AuthSessionRow {
  id: string;
  driver_id: string;
  token_hash: string;
  created_at: number;
  expires_at: number;
}

function toDomain(row: AuthSessionRow): AuthSession {
  return new AuthSession({
    id: row.id,
    driverId: row.driver_id,
    tokenHash: row.token_hash,
    createdAt: fromEpochSeconds(row.created_at),
    expiresAt: fromEpochSeconds(row.expires_at),
  });
}

export class SQLiteAuthSessionRepository implements AuthSessionRepository {
  async findByTokenHash(tokenHash: string): Promise<AuthSession | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AuthSessionRow>(
      'SELECT * FROM auth_sessions WHERE token_hash = ? LIMIT 1;',
      tokenHash,
    );
    return row ? toDomain(row) : null;
  }

  async save(session: AuthSession): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO auth_sessions (id, driver_id, token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         token_hash = excluded.token_hash,
         expires_at = excluded.expires_at;`,
      session.id,
      session.driverId,
      session.tokenHash,
      toEpochSeconds(session.createdAt),
      toEpochSeconds(session.expiresAt),
    );
  }

  async deleteByDriverId(driverId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM auth_sessions WHERE driver_id = ?;', driverId);
  }
}
