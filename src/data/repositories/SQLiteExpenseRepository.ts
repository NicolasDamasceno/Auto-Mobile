import { Expense, FuelExpense, MaintenanceExpense, OtherExpense } from '../../domain/entities/Expense';
import { ExpenseCategory } from '../../domain/enums/ExpenseCategory';
import { ExpenseFilter, ExpenseRepository } from '../../domain/repositories/ExpenseRepository';
import { getDatabase } from '../database/connection';
import {
  dieselGradeCodec,
  expenseCategoryCodec,
  fuelTypeCodec,
  maintenanceTypeCodec,
  otherExpenseCategoryCodec,
} from '../database/enumCodecs';
import {
  fromCents,
  fromEpochSeconds,
  fromEpochSecondsOptional,
  fromHundredths,
  fromSqliteBool,
  toCents,
  toEpochSeconds,
  toEpochSecondsOptional,
  toHundredths,
  toSqliteBool,
} from '../database/mappers';

interface ExpenseRow {
  id: string;
  vehicle_id: string;
  category: number;
  date: number;
  odometer_km: number;
  amount_cents: number;
  notes: string | null;
  attachment_uri: string | null;
  created_at: number;
  fuel_type: number | null;
  diesel_grade: number | null;
  quantity_hundredths: number | null;
  unit_price_cents: number | null;
  full_tank: number | null;
  station_name: string | null;
  maintenance_type: number | null;
  service_description: string | null;
  workshop_name: string | null;
  parts_replaced: string | null;
  next_due_odometer_km: number | null;
  next_due_date: number | null;
  other_category: number | null;
  description: string | null;
}

function toDomain(row: ExpenseRow): Expense {
  const base = {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: fromEpochSeconds(row.date),
    odometerKm: row.odometer_km,
    amount: fromCents(row.amount_cents),
    notes: row.notes ?? undefined,
    attachmentUri: row.attachment_uri ?? undefined,
    createdAt: fromEpochSeconds(row.created_at),
  };

  switch (expenseCategoryCodec.decode(row.category)) {
    case ExpenseCategory.FUEL:
      return new FuelExpense({
        ...base,
        fuelType: fuelTypeCodec.decode(row.fuel_type!),
        dieselGrade: dieselGradeCodec.decodeOptional(row.diesel_grade),
        quantity: fromHundredths(row.quantity_hundredths!),
        unitPrice: fromCents(row.unit_price_cents!),
        fullTank: fromSqliteBool(row.full_tank!),
        stationName: row.station_name ?? undefined,
      });
    case ExpenseCategory.MAINTENANCE:
      return new MaintenanceExpense({
        ...base,
        maintenanceType: maintenanceTypeCodec.decode(row.maintenance_type!),
        serviceDescription: row.service_description!,
        workshopName: row.workshop_name ?? undefined,
        partsReplaced: row.parts_replaced ? row.parts_replaced.split(',').filter(Boolean) : undefined,
        nextDueOdometerKm: row.next_due_odometer_km ?? undefined,
        nextDueDate: fromEpochSecondsOptional(row.next_due_date),
      });
    case ExpenseCategory.OTHER:
      return new OtherExpense({
        ...base,
        subCategory: otherExpenseCategoryCodec.decode(row.other_category!),
        description: row.description ?? undefined,
      });
  }
}

export class SQLiteExpenseRepository implements ExpenseRepository {
  async findByVehicle(filter: ExpenseFilter): Promise<Expense[]> {
    const db = await getDatabase();
    const conditions = ['vehicle_id = ?'];
    const params: (string | number)[] = [filter.vehicleId];

    if (filter.category !== undefined) {
      conditions.push('category = ?');
      params.push(expenseCategoryCodec.encode(filter.category));
    }
    if (filter.startDate) {
      conditions.push('date >= ?');
      params.push(toEpochSeconds(filter.startDate));
    }
    if (filter.endDate) {
      conditions.push('date <= ?');
      params.push(toEpochSeconds(filter.endDate));
    }

    const rows = await db.getAllAsync<ExpenseRow>(
      `SELECT * FROM expenses WHERE ${conditions.join(' AND ')} ORDER BY date DESC;`,
      ...params,
    );
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Expense | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ? LIMIT 1;', id);
    return row ? toDomain(row) : null;
  }

  async save(expense: Expense): Promise<void> {
    const db = await getDatabase();

    const fuel = expense instanceof FuelExpense ? expense : undefined;
    const maintenance = expense instanceof MaintenanceExpense ? expense : undefined;
    const other = expense instanceof OtherExpense ? expense : undefined;

    await db.runAsync(
      `INSERT INTO expenses (
         id, vehicle_id, category, date, odometer_km, amount_cents, notes, attachment_uri, created_at,
         fuel_type, diesel_grade, quantity_hundredths, unit_price_cents, full_tank, station_name,
         maintenance_type, service_description, workshop_name, parts_replaced, next_due_odometer_km, next_due_date,
         other_category, description
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         vehicle_id = excluded.vehicle_id,
         category = excluded.category,
         date = excluded.date,
         odometer_km = excluded.odometer_km,
         amount_cents = excluded.amount_cents,
         notes = excluded.notes,
         attachment_uri = excluded.attachment_uri,
         fuel_type = excluded.fuel_type,
         diesel_grade = excluded.diesel_grade,
         quantity_hundredths = excluded.quantity_hundredths,
         unit_price_cents = excluded.unit_price_cents,
         full_tank = excluded.full_tank,
         station_name = excluded.station_name,
         maintenance_type = excluded.maintenance_type,
         service_description = excluded.service_description,
         workshop_name = excluded.workshop_name,
         parts_replaced = excluded.parts_replaced,
         next_due_odometer_km = excluded.next_due_odometer_km,
         next_due_date = excluded.next_due_date,
         other_category = excluded.other_category,
         description = excluded.description;`,
      expense.id,
      expense.vehicleId,
      expenseCategoryCodec.encode(expense.category),
      toEpochSeconds(expense.date),
      expense.odometerKm,
      toCents(expense.amount),
      expense.notes ?? null,
      expense.attachmentUri ?? null,
      toEpochSeconds(expense.createdAt),
      fuel ? fuelTypeCodec.encode(fuel.fuelType) : null,
      fuel ? dieselGradeCodec.encodeOptional(fuel.dieselGrade) : null,
      fuel ? toHundredths(fuel.quantity) : null,
      fuel ? toCents(fuel.unitPrice) : null,
      fuel ? toSqliteBool(fuel.fullTank) : null,
      fuel?.stationName ?? null,
      maintenance ? maintenanceTypeCodec.encode(maintenance.maintenanceType) : null,
      maintenance?.serviceDescription ?? null,
      maintenance?.workshopName ?? null,
      maintenance && maintenance.partsReplaced.length > 0 ? maintenance.partsReplaced.join(',') : null,
      maintenance?.nextDueOdometerKm ?? null,
      toEpochSecondsOptional(maintenance?.nextDueDate),
      other ? otherExpenseCategoryCodec.encode(other.subCategory) : null,
      other?.description ?? null,
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', id);
  }
}
