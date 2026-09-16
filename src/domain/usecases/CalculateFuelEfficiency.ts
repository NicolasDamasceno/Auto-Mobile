import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { ExpenseCategory } from '../enums/ExpenseCategory';
import { FuelExpense } from '../entities/Expense';

export interface FuelEfficiencyResult {
  distanceKm: number;
  quantityConsumed: number;
  unit: 'L' | 'kWh';
  efficiency: number; // km/L ou km/kWh
}

/**
 * UC11 — Calcula o consumo médio entre dois abastecimentos/recargas
 * consecutivos com tanque cheio/carga completa.
 */
export class CalculateFuelEfficiency {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(vehicleId: string): Promise<FuelEfficiencyResult | null> {
    const expenses = await this.expenseRepository.findByVehicle({
      vehicleId,
      category: ExpenseCategory.FUEL,
    });

    const fullTankFillUps = (expenses as FuelExpense[])
      .filter((expense) => expense.fullTank)
      .sort((a, b) => a.odometerKm - b.odometerKm);

    if (fullTankFillUps.length < 2) {
      return null;
    }

    const previous = fullTankFillUps[fullTankFillUps.length - 2];
    const last = fullTankFillUps[fullTankFillUps.length - 1];

    const distanceKm = last.odometerKm - previous.odometerKm;
    if (distanceKm <= 0 || last.quantity <= 0) {
      return null;
    }

    return {
      distanceKm,
      quantityConsumed: last.quantity,
      unit: last.unit,
      efficiency: distanceKm / last.quantity,
    };
  }
}
