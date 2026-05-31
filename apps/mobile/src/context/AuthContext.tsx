import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { auth as authApi, setAuthToken } from '../services/api';

// Web-compatible storage: uses localStorage on web, expo-secure-store on native
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = require('expo-secure-store');
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isNewUser: boolean;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await storage.getItem('auth_token');
      const userData = await storage.getItem('user_data');

      if (token && userData) {
        setAuthToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithPhone(phone: string) {
    const result = await authApi.phoneLogin(phone);

    if (result.success && result.data) {
      const { token, user: userData, isNewUser: isNew } = result.data;

      setAuthToken(token);
      setUser(userData);
      setIsNewUser(isNew);

      await storage.setItem('auth_token', token);
      await storage.setItem('user_data', JSON.stringify(userData));

      return { success: true };
    }

    return { success: false, error: result.error };
  }

  function updateUser(data: any) {
    const updated = { ...user, ...data };
    setUser(updated);
    setIsNewUser(false);
    storage.setItem('user_data', JSON.stringify(updated));
  }

  async function logout() {
    setUser(null);
    setAuthToken(null);
    setIsNewUser(false);
    await storage.deleteItem('auth_token');
    await storage.deleteItem('user_data');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isNewUser, loginWithPhone, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
