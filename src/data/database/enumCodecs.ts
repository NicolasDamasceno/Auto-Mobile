/**
 * Códigos numéricos dos enums de domínio, pra guardar como INTEGER no
 * SQLite em vez de TEXT (ver docs/DOMAIN_MODEL.md e docs/ARCHITECTURE.md).
 *
 * IMPORTANTE: a posição de cada valor é o código gravado no banco. Nunca
 * reordene ou remova um valor existente — só acrescente no final da lista,
 * senão dados já salvos passam a ser lidos como outro enum.
 */
import { VehicleType } from '../../domain/enums/VehicleType';
import { DieselGrade, FuelType } from '../../domain/enums/FuelType';
import { ExpenseCategory, MaintenanceType, OtherExpenseCategory } from '../../domain/enums/ExpenseCategory';
import { ReminderDueType, ReminderStatus } from '../../domain/enums/MaintenanceReminderEnums';

class EnumCodec<T extends string> {
  private readonly codeByValue = new Map<T, number>();
  private readonly valueByCode = new Map<number, T>();

  constructor(orderedValues: T[]) {
    orderedValues.forEach((value, code) => {
      this.codeByValue.set(value, code);
      this.valueByCode.set(code, value);
    });
  }

  encode(value: T): number {
    const code = this.codeByValue.get(value);
    if (code === undefined) {
      throw new Error(`Valor de enum desconhecido: ${value}`);
    }
    return code;
  }

  encodeOptional(value: T | undefined): number | null {
    return value === undefined ? null : this.encode(value);
  }

  decode(code: number): T {
    const value = this.valueByCode.get(code);
    if (value === undefined) {
      throw new Error(`Código de enum desconhecido: ${code}`);
    }
    return value;
  }

  decodeOptional(code: number | null | undefined): T | undefined {
    return code === null || code === undefined ? undefined : this.decode(code);
  }
}

export const vehicleTypeCodec = new EnumCodec<VehicleType>([
  VehicleType.CAR,
  VehicleType.MOTORCYCLE,
  VehicleType.PICKUP_TRUCK,
  VehicleType.SUV,
  VehicleType.VAN,
  VehicleType.OTHER,
]);

export const fuelTypeCodec = new EnumCodec<FuelType>([
  FuelType.GASOLINE,
  FuelType.ETHANOL,
  FuelType.FLEX,
  FuelType.DIESEL,
  FuelType.GNV,
  FuelType.ELECTRIC,
  FuelType.HYBRID,
  FuelType.ARLA_32,
]);

export const dieselGradeCodec = new EnumCodec<DieselGrade>([DieselGrade.S10, DieselGrade.S500]);

export const expenseCategoryCodec = new EnumCodec<ExpenseCategory>([
  ExpenseCategory.FUEL,
  ExpenseCategory.MAINTENANCE,
  ExpenseCategory.OTHER,
]);

export const maintenanceTypeCodec = new EnumCodec<MaintenanceType>([
  MaintenanceType.PREVENTIVE,
  MaintenanceType.CORRECTIVE,
]);

export const otherExpenseCategoryCodec = new EnumCodec<OtherExpenseCategory>([
  OtherExpenseCategory.INSURANCE,
  OtherExpenseCategory.TAXES,
  OtherExpenseCategory.CAR_WASH,
  OtherExpenseCategory.PARKING,
  OtherExpenseCategory.TOLL,
  OtherExpenseCategory.FINE,
  OtherExpenseCategory.ACCESSORY,
  OtherExpenseCategory.DOCUMENTATION,
  OtherExpenseCategory.OTHER,
]);

export const reminderDueTypeCodec = new EnumCodec<ReminderDueType>([
  ReminderDueType.BY_DATE,
  ReminderDueType.BY_ODOMETER,
  ReminderDueType.BOTH,
]);

export const reminderStatusCodec = new EnumCodec<ReminderStatus>([
  ReminderStatus.PENDING,
  ReminderStatus.COMPLETED,
  ReminderStatus.OVERDUE,
]);
