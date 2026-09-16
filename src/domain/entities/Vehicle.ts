import { VehicleType } from '../enums/VehicleType';
import { FuelType } from '../enums/FuelType';

export interface VehicleProps {
  id: string;
  nickname: string;
  type: VehicleType;
  fuelType: FuelType;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  currentOdometerKm: number;
  photoUri?: string;
  createdAt: Date;
}

export class Vehicle {
  readonly id: string;
  nickname: string;
  type: VehicleType;
  fuelType: FuelType;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  currentOdometerKm: number;
  photoUri?: string;
  readonly createdAt: Date;

  constructor(props: VehicleProps) {
    if (props.currentOdometerKm < 0) {
      throw new Error('O hodômetro não pode ser negativo.');
    }

    this.id = props.id;
    this.nickname = props.nickname;
    this.type = props.type;
    this.fuelType = props.fuelType;
    this.brand = props.brand;
    this.model = props.model;
    this.year = props.year;
    this.plate = props.plate;
    this.currentOdometerKm = props.currentOdometerKm;
    this.photoUri = props.photoUri;
    this.createdAt = props.createdAt;
  }

  get isElectric(): boolean {
    return this.fuelType === FuelType.ELECTRIC;
  }

  get isHybrid(): boolean {
    return this.fuelType === FuelType.HYBRID;
  }

  /** Atualiza o hodômetro do veículo. Nunca aceita um valor menor que o atual. */
  updateOdometer(newOdometerKm: number): void {
    if (newOdometerKm < this.currentOdometerKm) {
      throw new Error('O novo hodômetro não pode ser menor que o atual.');
    }
    this.currentOdometerKm = newOdometerKm;
  }
}
