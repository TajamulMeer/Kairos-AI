import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.primary,
    ...Shadow.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  size_md: {paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md},
  size_lg: {paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg},
  disabled: {opacity: 0.5},
  label: {fontWeight: '700'},
  label_primary: {color: Colors.white},
  label_secondary: {color: Colors.white},
  label_outline: {color: Colors.primary},
  label_ghost: {color: Colors.primary},
  labelSize_sm: {fontSize: FontSize.sm},
  labelSize_md: {fontSize: FontSize.base},
  labelSize_lg: {fontSize: FontSize.lg},
});
