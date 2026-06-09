import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV({id: 'app-store'});
const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'ur';
  hasCompletedOnboarding: boolean;
  isOffline: boolean;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  setLanguage: (l: 'en' | 'hi' | 'ur') => void;
  setOnboardingComplete: () => void;
  setOffline: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      theme: 'system',
      language: 'en',
      hasCompletedOnboarding: false,
      isOffline: false,
      setTheme: theme => set({theme}),
      setLanguage: language => set({language}),
      setOnboardingComplete: () => set({hasCompletedOnboarding: true}),
      setOffline: isOffline => set({isOffline}),
    }),
    {name: 'airix-app', storage: createJSONStorage(() => mmkvStorage)},
  ),
);
