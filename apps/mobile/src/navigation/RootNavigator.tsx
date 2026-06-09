import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '@store/auth.store';
import {useAppStore} from '@store/app.store';
import {RootStackParamList} from './types';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '@screens/Onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {isAuthenticated} = useAuthStore();
  const {hasCompletedOnboarding} = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
