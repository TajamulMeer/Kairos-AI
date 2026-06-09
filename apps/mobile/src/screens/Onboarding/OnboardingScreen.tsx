import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, FontSize, Spacing, BorderRadius} from '@constants/theme';
import {useAppStore} from '@store/app.store';
import {useAuthStore} from '@store/auth.store';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

const {width} = Dimensions.get('window');

const STEPS = [
  {
    emoji: '🎯',
    title: 'Which exam are you preparing for?',
    key: 'examTarget',
    options: [
      {value: 'NEET', label: 'NEET', desc: 'Medical entrance exam'},
      {value: 'JEE_MAIN', label: 'JEE Main', desc: 'Engineering entrance'},
      {value: 'JEE_ADVANCED', label: 'JEE Advanced', desc: 'IIT entrance'},
    ],
  },
  {
    emoji: '📅',
    title: 'What is your target year?',
    key: 'targetYear',
    options: [
      {value: '2025', label: '2025', desc: 'This year'},
      {value: '2026', label: '2026', desc: 'Next year'},
      {value: '2027', label: '2027', desc: 'Two years'},
    ],
  },
  {
    emoji: '📚',
    title: 'Which class are you in?',
    key: 'classYear',
    options: [
      {value: '11', label: 'Class 11', desc: 'First year'},
      {value: '12', label: 'Class 12', desc: 'Final year'},
      {value: 'dropper', label: 'Dropper', desc: 'Repeating year'},
    ],
  },
  {
    emoji: '🌐',
    title: 'Preferred language?',
    key: 'preferredLanguage',
    options: [
      {value: 'en', label: 'English', desc: 'Study in English'},
      {value: 'hi', label: 'Hindi', desc: 'हिंदी में पढ़ें'},
      {value: 'ur', label: 'Urdu', desc: 'اردو میں پڑھیں'},
    ],
  },
];

export default function OnboardingScreen() {
  const {setOnboardingComplete} = useAppStore();
  const {updateUser} = useAuthStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const currentStep = STEPS[step];

  const select = (value: string) => {
    setAnswers(prev => ({...prev, [currentStep.key]: value}));
  };

  const next = async () => {
    if (!answers[currentStep.key]) {
      Toast.show({type: 'error', text1: 'Please select an option'});
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      await finish();
    }
  };

  const finish = async () => {
    setLoading(true);
    try {
      const payload = {
        examTarget: answers.examTarget,
        targetYear: Number(answers.targetYear),
        classYear: answers.classYear,
        preferredLanguage: answers.preferredLanguage,
        onboardingCompleted: true,
      };
      await apiClient.put(ENDPOINTS.USERS_STUDENT_PROFILE, payload);
      updateUser({...payload, onboardingCompleted: true});
      setOnboardingComplete();
    } catch {
      Toast.show({type: 'error', text1: 'Could not save preferences'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[Colors.background, Colors.white]} style={styles.container}>
        {/* Progress dots */}
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>

        <Text style={styles.emoji}>{currentStep.emoji}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>

        <View style={styles.options}>
          {currentStep.options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, answers[currentStep.key] === opt.value && styles.optionActive]}
              onPress={() => select(opt.value)}>
              <Text style={[styles.optionLabel, answers[currentStep.key] === opt.value && styles.optionLabelActive]}>
                {opt.label}
              </Text>
              <Text style={[styles.optionDesc, answers[currentStep.key] === opt.value && styles.optionDescActive]}>
                {opt.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={next} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === STEPS.length - 1 ? "Let's Begin! 🚀" : 'Next →'}
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  container: {flex: 1, padding: Spacing.xl, justifyContent: 'center'},
  progress: {flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.xl},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray300},
  dotActive: {width: 24, backgroundColor: Colors.primary},
  dotDone: {backgroundColor: Colors.primaryLight},
  emoji: {fontSize: 64, textAlign: 'center', marginBottom: Spacing.lg},
  title: {fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, textAlign: 'center', marginBottom: Spacing.xl},
  options: {gap: Spacing.md, marginBottom: Spacing.xl},
  option: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  optionActive: {borderColor: Colors.primary, backgroundColor: '#F0EEFF'},
  optionLabel: {fontSize: FontSize.lg, fontWeight: '700', color: Colors.gray800},
  optionLabelActive: {color: Colors.primary},
  optionDesc: {fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2},
  optionDescActive: {color: Colors.primaryLight},
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    alignItems: 'center',
  },
  nextBtnText: {color: Colors.white, fontSize: FontSize.lg, fontWeight: '700'},
});
