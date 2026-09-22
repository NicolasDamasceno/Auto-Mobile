import * as Crypto from 'expo-crypto';
import { SessionTokenService } from '../../domain/services/SessionTokenService';
import { bytesToHex } from '../../utils/hex';

/** 32 bytes (256 bits) de entropia — token opaco, sem necessidade de PBKDF2 no hash dele. */
const TOKEN_BYTES = 32;

export class ExpoSessionTokenService implements SessionTokenService {
  async generateToken(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(TOKEN_BYTES);
    return bytesToHex(bytes);
  }

  async hashToken(token: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
  }
}
