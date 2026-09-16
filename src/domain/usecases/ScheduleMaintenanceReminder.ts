import { MaintenanceReminder, MaintenanceReminderProps } from '../entities/MaintenanceReminder';
import { MaintenanceReminderRepository } from '../repositories/MaintenanceReminderRepository';
import { NotificationScheduler } from '../services/NotificationScheduler';

export type ScheduleMaintenanceReminderInput = Omit<MaintenanceReminderProps, 'createdAt' | 'status'>;

/** UC12/UC13 — Cria um lembrete de manutenção preventiva e agenda a notificação local. */
export class ScheduleMaintenanceReminder {
  constructor(
    private readonly reminderRepository: MaintenanceReminderRepository,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  async execute(input: ScheduleMaintenanceReminderInput): Promise<MaintenanceReminder> {
    const reminder = new MaintenanceReminder({ ...input, createdAt: new Date() });
    await this.reminderRepository.save(reminder);
    await this.notificationScheduler.scheduleForReminder(reminder);
    return reminder;
  }
}
