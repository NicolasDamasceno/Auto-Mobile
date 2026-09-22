import { Driver } from '../entities/Driver';
import { AuthSessionRepository } from '../repositories/AuthSessionRepository';
import { DriverRepository } from '../repositories/DriverRepository';
import { SessionTokenService } from '../services/SessionTokenService';

export interface ResumeSessionInput {
  /** Token bruto lido do SecureStore do aparelho na abertura do app. */
  token: string;
  now?: Date;
}

/**
 * Login automático na abertura do app a partir do token salvo no aparelho
 * ("continuar conectado"). Se o token for válido e a sessão não tiver
 * expirado, renova a expiração (sliding expiration) e retorna o Driver —
 * assim o app só volta a pedir senha se ficar SESSION_TTL_DAYS sem uso.
 */
export class ResumeSession {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly driverRepository: DriverRepository,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: ResumeSessionInput): Promise<Driver | null> {
    const tokenHash = await this.sessionTokenService.hashToken(input.token);
    const session = await this.authSessionRepository.findByTokenHash(tokenHash);
    if (!session) {
      return null;
    }

    const now = input.now ?? new Date();
    if (session.isExpired(now)) {
      return null;
    }

    const driver = await this.driverRepository.findById(session.driverId);
    if (!driver) {
      return null;
    }

    session.renew(now);
    await this.authSessionRepository.save(session);

    return driver;
  }
}
