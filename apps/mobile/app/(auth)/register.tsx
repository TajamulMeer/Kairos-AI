import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { useAuthStore } from '@store/auth.store';
import { ENDPOINTS } from '@constants/api';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phoneNumber: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  classYear: z.enum(['class_11', 'class_12', 'dropper', 'repeater']),
  targetYear: z.number().min(2024).max(2035),
});

type RegisterForm = z.infer<typeof registerSchema>;

const CLASS_OPTIONS = [
  { value: 'class_11', label: 'Class 11' },
  { value: 'class_12', label: 'Class 12' },
  { value: 'dropper', label: 'Dropper' },
  { value: 'repeater', label: 'Repeater' },
];

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { classYear: 'class_12', targetYear: new Date().getFullYear() + 1 },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH_REGISTER, { ...data, examTarget: 'NEET' });
      const { user, accessToken, refreshToken } = response.data;
      await login(user, accessToken, refreshToken);
      router.replace('/onboarding');
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join thousands of NEET aspirants</Text>

      <View style={styles.form}>
        {(['fullName', 'email', 'phoneNumber', 'password'] as const).map((field) => (
          <Controller
            key={field}
            control={control}
            name={field}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field === 'fullName' ? 'Full Name' : field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <TextInput
                  style={[styles.input, errors[field] && styles.inputError]}
                  placeholder={field === 'email' ? 'your@email.com' : field === 'phoneNumber' ? '10-digit mobile number' : ''}
                  keyboardType={field === 'email' ? 'email-address' : field === 'phoneNumber' ? 'phone-pad' : 'default'}
                  secureTextEntry={field === 'password'}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                  value={value as string}
                  onChangeText={onChange}
                />
                {errors[field] && <Text style={styles.errorText}>{errors[field]?.message}</Text>}
              </View>
            )}
          />
        ))}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>I am currently in</Text>
          <Controller
            control={control}
            name="classYear"
            render={({ field: { onChange, value } }) => (
              <View style={styles.optionsRow}>
                {CLASS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionChip, value === opt.value && styles.optionChipActive]}
                    onPress={() => onChange(opt.value)}
                  >
                    <Text style={[styles.optionChipText, value === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.registerButtonText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
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
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.gray100 },
  optionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  optionChipText: { fontSize: FontSize.sm, color: Colors.gray700, fontWeight: '600' },
  optionChipTextActive: { color: Colors.white },
  registerButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.md, ...Shadow.primary },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.md },
  loginText: { color: Colors.gray600, fontSize: FontSize.sm },
  loginLink: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
