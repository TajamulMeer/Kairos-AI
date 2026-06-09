import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {useAuthStore} from '@store/auth.store';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const {user, updateUser} = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');

  const mutation = useMutation({
    mutationFn: () => apiClient.put(ENDPOINTS.USERS_PROFILE, {fullName}).then(r => r.data),
    onSuccess: () => {
      updateUser({fullName});
      Toast.show({type: 'success', text1: 'Profile updated!'});
      navigation.goBack();
    },
    onError: () => Toast.show({type: 'error', text1: 'Update failed'}),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{width: 60}} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={Colors.gray400}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email}
            editable={false}
          />
          <Text style={styles.label}>Exam Target</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.examTarget}
            editable={false}
          />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  content: {padding: Spacing.xl},
  form: {gap: Spacing.sm, marginBottom: Spacing.xl},
  label: {fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700},
  input: {backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSize.base, color: Colors.gray900, ...Shadow.sm},
  inputDisabled: {backgroundColor: Colors.gray100, color: Colors.gray500},
  saveBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: Spacing.md, alignItems: 'center', ...Shadow.primary},
  saveBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '700'},
});
