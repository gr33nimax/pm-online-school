import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

const AuthContext = createContext<{
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ИЗМЕНЕНИЕ: Читаем из storage сразу при инициализации
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u: User) => {
    setUser(u);
    sessionStorage.setItem('app_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext)!;