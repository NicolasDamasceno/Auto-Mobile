import { MaintenanceReminder } from '../../domain/entities/MaintenanceReminder';
import { NotificationScheduler } from '../../domain/services/NotificationScheduler';

/**
 * Placeholder até a implementação real com `expo-notifications` (permissão,
 * agendamento). Deixa ScheduleMaintenanceReminder/ViewModels funcionando sem
 * travar em uma dependência ainda não implementada.
 */
export class NoopNotificationScheduler implements NotificationScheduler {
  async scheduleForReminder(reminder: MaintenanceReminder): Promise<string> {
    return `noop-${reminder.id}`;
  }

  async cancel(_notificationId: string): Promise<void> {}
}
