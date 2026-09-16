import { Vehicle, VehicleProps } from '../entities/Vehicle';
import { VehicleRepository } from '../repositories/VehicleRepository';

export type RegisterVehicleInput = Omit<VehicleProps, 'createdAt'>;

/** UC01 — Cadastrar veículo. */
export class RegisterVehicle {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(input: RegisterVehicleInput): Promise<Vehicle> {
    const vehicle = new Vehicle({ ...input, createdAt: new Date() });
    await this.vehicleRepository.save(vehicle);
    return vehicle;
  }
}
