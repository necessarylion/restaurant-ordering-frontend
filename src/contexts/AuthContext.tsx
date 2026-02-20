/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useCallback, useEffect, useState } from "react";
import { api, setToken, removeToken, getToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user from token on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch current user
        const userData = await api.get<User>(endpoints.auth.me);
        setUser(userData);
      } catch (error) {
        // Token invalid or expired
        removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginInput): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>(
        endpoints.auth.login,
        credentials
      );

      // Store token
      setToken(response.access_token);

      // Set user
      setUser(response.user);
    } catch (error: any) {
      // Re-throw to allow component to handle error
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterInput): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>(
        endpoints.auth.register,
        data
      );

      // Store token
      setToken(response.access_token);

      // Set user
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout endpoint
      await api.delete(endpoints.auth.logout);
    } catch (error) {
      // Ignore logout errors
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      removeToken();
      setUser(null);
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await api.get<User>(endpoints.auth.me);
      setUser(userData);
    } catch (error) {
      // If refresh fails, logout
      removeToken();
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
