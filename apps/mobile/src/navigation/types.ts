import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Practice: undefined;
  Tests: undefined;
  Mentor: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  TestStart: {testId: string};
  TestSession: {testId: string; attemptId: string};
  TestResult: {attemptId: string};
  PracticeSession: {mode: string; subjectCode?: string};
  DoubtSolver: undefined;
  Flashcards: {chapterId?: string};
  StudyPlan: undefined;
  Analytics: undefined;
  Leaderboard: undefined;
  RankPredictor: undefined;
  Achievements: undefined;
  Subscription: undefined;
  EditProfile: undefined;
  Revision: undefined;
  Notifications: undefined;
  SubjectChapters: {subjectCode: string; subjectName: string};
};

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavProp = NativeStackNavigationProp<AppStackParamList>;
