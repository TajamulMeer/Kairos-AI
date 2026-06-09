import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {Colors, FontSize, Spacing} from '@constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({message = 'Loading...'}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧠</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  logo: {fontSize: 64},
  spinner: {marginTop: Spacing.lg},
  message: {fontSize: FontSize.md, color: Colors.gray500},
});
