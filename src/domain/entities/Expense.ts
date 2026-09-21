import { ExpenseCategory, MaintenanceType, OtherExpenseCategory } from '../enums/ExpenseCategory';
import { DieselGrade, FuelType } from '../enums/FuelType';

export interface ExpenseProps {
  id: string;
  vehicleId: string;
  date: Date;
  odometerKm: number;
  amount: number;
  notes?: string;
  attachmentUri?: string;
  createdAt: Date;
}

/** Classe base de qualquer lançamento financeiro de um veículo. */
export abstract class Expense {
  readonly id: string;
  readonly vehicleId: string;
  date: Date;
  odometerKm: number;
  amount: number;
  notes?: string;
  attachmentUri?: string;
  readonly createdAt: Date;

  protected constructor(props: ExpenseProps) {
    if (props.amount < 0) {
      throw new Error('O valor da despesa não pode ser negativo.');
    }
    this.id = props.id;
    this.vehicleId = props.vehicleId;
    this.date = props.date;
    this.odometerKm = props.odometerKm;
    this.amount = props.amount;
    this.notes = props.notes;
    this.attachmentUri = props.attachmentUri;
    this.createdAt = props.createdAt;
  }

  abstract get category(): ExpenseCategory;
}

export interface FuelExpenseProps extends ExpenseProps {
  fuelType: FuelType;
  quantity: number;
  unitPrice: number;
  fullTank: boolean;
  stationName?: string;
  /** Só válido quando fuelType === DIESEL; ignorado para os demais combustíveis. */
  dieselGrade?: DieselGrade;
}

/** Abastecimento (combustão/Arla) ou recarga (elétrico) — mesma categoria, unidade diferente. */
export class FuelExpense extends Expense {
  fuelType: FuelType;
  quantity: number;
  unitPrice: number;
  fullTank: boolean;
  stationName?: string;
  dieselGrade?: DieselGrade;

  constructor(props: FuelExpenseProps) {
    super(props);
    if (props.dieselGrade && props.fuelType !== FuelType.DIESEL) {
      throw new Error('dieselGrade só é válido quando fuelType é DIESEL.');
    }
    this.fuelType = props.fuelType;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.fullTank = props.fullTank;
    this.stationName = props.stationName;
    this.dieselGrade = props.dieselGrade;
  }

  get category(): ExpenseCategory {
    return ExpenseCategory.FUEL;
  }

  get unit(): 'L' | 'kWh' {
    return this.fuelType === FuelType.ELECTRIC ? 'kWh' : 'L';
  }
}

export interface MaintenanceExpenseProps extends ExpenseProps {
  maintenanceType: MaintenanceType;
  serviceDescription: string;
  workshopName?: string;
  partsReplaced?: string[];
  nextDueOdometerKm?: number;
  nextDueDate?: Date;
}

export class MaintenanceExpense extends Expense {
  maintenanceType: MaintenanceType;
  serviceDescription: string;
  workshopName?: string;
  partsReplaced: string[];
  nextDueOdometerKm?: number;
  nextDueDate?: Date;

  constructor(props: MaintenanceExpenseProps) {
    super(props);
    this.maintenanceType = props.maintenanceType;
    this.serviceDescription = props.serviceDescription;
    this.workshopName = props.workshopName;
    this.partsReplaced = props.partsReplaced ?? [];
    this.nextDueOdometerKm = props.nextDueOdometerKm;
    this.nextDueDate = props.nextDueDate;
  }

  get category(): ExpenseCategory {
    return ExpenseCategory.MAINTENANCE;
  }
}

export interface OtherExpenseProps extends ExpenseProps {
  subCategory: OtherExpenseCategory;
  description?: string;
}

export class OtherExpense extends Expense {
  subCategory: OtherExpenseCategory;
  description?: string;

  constructor(props: OtherExpenseProps) {
    super(props);
    this.subCategory = props.subCategory;
    this.description = props.description;
  }

  get category(): ExpenseCategory {
    return ExpenseCategory.OTHER;
  }
}
