import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const navigation = useNavigation<AuthNavProp>();
  const {login} = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH_LOGIN, data);
      const {user, accessToken, refreshToken} = res.data;
      await login(user, accessToken, refreshToken);
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Login Failed', text2: err?.response?.data?.message || 'Please try again'});
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

        <Text style={styles.title}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Login to continue your NEET/JEE prep</Text>

        <View style={styles.form}>
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
                placeholder="Enter your password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                placeholderTextColor={Colors.gray400}
              />
            )}
          />
          {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={{color: Colors.primary, fontWeight: '700'}}>Register</Text>
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
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.primary,
  },
  loginBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '700'},
  registerLink: {alignItems: 'center', marginTop: Spacing.md},
  registerLinkText: {color: Colors.gray500, fontSize: FontSize.md},
});
