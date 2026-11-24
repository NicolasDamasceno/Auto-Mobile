import { create } from 'zustand';
import { MaintenanceReminder } from '../domain/entities/MaintenanceReminder';
import {
  ScheduleMaintenanceReminder,
  ScheduleMaintenanceReminderInput,
} from '../domain/usecases/ScheduleMaintenanceReminder';
import { generateId } from '../utils/id';
import { notificationScheduler, reminderRepository } from './dependencies';

const scheduleReminderUseCase = new ScheduleMaintenanceReminder(reminderRepository, notificationScheduler);

export type NewReminderInput = Omit<ScheduleMaintenanceReminderInput, 'id'>;

interface ReminderState {
  reminders: MaintenanceReminder[];
  status: 'idle' | 'loading';
  error: string | null;
  /** Lembretes de um veículo (tela de detalhe do veículo). */
  loadByVehicle: (vehicleId: string) => Promise<void>;
  /** Lembretes pendentes/vencidos de todos os veículos (home/dashboard). */
  loadPending: () => Promise<void>;
  /** UC12/UC13. */
  scheduleReminder: (input: NewReminderInput) => Promise<MaintenanceReminder>;
  /** Edição direta (ex.: motorista ajusta a data do lembrete) — sem caso de uso próprio. */
  updateReminder: (reminder: MaintenanceReminder) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  /** Reflete localmente um lembrete concluído pelo RegisterExpense (ver expenseStore). */
  applyCompletedReminder: (reminder: MaintenanceReminder) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  reminders: [],
  status: 'idle',
  error: null,

  loadByVehicle: async (vehicleId) => {
    set({ status: 'loading', error: null });
    try {
      const reminders = await reminderRepository.findByVehicle(vehicleId);
      set({ reminders, status: 'idle' });
    } catch (err) {
      set({ status: 'idle', error: (err as Error).message });
    }
  },

  loadPending: async () => {
    set({ status: 'loading', error: null });
    try {
      const reminders = await reminderRepository.findPending();
      set({ reminders, status: 'idle' });
    } catch (err) {
      set({ status: 'idle', error: (err as Error).message });
    }
  },

  scheduleReminder: async (input) => {
    const reminder = await scheduleReminderUseCase.execute({ ...input, id: generateId() });
    set((state) => ({ reminders: [...state.reminders, reminder] }));
    return reminder;
  },

  updateReminder: async (reminder) => {
    await reminderRepository.save(reminder);
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
    }));
  },

  removeReminder: async (id) => {
    await reminderRepository.delete(id);
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
  },

  applyCompletedReminder: (reminder) => {
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === reminder.id ? reminder : r)),
    }));
  },
}));
