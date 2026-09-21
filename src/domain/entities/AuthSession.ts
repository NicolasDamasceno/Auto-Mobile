/** Tempo de vida de uma sessão, renovado a cada uso (ver ResumeSession). */
export const SESSION_TTL_DAYS = 90;

export interface AuthSessionProps {
  id: string;
  driverId: string;
  /** Hash do token de sessão — o token em si só existe no SecureStore do aparelho. */
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Sessão de login local ("continuar conectado", como em uma rede social).
 * Sem backend: expiresAt é só um limite de inatividade do aparelho, não uma
 * validação de servidor — é renovado (sliding expiration) a cada abertura do
 * app enquanto o token bater, então na prática só expira se o motorista
 * ficar SESSION_TTL_DAYS sem usar o app.
 */
export class AuthSession {
  readonly id: string;
  readonly driverId: string;
  tokenHash: string;
  readonly createdAt: Date;
  expiresAt: Date;

  constructor(props: AuthSessionProps) {
    this.id = props.id;
    this.driverId = props.driverId;
    this.tokenHash = props.tokenHash;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
  }

  isExpired(now: Date): boolean {
    return now >= this.expiresAt;
  }

  /** Renova a expiração a partir de agora (sliding expiration). */
  renew(now: Date): void {
    this.expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  }
}
