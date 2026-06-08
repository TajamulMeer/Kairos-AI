import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'ur';
  hasCompletedOnboarding: boolean;
  lastSyncAt: string | null;
  isOffline: boolean;
  studyTimerActive: boolean;
  currentStudySessionId: string | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'en' | 'hi' | 'ur') => void;
  setOnboardingComplete: () => void;
  setOffline: (offline: boolean) => void;
  startStudyTimer: (sessionId: string) => void;
  stopStudyTimer: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      hasCompletedOnboarding: false,
      lastSyncAt: null,
      isOffline: false,
      studyTimerActive: false,
      currentStudySessionId: null,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setOffline: (isOffline) => set({ isOffline }),
      startStudyTimer: (currentStudySessionId) => set({ studyTimerActive: true, currentStudySessionId }),
      stopStudyTimer: () => set({ studyTimerActive: false, currentStudySessionId: null }),
    }),
    { name: 'airix-app', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
