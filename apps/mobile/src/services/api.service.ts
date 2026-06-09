import axios, {AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import * as Keychain from 'react-native-keychain';
import {API_URL} from '@constants/api';

const KEYCHAIN_SERVICE = 'airix_tokens';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(async config => {
  const creds = await Keychain.getGenericPassword({service: KEYCHAIN_SERVICE});
  if (creds) {
    const tokens = JSON.parse(creds.password);
    if (tokens.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const orig = error.config as AxiosRequestConfig & {_retry?: boolean};
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const creds = await Keychain.getGenericPassword({service: KEYCHAIN_SERVICE});
        if (creds) {
          const tokens = JSON.parse(creds.password);
          const {data} = await axios.post(`${API_URL}/auth/refresh`, {refreshToken: tokens.refreshToken});
          await setTokens(data.accessToken, data.refreshToken);
          if (orig.headers) orig.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(orig);
        }
      } catch {
        await clearTokens();
      }
    }
    return Promise.reject(error);
  },
);

export async function setTokens(accessToken: string, refreshToken: string) {
  await Keychain.setGenericPassword('tokens', JSON.stringify({accessToken, refreshToken}), {service: KEYCHAIN_SERVICE});
}

export async function clearTokens() {
  await Keychain.resetGenericPassword({service: KEYCHAIN_SERVICE});
}
