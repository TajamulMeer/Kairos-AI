import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV({id: 'airix-general'});

export const StorageKeys = {
  ONBOARDING: 'onboarding_completed',
  LAST_STUDY_SESSION: 'last_study_session',
  CACHED_STUDY_PLAN: 'cached_study_plan',
  OFFLINE_QUESTIONS: 'offline_questions',
} as const;

export function getItem<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.delete(key);
}
