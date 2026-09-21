import { AuthSession } from '../entities/AuthSession';

/** Porta de persistência de sessões de login. Implementada em src/data/repositories. */
export interface AuthSessionRepository {
  save(session: AuthSession): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<AuthSession | null>;
  /** Logout: revoga a sessão atual (ou todas do motorista, se usado sem id de sessão específica). */
  deleteByDriverId(driverId: string): Promise<void>;
}
