import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';
import { useAuthStore } from '@store/auth.store';

const CLASS_OPTIONS = [
  { value: 'class_11', label: 'Class 11' },
  { value: 'class_12', label: 'Class 12' },
  { value: 'dropper', label: 'Dropper' },
  { value: 'repeater', label: 'Repeater' },
];

const TARGET_YEARS = [2025, 2026, 2027, 2028];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [classYear, setClassYear] = useState(user?.classYear || 'class_12');
  const [targetYear, setTargetYear] = useState(user?.targetYear || 2026);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: any) => apiClient.put(ENDPOINTS.USERS_UPDATE, data).then(r => r.data),
    onSuccess: (data) => {
      updateUser(data.user || { fullName, classYear, targetYear });
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile.'),
  });

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }
    updateProfile({ fullName: fullName.trim(), classYear, targetYear, state: state.trim(), city: city.trim() });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isPending}>
          {isPending ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase() || '?'}</Text>
          </View>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email} editable={false} />
            <Text style={styles.fieldHint}>Email cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>I am in</Text>
            <View style={styles.optionsRow}>
              {CLASS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionChip, classYear === opt.value && styles.optionChipActive]}
                  onPress={() => setClassYear(opt.value)}
                >
                  <Text style={[styles.optionChipText, classYear === opt.value && styles.optionChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Target Year</Text>
            <View style={styles.optionsRow}>
              {TARGET_YEARS.map((yr) => (
                <TouchableOpacity
                  key={yr}
                  style={[styles.optionChip, targetYear === yr && styles.optionChipActive]}
                  onPress={() => setTargetYear(yr)}
                >
                  <Text style={[styles.optionChipText, targetYear === yr && styles.optionChipTextActive]}>
                    {yr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>State</Text>
            <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="Your state" />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Your city" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isPending}
        >
          {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  saveText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '700', width: 60, textAlign: 'right' },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, color: Colors.white, fontWeight: '800' },
  form: { gap: Spacing.lg },
  field: { gap: Spacing.xs },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray700 },
  input: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSize.base, color: Colors.gray900, backgroundColor: Colors.white },
  inputDisabled: { backgroundColor: Colors.gray100, color: Colors.gray500 },
  fieldHint: { fontSize: FontSize.xs, color: Colors.gray400 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white },
  optionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  optionChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  optionChipTextActive: { color: Colors.white },
  saveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.xl, ...Shadow.primary },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
});
