import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User { id: string; name: string; email: string; }

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vl_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('vl_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _p, ...u } = found;
    setUser(u);
    localStorage.setItem('vl_user', JSON.stringify(u));
  };

  const register = async (name: string, email: string, password: string) => {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('vl_users') || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email already registered. Please log in.');
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('vl_users', JSON.stringify(users));
    const { password: _p, ...u } = newUser;
    setUser(u);
    localStorage.setItem('vl_user', JSON.stringify(u));
    // Save session count
    const sessions = parseInt(localStorage.getItem('vl_sessions') || '0');
    localStorage.setItem('vl_sessions', String(sessions));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vl_user');
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
