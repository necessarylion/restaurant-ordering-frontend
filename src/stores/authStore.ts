import { create } from "zustand";
import {
  api,
  setToken,
  removeToken,
  getToken,
  refreshAuthToken,
} from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { User, LoginInput, RegisterInput, AuthResponse } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>(
        endpoints.auth.login,
        credentials
      );
      setToken(response.access_token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>(
        endpoints.auth.register,
        data
      );
      setToken(response.access_token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.delete(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshUser: async () => {
    try {
      const userData = await api.get<User>(endpoints.auth.me);
      set({ user: userData, isAuthenticated: true });
    } catch (error) {
      removeToken();
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },
}));

// Initialize auth on module load
const initAuth = async () => {
  const token = getToken();
  if (!token) {
    useAuthStore.setState({ isLoading: false });
    return;
  }

  try {
    await refreshAuthToken();
    const userData = await api.get<User>(endpoints.auth.me);
    useAuthStore.setState({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
    });
  } catch {
    removeToken();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
};

initAuth();
