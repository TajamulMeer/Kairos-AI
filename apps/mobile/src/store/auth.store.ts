import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens, setTokens } from '@services/api.service';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  subscriptionTier: 'free' | 'premium' | 'premium_plus';
  subscriptionExpiresAt?: string;
  examTarget: string;
  classYear?: string;
  targetYear?: number;
  onboardingCompleted: boolean;
  preferredLanguage: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (user, accessToken, refreshToken) => {
        await setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        await clearTokens();
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'airix-auth', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
