import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAppStore} from '@store/app.store';
import {Colors, FontSize, Spacing} from '@constants/theme';

export default function OfflineBanner() {
  const {isOffline} = useAppStore();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 You are offline. Some features may be unavailable.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.warning,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
