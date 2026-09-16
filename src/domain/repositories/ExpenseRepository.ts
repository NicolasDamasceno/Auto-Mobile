import { Expense } from '../entities/Expense';
import { ExpenseCategory } from '../enums/ExpenseCategory';

export interface ExpenseFilter {
  vehicleId: string;
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
}

/** Porta de persistência de despesas (FuelExpense | MaintenanceExpense | OtherExpense). */
export interface ExpenseRepository {
  findByVehicle(filter: ExpenseFilter): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  save(expense: Expense): Promise<void>;
  delete(id: string): Promise<void>;
}
