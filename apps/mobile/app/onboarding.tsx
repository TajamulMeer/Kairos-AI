import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/auth.store';
import { useAppStore } from '@/src/store/app.store';
import { apiClient } from '@/src/services/api.service';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    id: 'welcome',
    emoji: '🎯',
    title: 'Welcome to AIRIX AI',
    subtitle: 'Your personal AI-powered NEET Mentor. Let\'s set you up for success.',
    type: 'info',
  },
  {
    id: 'class',
    emoji: '📚',
    title: 'What\'s your current status?',
    subtitle: 'We\'ll personalize your experience',
    type: 'selection',
    options: [
      { value: 'class_11', label: 'Class 11', desc: 'Starting early 🌱' },
      { value: 'class_12', label: 'Class 12', desc: 'Final preparation 🎯' },
      { value: 'dropper', label: 'Dropper', desc: 'Focused repeat 💪' },
      { value: 'repeater', label: 'Repeater', desc: 'Experienced attempt 🧠' },
    ],
  },
  {
    id: 'target_year',
    emoji: '📅',
    title: 'When are you appearing?',
    subtitle: 'We\'ll plan your preparation timeline',
    type: 'year',
  },
  {
    id: 'weak_subjects',
    emoji: '⚠️',
    title: 'Which subjects need most work?',
    subtitle: 'AI will prioritize these in your plan',
    type: 'multiselect',
    options: [
      { value: 'biology', label: 'Biology 🧬', desc: 'Genetics, Ecology, etc.' },
      { value: 'physics', label: 'Physics ⚛️', desc: 'Mechanics, Optics, etc.' },
      { value: 'chemistry', label: 'Chemistry 🧪', desc: 'Organic, Physical, etc.' },
    ],
  },
  {
    id: 'daily_hours',
    emoji: '⏱️',
    title: 'Daily study hours available?',
    subtitle: 'We\'ll schedule realistically',
    type: 'selection',
    options: [
      { value: '4', label: '4 Hours', desc: 'School + Self study' },
      { value: '6', label: '6 Hours', desc: 'Moderate preparation' },
      { value: '8', label: '8 Hours', desc: 'Serious preparation' },
      { value: '10', label: '10+ Hours', desc: 'Full dropper mode' },
    ],
  },
  {
    id: 'ready',
    emoji: '🚀',
    title: 'You\'re all set!',
    subtitle: 'Your AI Mentor is ready. Let\'s crack NEET!',
    type: 'info',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const { updateUser } = useAuthStore();
  const { setOnboardingComplete } = useAppStore();

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: () => apiClient.patch('/users/profile', {
      classYear: answers.class,
      targetYear: parseInt(answers.target_year) || new Date().getFullYear() + 1,
      onboardingCompleted: true,
    }),
    onSuccess: () => {
      updateUser({ onboardingCompleted: true });
      setOnboardingComplete();
      router.replace('/(tabs)');
    },
  });

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) { saveProfile(); return; }
    setCurrentStep(p => p + 1);
  };

  const canProceed = () => {
    if (step.type === 'info') return true;
    if (step.type === 'selection') return !!answers[step.id];
    if (step.type === 'multiselect') return (answers[step.id]?.length || 0) > 0;
    if (step.type === 'year') return !!answers[step.id];
    return true;
  };

  const toggleMultiSelect = (value: string) => {
    const current = answers[step.id] || [];
    const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
    setAnswers(a => ({ ...a, [step.id]: updated }));
  };

  return (
    <LinearGradient colors={['#F5F7FF', '#EEF2FF']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Progress */}
        <View style={styles.progressBar}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= currentStep && styles.progressDotActive]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>

          {step.type === 'selection' && step.options && (
            <View style={styles.options}>
              {step.options.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionCard, answers[step.id] === opt.value && styles.optionCardActive]}
                  onPress={() => setAnswers(a => ({ ...a, [step.id]: opt.value }))}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step.type === 'multiselect' && step.options && (
            <View style={styles.options}>
              {step.options.map(opt => {
                const selected = (answers[step.id] || []).includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionCard, selected && styles.optionCardActive]}
                    onPress={() => toggleMultiSelect(opt.value)}
                  >
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step.type === 'year' && (
            <View style={styles.yearOptions}>
              {[2025, 2026, 2027].map(year => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearCard, answers[step.id] === String(year) && styles.yearCardActive]}
                  onPress={() => setAnswers(a => ({ ...a, [step.id]: String(year) }))}
                >
                  <Text style={[styles.yearText, answers[step.id] === String(year) && styles.yearTextActive]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!isFirst && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(p => p - 1)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled, isFirst && styles.nextBtnFull]}
            onPress={handleNext}
            disabled={!canProceed() || isPending}
          >
            <Text style={styles.nextBtnText}>{isLast ? (isPending ? 'Setting up...' : 'Start Learning! 🚀') : 'Continue →'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  progressBar: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: Spacing.md },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray300 },
  progressDotActive: { backgroundColor: Colors.primary, width: 20 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.md, alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: Spacing.lg, marginTop: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 24 },
  options: { width: '100%', gap: Spacing.sm },
  optionCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 2, borderColor: Colors.gray200, ...Shadow.sm },
  optionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  optionLabel: { fontSize: FontSize.base, fontWeight: '700', color: Colors.gray900 },
  optionDesc: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2 },
  checkmark: { position: 'absolute', right: Spacing.md, top: Spacing.md, color: Colors.primary, fontWeight: '800', fontSize: FontSize.lg },
  yearOptions: { flexDirection: 'row', gap: Spacing.md },
  yearCard: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: Colors.gray200, ...Shadow.sm },
  yearCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  yearText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900 },
  yearTextActive: { color: Colors.white },
  footer: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md },
  backBtn: { paddingVertical: 18, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300 },
  backBtnText: { color: Colors.gray600, fontWeight: '700' },
  nextBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', ...Shadow.primary },
  nextBtnFull: { flex: 1 },
  nextBtnDisabled: { backgroundColor: Colors.gray300, shadowColor: 'transparent' },
  nextBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.base },
});
