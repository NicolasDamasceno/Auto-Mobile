import { AuthSession, SESSION_TTL_DAYS } from '../entities/AuthSession';
import { Driver } from '../entities/Driver';
import { AuthSessionRepository } from '../repositories/AuthSessionRepository';
import { DriverRepository } from '../repositories/DriverRepository';
import { PasswordHasher } from '../services/PasswordHasher';
import { SessionTokenService } from '../services/SessionTokenService';
import { AuthenticateDriver } from './AuthenticateDriver';

export interface LoginInput {
  /** Id da nova AuthSession — gerado fora do domain (ver RegisterVehicle/RegisterDriver). */
  sessionId: string;
  email: string;
  password: string;
}

export interface LoginResult {
  driver: Driver;
  /** Token bruto — o chamador (presentation/store) deve guardá-lo no SecureStore do aparelho. */
  token: string;
}

/**
 * UC00b — Login local do motorista, emitindo uma sessão de longa duração
 * ("continuar conectado") em vez de exigir senha a cada abertura do app.
 */
export class Login {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const authenticateDriver = new AuthenticateDriver(this.driverRepository, this.passwordHasher);
    const driver = await authenticateDriver.execute(input);

    const token = await this.sessionTokenService.generateToken();
    const tokenHash = await this.sessionTokenService.hashToken(token);
    const now = new Date();

    const session = new AuthSession({
      id: input.sessionId,
      driverId: driver.id,
      tokenHash,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    });
    await this.authSessionRepository.save(session);

    return { driver, token };
  }
}
