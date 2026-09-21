import { Driver } from '../entities/Driver';
import { DriverRepository } from '../repositories/DriverRepository';
import { PasswordHasher } from '../services/PasswordHasher';

export interface AuthenticateDriverInput {
  email: string;
  password: string;
}

/**
 * UC00b — Login local do motorista.
 * Mensagem de erro única (e-mail não encontrado ou senha errada) para não
 * revelar se um e-mail está cadastrado.
 */
export class AuthenticateDriver {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateDriverInput): Promise<Driver> {
    const driver = await this.driverRepository.findByEmail(input.email);
    const isValid = driver
      ? await this.passwordHasher.verify(input.password, driver.passwordHash)
      : false;

    if (!driver || !isValid) {
      throw new Error('E-mail ou senha inválidos.');
    }

    return driver;
  }
}
