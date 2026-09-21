/**
 * Porta de geração/hash do token de sessão local ("continuar conectado").
 * Diferente do PasswordHasher: o token já nasce aleatório e com alta
 * entropia, então o hash não precisa ser lento/salgado (PBKDF2) — um
 * SHA-256 de uma rodada já é suficiente contra força bruta. Implementação
 * real (expo-crypto) vive em src/services/auth.
 */
export interface SessionTokenService {
  /** Gera um token opaco aleatório — entregue ao chamador para guardar no SecureStore do aparelho. */
  generateToken(): Promise<string>;
  /** Hash determinístico do token, para guardar/comparar no banco (nunca o token em si). */
  hashToken(token: string): Promise<string>;
}
