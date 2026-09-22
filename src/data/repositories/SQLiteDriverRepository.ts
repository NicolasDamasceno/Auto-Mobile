import { Driver } from '../../domain/entities/Driver';
import { DriverRepository } from '../../domain/repositories/DriverRepository';
import { getDatabase } from '../database/connection';
import { fromEpochSeconds, toEpochSeconds } from '../database/mappers';

interface DriverRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: number;
}

function toDomain(row: DriverRow): Driver {
  return new Driver({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: fromEpochSeconds(row.created_at),
  });
}

export class SQLiteDriverRepository implements DriverRepository {
  async findByEmail(email: string): Promise<Driver | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<DriverRow>(
      'SELECT * FROM drivers WHERE email = ? LIMIT 1;',
      email.trim().toLowerCase(),
    );
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Driver | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<DriverRow>('SELECT * FROM drivers WHERE id = ? LIMIT 1;', id);
    return row ? toDomain(row) : null;
  }

  async save(driver: Driver): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO drivers (id, name, email, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         email = excluded.email,
         password_hash = excluded.password_hash;`,
      driver.id,
      driver.name,
      driver.email,
      driver.passwordHash,
      toEpochSeconds(driver.createdAt),
    );
  }
}
