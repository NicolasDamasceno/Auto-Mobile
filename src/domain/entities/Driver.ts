const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DriverProps {
  id: string;
  name: string;
  email: string;
  /** Hash da senha (nunca a senha em texto puro) — gerado por um PasswordHasher. */
  passwordHash: string;
  createdAt: Date;
}

/** Motorista dono do dispositivo/app. Usado só para a trava de login local. */
export class Driver {
  readonly id: string;
  name: string;
  email: string;
  passwordHash: string;
  readonly createdAt: Date;

  constructor(props: DriverProps) {
    if (!EMAIL_REGEX.test(props.email)) {
      throw new Error('E-mail inválido.');
    }
    if (!props.name.trim()) {
      throw new Error('Nome não pode ser vazio.');
    }
    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }
}
