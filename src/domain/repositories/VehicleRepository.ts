import { Vehicle } from '../entities/Vehicle';

/** Porta de persistência de veículos. Implementada em src/data/repositories. */
export interface VehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<void>;
  delete(id: string): Promise<void>;
}
