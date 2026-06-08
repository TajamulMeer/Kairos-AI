import { Redirect } from 'expo-router';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { hasCompletedOnboarding } = useAppStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
