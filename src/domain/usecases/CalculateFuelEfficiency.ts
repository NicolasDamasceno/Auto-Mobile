import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { ExpenseCategory } from '../enums/ExpenseCategory';
import { FuelType } from '../enums/FuelType';
import { FuelExpense } from '../entities/Expense';

export interface FuelEfficiencyResult {
  distanceKm: number;
  quantityConsumed: number;
  unit: 'L' | 'kWh';
  efficiency: number; // km/L ou km/kWh
}

/**
 * UC11 — Calcula o consumo médio entre dois abastecimentos/recargas
 * consecutivos com tanque cheio/carga completa. ARLA_32 é excluído (regra 8
 * do DOMAIN_MODEL.md): é comprado por litro, mas não é combustível.
 */
export class CalculateFuelEfficiency {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(vehicleId: string): Promise<FuelEfficiencyResult | null> {
    const expenses = await this.expenseRepository.findByVehicle({
      vehicleId,
      category: ExpenseCategory.FUEL,
    });

    const fullTankFillUps = (expenses as FuelExpense[])
      .filter((expense) => expense.fullTank && expense.fuelType !== FuelType.ARLA_32)
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
