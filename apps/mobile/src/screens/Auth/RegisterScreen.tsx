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
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AuthNavProp} from '@navigation/types';
import {apiClient} from '@services/api.service';
import {useAuthStore} from '@store/auth.store';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  examTarget: z.enum(['NEET', 'JEE_MAIN', 'JEE_ADVANCED']),
});
type FormData = z.infer<typeof schema>;

const EXAMS = [
  {value: 'NEET', label: 'NEET (Medical)'},
  {value: 'JEE_MAIN', label: 'JEE Main'},
  {value: 'JEE_ADVANCED', label: 'JEE Advanced'},
] as const;

export default function RegisterScreen() {
  const navigation = useNavigation<AuthNavProp>();
  const {login} = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {examTarget: 'NEET'},
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH_REGISTER, data);
      const {user, accessToken, refreshToken} = res.data;
      await login(user, accessToken, refreshToken);
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Registration Failed', text2: err?.response?.data?.message || 'Please try again'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account 🚀</Text>
        <Text style={styles.subtitle}>Start your AI-powered NEET/JEE journey</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                placeholderTextColor={Colors.gray400}
              />
            )}
          />
          {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                placeholderTextColor={Colors.gray400}
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                placeholderTextColor={Colors.gray400}
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <Text style={styles.label}>Target Exam</Text>
          <Controller
            control={control}
            name="examTarget"
            render={({field: {onChange, value}}) => (
              <View style={styles.examRow}>
                {EXAMS.map(exam => (
                  <TouchableOpacity
                    key={exam.value}
                    style={[styles.examChip, value === exam.value && styles.examChipActive]}
                    onPress={() => onChange(exam.value)}>
                    <Text style={[styles.examChipText, value === exam.value && styles.examChipTextActive]}>
                      {exam.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity style={styles.registerBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={{color: Colors.primary, fontWeight: '700'}}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  container: {flexGrow: 1, padding: Spacing.xl},
  backBtn: {marginBottom: Spacing.lg},
  backText: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.gray900, marginBottom: Spacing.xs},
  subtitle: {fontSize: FontSize.md, color: Colors.gray500, marginBottom: Spacing.xl},
  form: {gap: Spacing.sm},
  label: {fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700},
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.gray900,
    ...Shadow.sm,
  },
  inputError: {borderColor: Colors.error},
  error: {fontSize: FontSize.xs, color: Colors.error},
  examRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  examChip: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  examChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  examChipText: {fontSize: FontSize.sm, color: Colors.gray600, fontWeight: '500'},
  examChipTextActive: {color: Colors.white, fontWeight: '700'},
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.primary,
  },
  registerBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '700'},
  loginLink: {alignItems: 'center', marginTop: Spacing.md},
  loginLinkText: {color: Colors.gray500, fontSize: FontSize.md},
});
