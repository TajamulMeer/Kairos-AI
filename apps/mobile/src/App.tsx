import React from 'react';
import {StatusBar, LogBox} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import RootNavigator from '@navigation/RootNavigator';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: 2, staleTime: 1000 * 60 * 5},
    mutations: {retry: 1},
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FF" />
        <RootNavigator />
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
