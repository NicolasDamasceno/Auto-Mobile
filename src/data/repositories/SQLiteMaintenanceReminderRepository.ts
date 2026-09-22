import { MaintenanceReminder } from '../../domain/entities/MaintenanceReminder';
import { ReminderStatus } from '../../domain/enums/MaintenanceReminderEnums';
import { MaintenanceReminderRepository } from '../../domain/repositories/MaintenanceReminderRepository';
import { getDatabase } from '../database/connection';
import { reminderDueTypeCodec, reminderStatusCodec } from '../database/enumCodecs';
import {
  fromEpochSeconds,
  fromEpochSecondsOptional,
  fromSqliteBool,
  toEpochSeconds,
  toEpochSecondsOptional,
  toSqliteBool,
} from '../database/mappers';

interface ReminderRow {
  id: string;
  vehicle_id: string;
  title: string;
  description: string | null;
  due_type: number;
  due_date: number | null;
  due_odometer_km: number | null;
  is_recurring: number;
  recurrence_interval_days: number | null;
  recurrence_interval_km: number | null;
  status: number;
  linked_expense_id: string | null;
  created_at: number;
}

function toDomain(row: ReminderRow): MaintenanceReminder {
  return new MaintenanceReminder({
    id: row.id,
    vehicleId: row.vehicle_id,
    title: row.title,
    description: row.description ?? undefined,
    dueType: reminderDueTypeCodec.decode(row.due_type),
    dueDate: fromEpochSecondsOptional(row.due_date),
    dueOdometerKm: row.due_odometer_km ?? undefined,
    isRecurring: fromSqliteBool(row.is_recurring),
    recurrenceIntervalDays: row.recurrence_interval_days ?? undefined,
    recurrenceIntervalKm: row.recurrence_interval_km ?? undefined,
    status: reminderStatusCodec.decode(row.status),
    linkedExpenseId: row.linked_expense_id ?? undefined,
    createdAt: fromEpochSeconds(row.created_at),
  });
}

export class SQLiteMaintenanceReminderRepository implements MaintenanceReminderRepository {
  async findByVehicle(vehicleId: string): Promise<MaintenanceReminder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReminderRow>(
      'SELECT * FROM maintenance_reminders WHERE vehicle_id = ? ORDER BY created_at ASC;',
      vehicleId,
    );
    return rows.map(toDomain);
  }

  async findPending(): Promise<MaintenanceReminder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReminderRow>(
      'SELECT * FROM maintenance_reminders WHERE status != ? ORDER BY due_date ASC;',
      reminderStatusCodec.encode(ReminderStatus.COMPLETED),
    );
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<MaintenanceReminder | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ReminderRow>(
      'SELECT * FROM maintenance_reminders WHERE id = ? LIMIT 1;',
      id,
    );
    return row ? toDomain(row) : null;
  }

  async save(reminder: MaintenanceReminder): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO maintenance_reminders (
         id, vehicle_id, title, description, due_type, due_date, due_odometer_km,
         is_recurring, recurrence_interval_days, recurrence_interval_km, status,
         linked_expense_id, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         due_type = excluded.due_type,
         due_date = excluded.due_date,
         due_odometer_km = excluded.due_odometer_km,
         is_recurring = excluded.is_recurring,
         recurrence_interval_days = excluded.recurrence_interval_days,
         recurrence_interval_km = excluded.recurrence_interval_km,
         status = excluded.status,
         linked_expense_id = excluded.linked_expense_id;`,
      reminder.id,
      reminder.vehicleId,
      reminder.title,
      reminder.description ?? null,
      reminderDueTypeCodec.encode(reminder.dueType),
      toEpochSecondsOptional(reminder.dueDate),
      reminder.dueOdometerKm ?? null,
      toSqliteBool(reminder.isRecurring),
      reminder.recurrenceIntervalDays ?? null,
      reminder.recurrenceIntervalKm ?? null,
      reminderStatusCodec.encode(reminder.status),
      reminder.linkedExpenseId ?? null,
      toEpochSeconds(reminder.createdAt),
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM maintenance_reminders WHERE id = ?;', id);
  }
}
