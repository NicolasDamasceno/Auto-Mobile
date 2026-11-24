import { VehicleType } from '../enums/VehicleType';
import { FuelType } from '../enums/FuelType';

/** Combustíveis de fábrica sobre os quais é possível instalar um kit GNV (bi/tricombustível). */
const GNV_KIT_COMPATIBLE_FUEL_TYPES: FuelType[] = [FuelType.GASOLINE, FuelType.ETHANOL, FuelType.FLEX];

/** Combustíveis válidos para o motor térmico de um veículo HYBRID (o motor elétrico é sempre implícito via ELECTRIC). */
const HYBRID_COMBUSTION_FUEL_TYPES: FuelType[] = [FuelType.GASOLINE, FuelType.ETHANOL, FuelType.FLEX];

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
  /**
   * Combustível do motor térmico do veículo — obrigatório quando
   * fuelType = HYBRID (GASOLINE, ETHANOL ou FLEX), inválido para qualquer
   * outro fuelType (ver regra 2 do DOMAIN_MODEL.md: um híbrido aceita
   * ELECTRIC ou esse combustível no FuelExpense).
   */
  combustionFuelType?: FuelType;
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
  combustionFuelType?: FuelType;

  constructor(props: VehicleProps) {
    if (props.currentOdometerKm < 0) {
      throw new Error('O hodômetro não pode ser negativo.');
    }
    if (props.hasGnvKit && !GNV_KIT_COMPATIBLE_FUEL_TYPES.includes(props.fuelType)) {
      throw new Error('hasGnvKit só é válido para veículos GASOLINE, ETHANOL ou FLEX.');
    }
    if (props.fuelType === FuelType.HYBRID) {
      if (!props.combustionFuelType) {
        throw new Error('Veículos HYBRID precisam informar combustionFuelType (GASOLINE, ETHANOL ou FLEX).');
      }
      if (!HYBRID_COMBUSTION_FUEL_TYPES.includes(props.combustionFuelType)) {
        throw new Error('combustionFuelType só pode ser GASOLINE, ETHANOL ou FLEX.');
      }
    } else if (props.combustionFuelType) {
      throw new Error('combustionFuelType só é válido para veículos HYBRID.');
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
    this.combustionFuelType = props.combustionFuelType;
  }

  get isElectric(): boolean {
    return this.fuelType === FuelType.ELECTRIC;
  }

  get isHybrid(): boolean {
    return this.fuelType === FuelType.HYBRID;
  }

  /**
   * Combustíveis aceitos em um FuelExpense deste veículo: para HYBRID,
   * ELECTRIC + o combustionFuelType configurado (regra 2); para os demais,
   * o fuelType de fábrica, mais GNV se houver kit instalado (regra 9), mais
   * ARLA_32 se for DIESEL (regra 8 — sistemas SCR são exclusivos de motor a diesel).
   */
  get acceptedFuelTypes(): FuelType[] {
    if (this.fuelType === FuelType.HYBRID) {
      // combustionFuelType é garantido pelo constructor sempre que fuelType = HYBRID.
      return [FuelType.ELECTRIC, this.combustionFuelType as FuelType];
    }

    const types = [this.fuelType];
    if (this.hasGnvKit) {
      types.push(FuelType.GNV);
    }
    if (this.fuelType === FuelType.DIESEL) {
      types.push(FuelType.ARLA_32);
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
