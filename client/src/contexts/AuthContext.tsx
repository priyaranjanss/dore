import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/chat';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.auth.getMe();
        const data = await res.json();
        setUser({ ...data, token });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
