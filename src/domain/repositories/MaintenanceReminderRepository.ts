import { MaintenanceReminder } from '../entities/MaintenanceReminder';

/** Porta de persistência de lembretes de manutenção. */
export interface MaintenanceReminderRepository {
  findByVehicle(vehicleId: string): Promise<MaintenanceReminder[]>;
  findPending(): Promise<MaintenanceReminder[]>;
  findById(id: string): Promise<MaintenanceReminder | null>;
  save(reminder: MaintenanceReminder): Promise<void>;
  delete(id: string): Promise<void>;
}
