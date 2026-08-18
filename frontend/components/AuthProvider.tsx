"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearToken,
  fetchApi,
  getToken,
  setToken,
} from "@/lib/api";

export type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    fetchApi<User>("/users/me")
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await fetchApi<{ accessToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    setToken(accessToken);
    const me = await fetchApi<User>("/users/me");
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { accessToken } = await fetchApi<{ accessToken: string }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ name, email, password }) },
      );
      setToken(accessToken);
      const me = await fetchApi<User>("/users/me");
      setUser(me);
      return me;
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}