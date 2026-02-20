/**
 * HTTP client with Axios
 * Features:
 * - JWT authentication with auto-refresh
 * - Request/response interceptors
 * - Error transformation
 * - TypeScript generics for type safety
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Get stored auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set auth token in storage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove auth token from storage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Create Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Request interceptor: inject JWT token
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();

      // Inject Bearer token if available and not already set
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log requests in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor: handle errors and token refresh
   */
  instance.interceptors.response.use(
    (response) => {
      // Log successful responses in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.url}`, response.status);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();

          if (refreshed) {
            // Retry original request with new token
            const token = getToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          removeToken();

          // Redirect to login (only in browser)
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(transformError(refreshError as AxiosError));
        }
      }

      // Transform and reject error
      return Promise.reject(transformError(error));
    }
  );

  return instance;
};

/**
 * Transform Axios error to ApiError format
 */
const transformError = (error: AxiosError): ApiError => {
  // Log errors in development
  if (import.meta.env.DEV) {
    console.error("[API Error]", error.response?.data || error.message);
  }

  // Network error (no response)
  if (!error.response) {
    return {
      message: error.message || "Network error. Please check your connection.",
      status: 0,
    };
  }

  // Extract error details from response
  const responseData = error.response.data as any;

  return {
    message: responseData?.error || responseData?.message || "An error occurred",
    status: error.response.status,
    code: responseData?.code,
    field: responseData?.field,
  };
};

/**
 * Refresh authentication token
 */
const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await axios.get("/auth/refresh", {
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (response.data?.access_token) {
      setToken(response.data.access_token);
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

// Create singleton instance
const apiClient = createApiClient();

/**
 * Type-safe API methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get<T>(url, config).then((res) => res.data);
  },

  /**
   * POST request
   */
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.post<T>(url, data, config).then((res) => res.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.put<T>(url, data, config).then((res) => res.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete<T>(url, config).then((res) => res.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiClient.patch<T>(url, data, config).then((res) => res.data);
  },
};

export default api;
