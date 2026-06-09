import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {Colors, BorderRadius, Spacing, Shadow} from '@constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
}

export default function Card({children, style, elevated = true, padded = true}: CardProps) {
  return (
    <View style={[styles.card, elevated && Shadow.md, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
  },
  padded: {
    padding: Spacing.lg,
  },
});
