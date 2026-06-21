import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { ApiRequestError, apiFetch as requestApi, type ApiFetchOptions } from '../lib/apiClient';
import { useAppStore, type ServerProgressSnapshot } from '../store/useAppStore';

export type AuthUser = {
  id: number | string;
  username: string | null;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user' | string | null;
  suspended_at: string | null;
  email_verified_at: string | null;
};

type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
  device_name?: string;
};

type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAllDevices: (currentPassword: string) => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  apiFetch: <T>(path: string, options?: ApiFetchOptions) => Promise<T>;
};

const ACTIVE_USER_KEY = 'hackpath-active-user-id';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    useAppStore.getState().setAuthenticated(false);
    useAppStore.getState().setUserName('');
    useAppStore.getState().setUserEmail('');
  }, []);

  const syncAuthenticatedUser = useCallback((authUser: AuthUser) => {
    const nextUserId = String(authUser.id);
    const previousUserId = localStorage.getItem(ACTIVE_USER_KEY);
    const appStore = useAppStore.getState();

    if (previousUserId && previousUserId !== nextUserId) {
      appStore.resetProgress();
    }

    localStorage.setItem(ACTIVE_USER_KEY, nextUserId);
    appStore.setAuthenticated(true);
    appStore.setUserName(authUser.name ?? authUser.username ?? '');
    appStore.setUserEmail(authUser.email ?? '');
  }, []);

  const syncServerProgress = useCallback(async (): Promise<void> => {
    try {
      const payload = await requestApi<{ data: ServerProgressSnapshot }>('/progress', {
        method: 'GET',
        onUnauthorized: clearSession,
      });

      useAppStore.getState().syncServerProgress(payload.data);
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.code !== 'EMAIL_NOT_VERIFIED') {
        throw error;
      }
    }
  }, [clearSession]);

  const apiFetch = useCallback(async <T,>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
    return requestApi<T>(path, {
      ...options,
      onUnauthorized: clearSession,
    });
  }, [clearSession]);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const payload = await apiFetch<{ data: { user: AuthUser } }>('/user', {
        method: 'GET',
        skipUnauthorizedHandler: true,
      });
      setUser(payload.data.user);
      syncAuthenticatedUser(payload.data.user);
      await syncServerProgress();

      return payload.data.user;
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.status === 401) {
        clearSession();
      }

      return null;
    }
  }, [apiFetch, clearSession, syncAuthenticatedUser, syncServerProgress]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const payload = await apiFetch<{
      data: {
        user: AuthUser;
      };
    }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    flushSync(() => {
      setUser(payload.data.user);
      syncAuthenticatedUser(payload.data.user);
    });
    await syncServerProgress();

    return payload.data.user;
  }, [apiFetch, syncAuthenticatedUser, syncServerProgress]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthUser> => {
    const payload = await apiFetch<{
      data: {
        user: AuthUser;
      };
    }>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    flushSync(() => {
      setUser(payload.data.user);
      syncAuthenticatedUser(payload.data.user);
    });
    await syncServerProgress();

    return payload.data.user;
  }, [apiFetch, syncAuthenticatedUser, syncServerProgress]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiFetch('/logout', {
        method: 'POST',
      });
    } finally {
      clearSession();
    }
  }, [apiFetch, clearSession]);

  const logoutAllDevices = useCallback(async (currentPassword: string): Promise<void> => {
    try {
      await apiFetch('/auth/logout-all', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword }),
      });
    } finally {
      clearSession();
    }
  }, [apiFetch, clearSession]);

  useEffect(() => {
    let mounted = true;

    refreshUser().finally(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
    logoutAllDevices,
    refreshUser,
    apiFetch,
  }), [apiFetch, isLoading, login, logout, logoutAllDevices, refreshUser, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

