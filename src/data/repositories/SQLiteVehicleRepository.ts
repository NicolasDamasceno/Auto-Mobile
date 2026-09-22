import { Vehicle } from '../../domain/entities/Vehicle';
import { VehicleRepository } from '../../domain/repositories/VehicleRepository';
import { getDatabase } from '../database/connection';
import { fuelTypeCodec, vehicleTypeCodec } from '../database/enumCodecs';
import { fromEpochSeconds, fromSqliteBool, toEpochSeconds, toSqliteBool } from '../database/mappers';

interface VehicleRow {
  id: string;
  nickname: string;
  type: number;
  fuel_type: number;
  has_gnv_kit: number;
  brand: string;
  model: string;
  year: number;
  plate: string | null;
  odometer_km: number;
  photo_uri: string | null;
  created_at: number;
}

function toDomain(row: VehicleRow): Vehicle {
  return new Vehicle({
    id: row.id,
    nickname: row.nickname,
    type: vehicleTypeCodec.decode(row.type),
    fuelType: fuelTypeCodec.decode(row.fuel_type),
    hasGnvKit: fromSqliteBool(row.has_gnv_kit),
    brand: row.brand,
    model: row.model,
    year: row.year,
    plate: row.plate ?? undefined,
    currentOdometerKm: row.odometer_km,
    photoUri: row.photo_uri ?? undefined,
    createdAt: fromEpochSeconds(row.created_at),
  });
}

export class SQLiteVehicleRepository implements VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<VehicleRow>('SELECT * FROM vehicles ORDER BY created_at ASC;');
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<VehicleRow>('SELECT * FROM vehicles WHERE id = ? LIMIT 1;', id);
    return row ? toDomain(row) : null;
  }

  async save(vehicle: Vehicle): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO vehicles
         (id, nickname, type, fuel_type, has_gnv_kit, brand, model, year, plate, odometer_km, photo_uri, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nickname = excluded.nickname,
         type = excluded.type,
         fuel_type = excluded.fuel_type,
         has_gnv_kit = excluded.has_gnv_kit,
         brand = excluded.brand,
         model = excluded.model,
         year = excluded.year,
         plate = excluded.plate,
         odometer_km = excluded.odometer_km,
         photo_uri = excluded.photo_uri;`,
      vehicle.id,
      vehicle.nickname,
      vehicleTypeCodec.encode(vehicle.type),
      fuelTypeCodec.encode(vehicle.fuelType),
      toSqliteBool(vehicle.hasGnvKit),
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.plate ?? null,
      vehicle.currentOdometerKm,
      vehicle.photoUri ?? null,
      toEpochSeconds(vehicle.createdAt),
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM vehicles WHERE id = ?;', id);
  }
}
