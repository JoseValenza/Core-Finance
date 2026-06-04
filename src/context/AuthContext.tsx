import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "cliente" | "admin";
export interface SessionUser {
  email: string;
  role: Role;
  name: string;
}

interface AuthCtx {
  user: SessionUser | null;
  login: (email: string, password: string, role: Role) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "cf_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (email: string, _password: string, role: Role) => {
    const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Usuário";
    const u: SessionUser = { email, role, name };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
};
