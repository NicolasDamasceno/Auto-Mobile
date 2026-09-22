# services/auth

Implementações de `PasswordHasher` e `SessionTokenService` (interfaces em
`src/domain/services`), e do lado "cliente" da sessão de login
("continuar conectado").

- **`ExpoPasswordHasher`**: sem backend, então nada de bcrypt nativo/Argon2
  — `expo-crypto` (`Crypto.digestStringAsync`, SHA-256) não tem KDF
  embutido. O hash é feito manualmente: salt aleatório de 16 bytes
  (`Crypto.getRandomBytesAsync`) + 1.000 iterações de SHA-256 encadeado
  (estilo PBKDF2). O número de iterações é baixo comparado a um PBKDF2 de
  servidor (~100k) de propósito: `digestStringAsync` cruza a ponte nativa
  a cada chamada, então milhares de iterações travariam a UI por vários
  segundos. Formato salvo em `drivers.password_hash`:
  `pbkdf2-sha256$<iterações>$<salt>$<hash>` — auto-descritivo, dá pra
  mudar a contagem de iterações no futuro sem invalidar hash antigo.
  `verify()` compara em tempo constante.
- **`ExpoSessionTokenService`**: `generateToken()` usa
  `Crypto.getRandomBytesAsync` (32 bytes, token opaco de alta entropia,
  em hex); `hashToken()` é um SHA-256 de rodada única (token já é
  aleatório, não precisa de PBKDF2 como a senha).
- **`sessionTokenStorage.ts`**: guarda/lê/apaga o token bruto no
  `expo-secure-store` (Keychain/Keystore) do aparelho — fora das
  interfaces de domain, nunca no SQLite. No boot do app, lê o token daqui
  e chama `ResumeSession`; no logout, apaga a entrada daqui além de
  chamar `Logout`.
