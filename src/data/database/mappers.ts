/** Conversões domínio <-> tipos compactos de armazenamento (ver docs/ARCHITECTURE.md). */

export function toEpochSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function fromEpochSeconds(seconds: number): Date {
  return new Date(seconds * 1000);
}

export function toEpochSecondsOptional(date: Date | undefined): number | null {
  return date === undefined ? null : toEpochSeconds(date);
}

export function fromEpochSecondsOptional(seconds: number | null | undefined): Date | undefined {
  return seconds === null || seconds === undefined ? undefined : fromEpochSeconds(seconds);
}

/** Reais (float) -> centavos (INTEGER), sem os erros de arredondamento de REAL. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** Litros/kWh (float) -> centésimos (INTEGER). */
export function toHundredths(value: number): number {
  return Math.round(value * 100);
}

export function fromHundredths(hundredths: number): number {
  return hundredths / 100;
}

export function toSqliteBool(value: boolean): number {
  return value ? 1 : 0;
}

export function fromSqliteBool(value: number): boolean {
  return value === 1;
}
