import { APP_CONFIG } from '@/configs';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  type AxiosInstance,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { toSnake } from '@kalya/utils';
import { ApiError, ApiErrorDetail } from './types';

export const AUTH_TOKEN_KEY = 'kalya_session_token';

/**
 * Singleton Axios client instance configured for Kalya mobile client.
 * - Injects hardware-encrypted Bearer session tokens from expo-secure-store.
 * - Automatically prepends versioned API path if relative.
 * - Unboxes standard Fastify envelope and converts response keys to snake_case.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.kalyaSeverApi.url,
  timeout: 30_000, // 30s
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
        delete (config.headers as Record<string, unknown>)['content-type'];
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
      }
    } else if (config.data && config.headers && !config.headers.has('Content-Type')) {
      config.headers.set('Content-Type', 'application/json');
    }

    if (
      config.url &&
      !config.url.startsWith('http://') &&
      !config.url.startsWith('https://') &&
      !config.url.startsWith('/api') &&
      !config.url.startsWith('/health')
    ) {
      const cleanPath = config.url.replace(/^\/+/, '');
      config.url = `/api/${APP_CONFIG.kalyaSeverApi.version}/${cleanPath}`;
    }

    // Attach Bearer token
    if (!config.headers.Authorization) {
      try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // secure-store access failure during cold start
      }
    }

    return config;
  },
  (err: unknown) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (
      response.config?.responseType === 'blob' ||
      (typeof Blob !== 'undefined' && response.data instanceof Blob)
    ) {
      return response;
    }

    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      if (data.meta !== undefined) {
        if (Array.isArray(data.data)) {
          Object.defineProperty(data.data, 'meta', {
            value: data.meta,
            writable: true,
            enumerable: false,
            configurable: true,
          });
        } else if (typeof data.data === 'object' && data.data !== null) {
          (data.data as Record<string, unknown>).meta = data.meta;
        }
      }
      response.data = data.data;
    }

    const url = response.config?.url ?? '';
    if (url.includes('/finances/') || url.includes('/notifications/')) {
      response.data = toSnake(response.data);
    }

    return response;
  },
  async (err: AxiosError<Record<string, unknown>>) => {
    const statusCode = err.response?.status ?? 500;
    const responseData = err.response?.data;

    let errMsg = 'An unexpected server error occurred';
    let errDetails: ApiErrorDetail[] | undefined;

    if (responseData) {
      if (typeof responseData.message === 'string') {
        errMsg = responseData.message;
      } else if (typeof responseData.error === 'string') {
        errMsg = responseData.error;
      } else if (
        typeof responseData.error === 'object' &&
        responseData.error !== null &&
        'message' in responseData.error &&
        typeof responseData.error.message === 'string'
      ) {
        errMsg = responseData.error.message;
      }

      if (Array.isArray(responseData.errors)) {
        errDetails = responseData.errors as ApiErrorDetail[];
      }
    } else if (err.message) {
      errMsg = err.message;
    }

    if (statusCode === 401) {
      const reqUrl = err.config?.url || '';
      const isAuthApi =
        reqUrl.includes('/auth/get-session') ||
        reqUrl.includes('/auth/sign-in') ||
        reqUrl.includes('/auth/check-availability') ||
        reqUrl.includes('/auth/sign-up');

      if (!isAuthApi) {
        try {
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        } catch {
          // Ignore removal errors
        }
      }
    }

    const apiError = new ApiError(errMsg, statusCode, errDetails, responseData);
    return Promise.reject(apiError);
  }
);

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },

  instance: axiosInstance,
};

export { axiosInstance as axios, AxiosError };
export default http;
