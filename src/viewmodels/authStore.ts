import { create } from 'zustand';
import { Driver } from '../domain/entities/Driver';
import { Login } from '../domain/usecases/Login';
import { Logout } from '../domain/usecases/Logout';
import { RegisterDriver } from '../domain/usecases/RegisterDriver';
import { ResumeSession } from '../domain/usecases/ResumeSession';
import { clearSessionToken, loadSessionToken, saveSessionToken } from '../services/auth/sessionTokenStorage';
import { generateId } from '../utils/id';
import { authSessionRepository, driverRepository, passwordHasher, sessionTokenService } from './dependencies';

const loginUseCase = new Login(driverRepository, authSessionRepository, passwordHasher, sessionTokenService);
const registerDriverUseCase = new RegisterDriver(driverRepository, passwordHasher);
const resumeSessionUseCase = new ResumeSession(authSessionRepository, driverRepository, sessionTokenService);
const logoutUseCase = new Logout(authSessionRepository);

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  driver: Driver | null;
  status: AuthStatus;
  error: string | null;
  /** UC00c — roda no boot do app: tenta reaproveitar o token salvo no SecureStore. */
  bootstrap: () => Promise<void>;
  /** UC00a seguido de login automático, pra não pedir senha de novo logo após o cadastro. */
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  driver: null,
  status: 'checking',
  error: null,

  bootstrap: async () => {
    const token = await loadSessionToken();
    if (!token) {
      set({ status: 'unauthenticated', driver: null });
      return;
    }

    const driver = await resumeSessionUseCase.execute({ token });
    if (!driver) {
      await clearSessionToken();
      set({ status: 'unauthenticated', driver: null });
      return;
    }

    set({ status: 'authenticated', driver, error: null });
  },

  register: async (name, email, password) => {
    set({ error: null });
    try {
      await registerDriverUseCase.execute({ id: generateId(), name, email, password });
      await get().login(email, password);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { driver, token } = await loginUseCase.execute({ sessionId: generateId(), email, password });
      await saveSessionToken(token);
      set({ driver, status: 'authenticated' });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    const driver = get().driver;
    if (driver) {
      await logoutUseCase.execute({ driverId: driver.id });
    }
    await clearSessionToken();
    set({ driver: null, status: 'unauthenticated', error: null });
  },
}));
