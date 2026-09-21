import { Driver } from '../entities/Driver';

/** Porta de persistência do motorista. Implementada em src/data/repositories. */
export interface DriverRepository {
  findByEmail(email: string): Promise<Driver | null>;
  findById(id: string): Promise<Driver | null>;
  save(driver: Driver): Promise<void>;
}
