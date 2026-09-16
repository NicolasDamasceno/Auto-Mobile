import { MaintenanceReminder } from '../entities/MaintenanceReminder';

/**
 * Porta para agendamento de notificações locais.
 * Implementação real (expo-notifications) vive em src/services/notifications.
 */
export interface NotificationScheduler {
  scheduleForReminder(reminder: MaintenanceReminder): Promise<string>;
  cancel(notificationId: string): Promise<void>;
}
