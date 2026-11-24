import { create } from 'zustand';
import {
  Expense,
  FuelExpense,
  FuelExpenseProps,
  MaintenanceExpense,
  MaintenanceExpenseProps,
  OtherExpense,
  OtherExpenseProps,
} from '../domain/entities/Expense';
import { ExpenseFilter } from '../domain/repositories/ExpenseRepository';
import { CalculateFuelEfficiency, FuelEfficiencyResult } from '../domain/usecases/CalculateFuelEfficiency';
import { ExpensesSummary, ExpensesSummaryInput, GetExpensesSummary } from '../domain/usecases/GetExpensesSummary';
import { RegisterExpense } from '../domain/usecases/RegisterExpense';
import { generateId } from '../utils/id';
import { expenseRepository, reminderRepository, vehicleRepository } from './dependencies';
import { useReminderStore } from './reminderStore';
import { useVehicleStore } from './vehicleStore';

const registerExpenseUseCase = new RegisterExpense(expenseRepository, vehicleRepository, reminderRepository);
const getExpensesSummaryUseCase = new GetExpensesSummary(expenseRepository);
const calculateFuelEfficiencyUseCase = new CalculateFuelEfficiency(expenseRepository);

export type NewFuelExpenseInput = Omit<FuelExpenseProps, 'id' | 'createdAt'>;
export type NewMaintenanceExpenseInput = Omit<MaintenanceExpenseProps, 'id' | 'createdAt'>;
export type NewOtherExpenseInput = Omit<OtherExpenseProps, 'id' | 'createdAt'>;

/**
 * RegisterExpense já atualiza vehicles.odometer_km e (quando aplicável) o
 * lembrete vinculado no banco — mas isso não reflete sozinho no estado em
 * memória das outras stores. Refaz esse pedacinho aqui pra não deixar
 * veículo/lembrete desatualizados na tela até um reload manual.
 */
async function syncSideEffects(expense: Expense, fulfillsReminderId?: string): Promise<void> {
  const vehicle = await vehicleRepository.findById(expense.vehicleId);
  if (vehicle) {
    useVehicleStore.setState((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)),
    }));
  }

  if (fulfillsReminderId) {
    const reminder = await reminderRepository.findById(fulfillsReminderId);
    if (reminder) {
      useReminderStore.getState().applyCompletedReminder(reminder);
    }
  }
}

interface ExpenseState {
  expenses: Expense[];
  summary: ExpensesSummary | null;
  fuelEfficiency: FuelEfficiencyResult | null;
  status: 'idle' | 'loading';
  error: string | null;
  /** UC09. */
  loadExpenses: (filter: ExpenseFilter) => Promise<void>;
  /** UC05. */
  registerFuelExpense: (input: NewFuelExpenseInput, fulfillsReminderId?: string) => Promise<FuelExpense>;
  /** UC06. */
  registerMaintenanceExpense: (
    input: NewMaintenanceExpenseInput,
    fulfillsReminderId?: string,
  ) => Promise<MaintenanceExpense>;
  /** UC07. */
  registerOtherExpense: (input: NewOtherExpenseInput) => Promise<OtherExpense>;
  /** UC08 — edição direta, sem caso de uso próprio. */
  updateExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  /** UC10. */
  loadSummary: (input: ExpensesSummaryInput) => Promise<void>;
  /** UC11. */
  loadFuelEfficiency: (vehicleId: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  summary: null,
  fuelEfficiency: null,
  status: 'idle',
  error: null,

  loadExpenses: async (filter) => {
    set({ status: 'loading', error: null });
    try {
      const expenses = await expenseRepository.findByVehicle(filter);
      set({ expenses, status: 'idle' });
    } catch (err) {
      set({ status: 'idle', error: (err as Error).message });
    }
  },

  registerFuelExpense: async (input, fulfillsReminderId) => {
    const expense = new FuelExpense({ ...input, id: generateId(), createdAt: new Date() });
    await registerExpenseUseCase.execute(expense, fulfillsReminderId);
    await syncSideEffects(expense, fulfillsReminderId);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  registerMaintenanceExpense: async (input, fulfillsReminderId) => {
    const expense = new MaintenanceExpense({ ...input, id: generateId(), createdAt: new Date() });
    await registerExpenseUseCase.execute(expense, fulfillsReminderId);
    await syncSideEffects(expense, fulfillsReminderId);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  registerOtherExpense: async (input) => {
    const expense = new OtherExpense({ ...input, id: generateId(), createdAt: new Date() });
    await registerExpenseUseCase.execute(expense);
    await syncSideEffects(expense);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  updateExpense: async (expense) => {
    await expenseRepository.save(expense);
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }));
  },

  removeExpense: async (id) => {
    await expenseRepository.delete(id);
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
  },

  loadSummary: async (input) => {
    const summary = await getExpensesSummaryUseCase.execute(input);
    set({ summary });
  },

  loadFuelEfficiency: async (vehicleId) => {
    const fuelEfficiency = await calculateFuelEfficiencyUseCase.execute(vehicleId);
    set({ fuelEfficiency });
  },
}));
