"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { AuthResponse, MeResponse, User } from "@/lib/types";

const TOKEN_KEY = "uninus_press_token";
const USER_KEY = "uninus_press_user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Muat sesi dari localStorage saat mount.
  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    const storedUser = typeof window !== "undefined" ? window.localStorage.getItem(USER_KEY) : null;
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(parseUser(storedUser));
    }
    setReady(true);
  }, []);

  const persist = useCallback((tokenValue: string, userValue: User) => {
    window.localStorage.setItem(TOKEN_KEY, tokenValue);
    window.localStorage.setItem(USER_KEY, JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      persist(res.token, res.user);
    },
    [persist],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
      phone?: string,
    ) => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone: phone || null,
        },
      });
      persist(res.token, res.user);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api("/auth/logout", { method: "POST", token });
      } catch {
        // Token server sudah kedaluwarsa/dihapus — tetap bersihkan sesi lokal.
      }
    }
    clearSession();
  }, [token, clearSession]);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api<MeResponse>("/auth/me", { token });
      persist(token, res.user);
    } catch {
      clearSession();
    }
  }, [token, persist, clearSession]);

  const hasRole = useCallback(
    (role: string) => !!user?.roles.includes(role),
    [user],
  );

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout, refreshMe, hasRole }),
    [user, token, ready, login, register, logout, refreshMe, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  }
  return ctx;
}