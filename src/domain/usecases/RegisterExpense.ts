import { Expense } from '../entities/Expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { VehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceReminderRepository } from '../repositories/MaintenanceReminderRepository';
import { MaintenanceExpense } from '../entities/Expense';

/**
 * UC05/UC06/UC07 — Registrar despesa (abastecimento/recarga, manutenção ou outra).
 * Atualiza o hodômetro do veículo e, se a despesa for uma manutenção vinculada
 * a um lembrete pendente, conclui o lembrete (UC14).
 */
export class RegisterExpense {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly reminderRepository: MaintenanceReminderRepository,
  ) {}

  async execute(expense: Expense, fulfillsReminderId?: string): Promise<void> {
    await this.expenseRepository.save(expense);

    const vehicle = await this.vehicleRepository.findById(expense.vehicleId);
    if (vehicle) {
      vehicle.updateOdometer(expense.odometerKm);
      await this.vehicleRepository.save(vehicle);
    }

    if (fulfillsReminderId && expense instanceof MaintenanceExpense) {
      const reminder = await this.reminderRepository.findById(fulfillsReminderId);
      if (reminder) {
        reminder.complete(expense.id);
        await this.reminderRepository.save(reminder);
      }
    }
  }
}
