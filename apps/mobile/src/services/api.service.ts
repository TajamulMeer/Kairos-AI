import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_URL } from '@constants/api';
import { useAuthStore } from '@store/auth.store';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'airix_access_token',
  REFRESH_TOKEN: 'airix_refresh_token',
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  },
);

export async function setTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}
