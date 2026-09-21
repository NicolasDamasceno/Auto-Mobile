export enum FuelType {
  GASOLINE = 'GASOLINE',
  ETHANOL = 'ETHANOL',
  FLEX = 'FLEX',
  DIESEL = 'DIESEL',
  GNV = 'GNV',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  /** Arla 32: não é combustível, mas é abastecido do mesmo jeito (por litro, no posto). */
  ARLA_32 = 'ARLA_32',
}

export const COMBUSTION_FUEL_TYPES: FuelType[] = [
  FuelType.GASOLINE,
  FuelType.ETHANOL,
  FuelType.FLEX,
  FuelType.DIESEL,
  FuelType.GNV,
];

/** Grade do diesel — só se aplica quando FuelType.DIESEL; irrelevante para os demais. */
export enum DieselGrade {
  S10 = 'S10',
  S500 = 'S500',
}
