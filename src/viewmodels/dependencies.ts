/** Instâncias únicas dos repositórios/serviços concretos, usadas por todas as stores. */
import { SQLiteAuthSessionRepository } from '../data/repositories/SQLiteAuthSessionRepository';
import { SQLiteDriverRepository } from '../data/repositories/SQLiteDriverRepository';
import { SQLiteExpenseRepository } from '../data/repositories/SQLiteExpenseRepository';
import { SQLiteMaintenanceReminderRepository } from '../data/repositories/SQLiteMaintenanceReminderRepository';
import { SQLiteVehicleRepository } from '../data/repositories/SQLiteVehicleRepository';
import { ExpoPasswordHasher } from '../services/auth/ExpoPasswordHasher';
import { ExpoSessionTokenService } from '../services/auth/ExpoSessionTokenService';
import { NoopNotificationScheduler } from '../services/notifications/NoopNotificationScheduler';

export const driverRepository = new SQLiteDriverRepository();
export const authSessionRepository = new SQLiteAuthSessionRepository();
export const vehicleRepository = new SQLiteVehicleRepository();
export const expenseRepository = new SQLiteExpenseRepository();
export const reminderRepository = new SQLiteMaintenanceReminderRepository();

export const passwordHasher = new ExpoPasswordHasher();
export const sessionTokenService = new ExpoSessionTokenService();
export const notificationScheduler = new NoopNotificationScheduler();
