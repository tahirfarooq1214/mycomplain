'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToken, getToken } from '@/services/api';

interface CmsUser {
  id: string;
  fullName?: string;
  email?: string;
  role: string;
  type: 'ops' | 'provider';
}

interface AuthContextType {
  user: CmsUser | null;
  isLoading: boolean;
  login: (token: string, userData: any, type: 'ops' | 'provider') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function CmsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('cms_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  function login(token: string, userData: any, type: 'ops' | 'provider') {
    setToken(token);
    const u: CmsUser = {
      id: userData.id,
      fullName: userData.fullName || userData.companyName || userData.name,
      email: userData.email,
      role: userData.role || 'SERVICE_PROVIDER',
      type,
    };
    setUser(u);
    localStorage.setItem('cms_user', JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_user');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useCmsAuth = () => useContext(AuthContext);
