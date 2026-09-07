import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody } from '@/types/api';

const API_BASE = '/api/v1';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Single in-flight refresh shared by all concurrent 401s, so five parallel
 * requests trigger one refresh instead of five that overwrite each other.
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    refreshPromise = axios
      .post(`${API_BASE}/auth/refresh-token`, { refreshToken })
      .then(({ data }) => {
        const { accessToken, refreshToken: next } = data.data as { accessToken: string; refreshToken: string };
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', next);
        return accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function forceLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const isAuthRoute = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        forceLogout();
      }
    }

    return Promise.reject(error);
  },
);

/** Human-readable message from any API error. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const body = (err as AxiosError<ApiErrorBody>)?.response?.data;
  return body?.error?.message || fallback;
}

/** Per-field validation errors from a 400 response, if any. */
export function getApiFieldErrors(err: unknown): Record<string, string> {
  const details = (err as AxiosError<ApiErrorBody>)?.response?.data?.error?.details;
  if (!details) return {};
  return Object.fromEntries(Object.entries(details).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
}
