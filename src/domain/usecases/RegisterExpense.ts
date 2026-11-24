import { Expense, FuelExpense, MaintenanceExpense } from '../entities/Expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { VehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceReminderRepository } from '../repositories/MaintenanceReminderRepository';

/**
 * UC05/UC06/UC07 — Registrar despesa (abastecimento/recarga, manutenção ou outra).
 * Valida que um FuelExpense é compatível com o veículo (regra 2/8 do
 * DOMAIN_MODEL.md), atualiza o hodômetro do veículo e, se a despesa for uma
 * manutenção vinculada a um lembrete pendente, conclui o lembrete (UC14).
 */
export class RegisterExpense {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly reminderRepository: MaintenanceReminderRepository,
  ) {}

  async execute(expense: Expense, fulfillsReminderId?: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(expense.vehicleId);
    if (!vehicle) {
      throw new Error('Veículo não encontrado.');
    }

    if (expense instanceof FuelExpense && !vehicle.acceptedFuelTypes.includes(expense.fuelType)) {
      throw new Error(`O veículo "${vehicle.nickname}" não aceita abastecimento com ${expense.fuelType}.`);
    }

    await this.expenseRepository.save(expense);

    vehicle.updateOdometer(expense.odometerKm);
    await this.vehicleRepository.save(vehicle);

    if (fulfillsReminderId && expense instanceof MaintenanceExpense) {
      const reminder = await this.reminderRepository.findById(fulfillsReminderId);
      if (reminder) {
        reminder.complete(expense.id);
        await this.reminderRepository.save(reminder);
      }
    }
  }
}
