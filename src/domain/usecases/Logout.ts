import { AuthSessionRepository } from '../repositories/AuthSessionRepository';

export interface LogoutInput {
  driverId: string;
}

/** Logout explícito — revoga a sessão local; o chamador ainda precisa apagar o token do SecureStore. */
export class Logout {
  constructor(private readonly authSessionRepository: AuthSessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    await this.authSessionRepository.deleteByDriverId(input.driverId);
  }
}
