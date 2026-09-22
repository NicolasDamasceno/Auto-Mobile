/**
 * Porta de hashing de senha (ex.: PBKDF2 com salt e várias iterações).
 * Nunca compara/guarda senha em texto puro. Implementação real vive em
 * src/services/auth.
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, passwordHash: string): Promise<boolean>;
}
