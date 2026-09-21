# services/auth

Implementação de `PasswordHasher` (interface em `src/domain/services`).

Sem backend, então nada de bcrypt nativo/Argon2 — `expo-crypto`
(`Crypto.digestStringAsync`, SHA-256) não tem KDF embutido, então o hash
é feito manualmente: salt aleatório (`Crypto.getRandomBytesAsync`) +
várias iterações de SHA-256 (estilo PBKDF2), salt e contagem de
iterações guardados junto do hash em `drivers.password_hash`.
