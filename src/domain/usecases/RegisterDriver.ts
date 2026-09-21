import { Driver } from '../entities/Driver';
import { DriverRepository } from '../repositories/DriverRepository';
import { PasswordHasher } from '../services/PasswordHasher';

export const MIN_PASSWORD_LENGTH = 8;

export interface RegisterDriverInput {
  id: string;
  name: string;
  email: string;
  password: string;
}

/** UC00 — Cadastrar motorista (cria a conta local usada pelo login). */
export class RegisterDriver {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterDriverInput): Promise<Driver> {
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    const existing = await this.driverRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('Já existe um motorista cadastrado com este e-mail.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const driver = new Driver({
      id: input.id,
      name: input.name,
      email: input.email,
      passwordHash,
      createdAt: new Date(),
    });
    await this.driverRepository.save(driver);
    return driver;
  }
}
