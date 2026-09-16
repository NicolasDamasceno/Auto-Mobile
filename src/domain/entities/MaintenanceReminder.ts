import { ReminderDueType, ReminderStatus } from '../enums/MaintenanceReminderEnums';

export interface MaintenanceReminderProps {
  id: string;
  vehicleId: string;
  title: string;
  description?: string;
  dueType: ReminderDueType;
  dueDate?: Date;
  dueOdometerKm?: number;
  isRecurring: boolean;
  recurrenceIntervalDays?: number;
  recurrenceIntervalKm?: number;
  status?: ReminderStatus;
  linkedExpenseId?: string;
  createdAt: Date;
}

export class MaintenanceReminder {
  readonly id: string;
  readonly vehicleId: string;
  title: string;
  description?: string;
  dueType: ReminderDueType;
  dueDate?: Date;
  dueOdometerKm?: number;
  isRecurring: boolean;
  recurrenceIntervalDays?: number;
  recurrenceIntervalKm?: number;
  status: ReminderStatus;
  linkedExpenseId?: string;
  readonly createdAt: Date;

  constructor(props: MaintenanceReminderProps) {
    const needsDate = props.dueType === ReminderDueType.BY_DATE || props.dueType === ReminderDueType.BOTH;
    const needsOdometer = props.dueType === ReminderDueType.BY_ODOMETER || props.dueType === ReminderDueType.BOTH;

    if (needsDate && !props.dueDate) {
      throw new Error('Lembrete por data precisa de dueDate.');
    }
    if (needsOdometer && props.dueOdometerKm === undefined) {
      throw new Error('Lembrete por km precisa de dueOdometerKm.');
    }

    this.id = props.id;
    this.vehicleId = props.vehicleId;
    this.title = props.title;
    this.description = props.description;
    this.dueType = props.dueType;
    this.dueDate = props.dueDate;
    this.dueOdometerKm = props.dueOdometerKm;
    this.isRecurring = props.isRecurring;
    this.recurrenceIntervalDays = props.recurrenceIntervalDays;
    this.recurrenceIntervalKm = props.recurrenceIntervalKm;
    this.status = props.status ?? ReminderStatus.PENDING;
    this.linkedExpenseId = props.linkedExpenseId;
    this.createdAt = props.createdAt;
  }

  /** Verifica se o lembrete venceu por data e/ou por km, conforme seu dueType. */
  isOverdue(currentOdometerKm: number, currentDate: Date): boolean {
    if (this.status === ReminderStatus.COMPLETED) {
      return false;
    }

    const dateOverdue = this.dueDate !== undefined && currentDate >= this.dueDate;
    const odometerOverdue = this.dueOdometerKm !== undefined && currentOdometerKm >= this.dueOdometerKm;

    switch (this.dueType) {
      case ReminderDueType.BY_DATE:
        return dateOverdue;
      case ReminderDueType.BY_ODOMETER:
        return odometerOverdue;
      case ReminderDueType.BOTH:
        return dateOverdue || odometerOverdue;
      default:
        return false;
    }
  }

  /** Marca o lembrete como concluído, vinculando a despesa de manutenção que o atendeu. */
  complete(expenseId: string): void {
    this.status = ReminderStatus.COMPLETED;
    this.linkedExpenseId = expenseId;
  }
}
