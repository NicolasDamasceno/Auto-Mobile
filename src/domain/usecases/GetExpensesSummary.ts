import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { ExpenseCategory } from '../enums/ExpenseCategory';

export interface ExpensesSummaryInput {
  vehicleId: string;
  startDate?: Date;
  endDate?: Date;
}

export type ExpensesSummary = Record<ExpenseCategory, number> & { total: number };

/** UC09/UC10 — Consolida gastos de um veículo por categoria, dentro de um período opcional. */
export class GetExpensesSummary {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: ExpensesSummaryInput): Promise<ExpensesSummary> {
    const expenses = await this.expenseRepository.findByVehicle({
      vehicleId: input.vehicleId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    const summary: ExpensesSummary = {
      [ExpenseCategory.FUEL]: 0,
      [ExpenseCategory.MAINTENANCE]: 0,
      [ExpenseCategory.OTHER]: 0,
      total: 0,
    };

    for (const expense of expenses) {
      summary[expense.category] += expense.amount;
      summary.total += expense.amount;
    }

    return summary;
  }
}
