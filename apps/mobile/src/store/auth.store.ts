import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import {clearTokens, setTokens} from '@services/api.service';

const storage = new MMKV({id: 'auth-store'});
const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  subscriptionTier: 'free' | 'premium' | 'premium_plus';
  examTarget: string;
  classYear?: string;
  targetYear?: number;
  onboardingCompleted: boolean;
  preferredLanguage: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      login: async (user, accessToken, refreshToken) => {
        await setTokens(accessToken, refreshToken);
        set({user, isAuthenticated: true});
      },
      logout: async () => {
        await clearTokens();
        set({user: null, isAuthenticated: false});
      },
      updateUser: updates => set(s => ({user: s.user ? {...s.user, ...updates} : null})),
    }),
    {name: 'airix-auth', storage: createJSONStorage(() => mmkvStorage)},
  ),
);
