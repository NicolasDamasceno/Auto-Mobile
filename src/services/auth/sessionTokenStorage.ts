import * as SecureStore from 'expo-secure-store';

/**
 * Guarda o token bruto de sessão ("continuar conectado") no Keychain/Keystore
 * do aparelho — nunca no SQLite (ver AuthSession, que só guarda o hash).
 */
const SESSION_TOKEN_KEY = 'automobile.session_token';

export async function saveSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function loadSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
