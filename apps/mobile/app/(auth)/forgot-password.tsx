import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>📧</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to {email}. Check your inbox and follow the instructions.
          </Text>
          <TouchableOpacity style={styles.backToLoginButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
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
  subtitle: { fontSize: FontSize.base, color: Colors.gray600, marginBottom: Spacing.xxl, lineHeight: 24 },
  form: { gap: Spacing.md },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  input: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSize.base, color: Colors.gray900, backgroundColor: Colors.gray100 },
  submitButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.md, ...Shadow.primary },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  successEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  successTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md, textAlign: 'center' },
  successText: { fontSize: FontSize.base, color: Colors.gray600, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xxl },
  backToLoginButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, paddingHorizontal: Spacing.xxl, ...Shadow.primary },
  backToLoginText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
});
