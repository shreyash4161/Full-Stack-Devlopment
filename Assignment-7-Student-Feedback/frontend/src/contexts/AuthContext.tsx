import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { authAPI } from '../services/api';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateStoredToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.validateToken();
        setUser(response.user);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateStoredToken();
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user as User;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: string) => {
    const response = await authAPI.register(email, password, name, role);
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user as User;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, []);

  const validateToken = useCallback(async () => {
    if (token) {
      try {
        const response = await authAPI.validateToken();
        setUser(response.user);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
