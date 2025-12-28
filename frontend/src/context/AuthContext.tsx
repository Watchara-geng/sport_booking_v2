import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@api/axios';

type User = { id: string; name: string; email: string; role: 'USER'|'ADMIN' };
type AuthCtx = {
  user: User | null;
  token: string | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
};
const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token && !user) {
      api.get('/api/auth/me').then((r) => {
        setUser(r.data.data);
        localStorage.setItem('user', JSON.stringify(r.data.data));
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user, token,
    async login(email, password) {
      const r = await api.post('/api/auth/login', { email, password });
      const { token: t, user: u } = r.data.data;
      setToken(t); setUser(u);
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    },
    async register(name, email, password) {
      const r = await api.post('/api/auth/register', { name, email, password });
      const { token: t, user: u } = r.data.data;
      setToken(t); setUser(u);
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    },
    logout() {
      setToken(null); setUser(null);
      localStorage.removeItem('token'); localStorage.removeItem('user');
    }
  }), [user, token]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
