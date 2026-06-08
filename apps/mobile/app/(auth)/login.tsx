import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient, setTokens } from '@services/api.service';
import { useAuthStore } from '@store/auth.store';
import { ENDPOINTS } from '@constants/api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH_LOGIN, data);
      const { user, accessToken, refreshToken } = response.data;
      await login(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Login to continue your NEET preparation</Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>
          )}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.loginButtonText}>Login</Text>}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: Spacing.lg, paddingTop: 60 },
  backButton: { marginBottom: Spacing.xl },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.base, color: Colors.gray600, marginBottom: Spacing.xxl },
  form: { gap: Spacing.md },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  input: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSize.base, color: Colors.gray900, backgroundColor: Colors.gray100 },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: FontSize.xs, color: Colors.error },
  forgotPassword: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', textAlign: 'right', marginTop: Spacing.xs },
  loginButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.md, ...Shadow.primary },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.md },
  registerText: { color: Colors.gray600, fontSize: FontSize.sm },
  registerLink: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
