# services/auth

Implementações de `PasswordHasher` e `SessionTokenService` (interfaces em
`src/domain/services`), e do lado "cliente" da sessão de login
("continuar conectado").

- **`PasswordHasher`**: sem backend, então nada de bcrypt nativo/Argon2 —
  `expo-crypto` (`Crypto.digestStringAsync`, SHA-256) não tem KDF
  embutido, então o hash é feito manualmente: salt aleatório
  (`Crypto.getRandomBytesAsync`) + várias iterações de SHA-256 (estilo
  PBKDF2), salt e contagem de iterações guardados junto do hash em
  `drivers.password_hash`.
- **`SessionTokenService`**: `generateToken()` usa
  `Crypto.getRandomBytesAsync` (token opaco, alta entropia);
  `hashToken()` é um SHA-256 de rodada única (token já é aleatório, não
  precisa de PBKDF2 como a senha).
- **Guarda do token no aparelho**: fora das interfaces de domain — o
  token bruto retornado por `Login`/gerado no cadastro é salvo com
  `expo-secure-store` (Keychain/Keystore), nunca no SQLite. No boot do
  app, lê o token do SecureStore e chama `ResumeSession`; no logout,
  apaga a entrada do SecureStore além de chamar `Logout`.
