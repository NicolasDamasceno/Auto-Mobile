import * as Crypto from 'expo-crypto';
import { PasswordHasher } from '../../domain/services/PasswordHasher';
import { bytesToHex } from '../../utils/hex';

const SALT_BYTES = 16;
/**
 * `digestStringAsync` cruza a ponte nativa a cada chamada — um PBKDF2 de
 * servidor (~100k iterações) travaria a UI por vários segundos aqui. 1.000
 * iterações é o meio-termo: ainda dificulta força bruta offline sem deixar
 * login/cadastro perceptivelmente lento.
 */
const ITERATIONS = 1000;
const ALGORITHM_TAG = 'pbkdf2-sha256';

async function deriveHash(password: string, salt: string, iterations: number): Promise<string> {
  let digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
  for (let round = 1; round < iterations; round += 1) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${digest}:${password}:${salt}`);
  }
  return digest;
}

/** Compara em tempo constante — evita vazar, pelo tempo de resposta, quanto do hash bateu. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Implementação de PasswordHasher com expo-crypto: SHA-256 + salt aleatório
 * + iterações manuais (não há PBKDF2/bcrypt/Argon2 nativo no Expo managed
 * sem dev client). Formato armazenado: "pbkdf2-sha256$<iterações>$<salt>$<hash>"
 * — auto-descritivo, permite mudar ITERATIONS no futuro sem invalidar hashes antigos.
 */
export class ExpoPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    const saltBytes = await Crypto.getRandomBytesAsync(SALT_BYTES);
    const salt = bytesToHex(saltBytes);
    const derived = await deriveHash(plainPassword, salt, ITERATIONS);
    return `${ALGORITHM_TAG}$${ITERATIONS}$${salt}$${derived}`;
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    const parts = passwordHash.split('$');
    if (parts.length !== 4 || parts[0] !== ALGORITHM_TAG) {
      return false;
    }
    const [, iterationsRaw, salt, expected] = parts;
    const iterations = Number(iterationsRaw);
    if (!Number.isInteger(iterations) || iterations <= 0) {
      return false;
    }

    const derived = await deriveHash(plainPassword, salt, iterations);
    return timingSafeEqual(derived, expected);
  }
}
