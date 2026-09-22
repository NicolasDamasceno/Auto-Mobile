import { create } from 'zustand';
import { Vehicle } from '../domain/entities/Vehicle';
import { RegisterVehicle, RegisterVehicleInput } from '../domain/usecases/RegisterVehicle';
import { generateId } from '../utils/id';
import { vehicleRepository } from './dependencies';

const registerVehicleUseCase = new RegisterVehicle(vehicleRepository);

export type NewVehicleInput = Omit<RegisterVehicleInput, 'id'>;

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  status: 'idle' | 'loading';
  error: string | null;
  /** UC01. */
  loadVehicles: () => Promise<void>;
  registerVehicle: (input: NewVehicleInput) => Promise<Vehicle>;
  /** UC02 — sem caso de uso próprio: editar é só persistir a entidade já mutada. */
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  /** UC03. */
  removeVehicle: (id: string) => Promise<void>;
  /** UC04. */
  setActiveVehicle: (id: string | null) => void;
  activeVehicle: () => Vehicle | null;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  activeVehicleId: null,
  status: 'idle',
  error: null,

  loadVehicles: async () => {
    set({ status: 'loading', error: null });
    try {
      const vehicles = await vehicleRepository.findAll();
      set((state) => ({
        vehicles,
        status: 'idle',
        activeVehicleId: state.activeVehicleId ?? vehicles[0]?.id ?? null,
      }));
    } catch (err) {
      set({ status: 'idle', error: (err as Error).message });
    }
  },

  registerVehicle: async (input) => {
    const vehicle = await registerVehicleUseCase.execute({ ...input, id: generateId() });
    set((state) => ({
      vehicles: [...state.vehicles, vehicle],
      activeVehicleId: state.activeVehicleId ?? vehicle.id,
    }));
    return vehicle;
  },

  updateVehicle: async (vehicle) => {
    await vehicleRepository.save(vehicle);
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)),
    }));
  },

  removeVehicle: async (id) => {
    await vehicleRepository.delete(id);
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
      activeVehicleId: state.activeVehicleId === id ? null : state.activeVehicleId,
    }));
  },

  setActiveVehicle: (id) => set({ activeVehicleId: id }),

  activeVehicle: () => {
    const { vehicles, activeVehicleId } = get();
    return vehicles.find((v) => v.id === activeVehicleId) ?? null;
  },
}));
