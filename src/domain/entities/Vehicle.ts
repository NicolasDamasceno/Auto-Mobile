import { VehicleType } from '../enums/VehicleType';
import { FuelType } from '../enums/FuelType';

/** Combustíveis de fábrica sobre os quais é possível instalar um kit GNV (bi/tricombustível). */
const GNV_KIT_COMPATIBLE_FUEL_TYPES: FuelType[] = [FuelType.GASOLINE, FuelType.ETHANOL, FuelType.FLEX];

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
  /**
   * Kit de GNV instalado sobre o combustível de fábrica (fuelType), tornando o
   * veículo bi/tricombustível. Só válido para fuelType GASOLINE/ETHANOL/FLEX —
   * um veículo já dedicado a GNV de fábrica usa fuelType = GNV diretamente.
   */
  hasGnvKit?: boolean;
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
  hasGnvKit: boolean;

  constructor(props: VehicleProps) {
    if (props.currentOdometerKm < 0) {
      throw new Error('O hodômetro não pode ser negativo.');
    }
    if (props.hasGnvKit && !GNV_KIT_COMPATIBLE_FUEL_TYPES.includes(props.fuelType)) {
      throw new Error('hasGnvKit só é válido para veículos GASOLINE, ETHANOL ou FLEX.');
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
    this.hasGnvKit = props.hasGnvKit ?? false;
  }

  get isElectric(): boolean {
    return this.fuelType === FuelType.ELECTRIC;
  }

  get isHybrid(): boolean {
    return this.fuelType === FuelType.HYBRID;
  }

  /** Combustíveis aceitos em um FuelExpense deste veículo (fábrica + kit GNV, se houver). */
  get acceptedFuelTypes(): FuelType[] {
    const types = [this.fuelType];
    if (this.hasGnvKit) {
      types.push(FuelType.GNV);
    }
    return types;
  }

  /** Atualiza o hodômetro do veículo. Nunca aceita um valor menor que o atual. */
  updateOdometer(newOdometerKm: number): void {
    if (newOdometerKm < this.currentOdometerKm) {
      throw new Error('O novo hodômetro não pode ser menor que o atual.');
    }
    this.currentOdometerKm = newOdometerKm;
  }
}
