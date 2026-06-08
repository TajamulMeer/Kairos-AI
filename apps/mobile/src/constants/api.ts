import Constants from 'expo-constants';

const ENV = {
  dev: { apiUrl: 'http://localhost:3000/api/v1' },
  staging: { apiUrl: 'https://api-staging.airixai.com/api/v1' },
  prod: { apiUrl: 'https://api.airixai.com/api/v1' },
};

const getEnvConfig = () => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'dev';
  if (releaseChannel === 'prod') return ENV.prod;
  if (releaseChannel === 'staging') return ENV.staging;
  return ENV.dev;
};

export const API_URL = getEnvConfig().apiUrl;

export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_FIREBASE: '/auth/firebase',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Users
  USERS_PROFILE: '/users/profile',
  USERS_UPDATE: '/users/profile',
  USERS_STUDENT_PROFILE: '/users/student-profile',

  // AI
  AI_DOUBT_SOLVE: '/ai/doubt/solve',
  AI_STUDY_PLAN: '/ai/study-plan/generate',
  AI_ANALYZE_TEST: '/ai/test/analyze',
  AI_FLASHCARDS: '/ai/flashcards/generate',
  AI_RANK_PREDICT: '/ai/rank/predict',
  AI_MENTOR_CHAT: '/ai/mentor/chat',
  AI_VISUAL_EXPLAIN: '/ai/visual/explain',

  // Questions
  QUESTIONS_LIST: '/questions',
  QUESTIONS_PRACTICE: '/questions/practice',
  QUESTIONS_ADAPTIVE: '/questions/adaptive',

  // Tests
  TESTS_LIST: '/tests',
  TESTS_CREATE: '/tests',
  TESTS_ATTEMPT_START: '/tests/:id/attempt/start',
  TESTS_ATTEMPT_SUBMIT: '/tests/:id/attempt/submit',
  TESTS_ATTEMPT_ANALYSIS: '/tests/:id/attempt/:attemptId/analysis',

  // Study Plans
  STUDY_PLANS: '/study-plans',
  STUDY_PLANS_TODAY: '/study-plans/today',
  STUDY_PLANS_WEEKLY: '/study-plans/weekly',

  // Analytics
  ANALYTICS_PERFORMANCE: '/analytics/performance',
  ANALYTICS_SUBJECTS: '/analytics/subjects',
  ANALYTICS_FORECAST: '/analytics/forecast',

  // Flashcards
  FLASHCARDS: '/flashcards',
  FLASHCARDS_DUE: '/flashcards/due',
  FLASHCARDS_REVIEW: '/flashcards/:id/review',

  // Leaderboard
  LEADERBOARD_NATIONAL: '/leaderboard/national',
  LEADERBOARD_STATE: '/leaderboard/state',
  LEADERBOARD_FRIENDS: '/leaderboard/friends',

  // Gamification
  GAMIFICATION_PROFILE: '/gamification/profile',
  GAMIFICATION_ACHIEVEMENTS: '/gamification/achievements',
  GAMIFICATION_STREAKS: '/gamification/streaks',

  // Subjects
  SUBJECTS_LIST: '/subjects',
  CHAPTERS_LIST: '/chapters',
  TOPICS_LIST: '/topics',

  // Payments
  PAYMENTS_CREATE_ORDER: '/payments/create-order',
  PAYMENTS_VERIFY: '/payments/verify',
  PAYMENTS_PLANS: '/payments/plans',
} as const;
