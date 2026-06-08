import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  type: 'info' | 'select' | 'multi_select';
  options?: { value: string; label: string; emoji: string }[];
  field?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: "Let's set up your\npersonalized NEET plan",
    subtitle: 'Answer a few questions so your AI Mentor can create the perfect study strategy for you.',
    emoji: '🎯',
    type: 'info',
  },
  {
    id: 'weak_subjects',
    title: 'Which subjects do you\nfind most challenging?',
    subtitle: 'Select all that apply — we\'ll focus more on these areas.',
    emoji: '🤔',
    type: 'multi_select',
    field: 'weakSubjects',
    options: [
      { value: 'biology_botany', label: 'Botany', emoji: '🌿' },
      { value: 'biology_zoology', label: 'Zoology', emoji: '🦋' },
      { value: 'physics_mechanics', label: 'Mechanics', emoji: '⚙️' },
      { value: 'physics_electro', label: 'Electrostatics', emoji: '⚡' },
      { value: 'chemistry_organic', label: 'Organic Chem', emoji: '🧪' },
      { value: 'chemistry_inorganic', label: 'Inorganic Chem', emoji: '🔬' },
      { value: 'chemistry_physical', label: 'Physical Chem', emoji: '⚗️' },
      { value: 'physics_modern', label: 'Modern Physics', emoji: '☢️' },
    ],
  },
  {
    id: 'study_hours',
    title: 'How many hours can\nyou study daily?',
    subtitle: 'Be honest — consistency beats cramming.',
    emoji: '⏱️',
    type: 'select',
    field: 'dailyStudyHours',
    options: [
      { value: '2', label: '2 hours', emoji: '😊' },
      { value: '4', label: '4 hours', emoji: '💪' },
      { value: '6', label: '6 hours', emoji: '🔥' },
      { value: '8', label: '8+ hours', emoji: '🚀' },
    ],
  },
  {
    id: 'prep_level',
    title: 'What is your current\npreparation level?',
    subtitle: 'This helps us calibrate your starting difficulty.',
    emoji: '📊',
    type: 'select',
    field: 'preparationLevel',
    options: [
      { value: 'beginner', label: 'Just starting out', emoji: '🌱' },
      { value: 'intermediate', label: 'Covered basics', emoji: '📚' },
      { value: 'advanced', label: 'Deep in revision', emoji: '🎓' },
      { value: 'expert', label: 'Ready for final push', emoji: '🏆' },
    ],
  },
  {
    id: 'goal',
    title: "What's your NEET\nrank goal?",
    subtitle: 'We\'ll build a plan to get you there.',
    emoji: '🏅',
    type: 'select',
    field: 'rankGoal',
    options: [
      { value: 'top_100', label: 'Top 100 (AIR)', emoji: '🥇' },
      { value: 'top_1000', label: 'Top 1,000', emoji: '🥈' },
      { value: 'top_10000', label: 'Top 10,000', emoji: '🥉' },
      { value: 'mbbs_govt', label: 'Govt. MBBS seat', emoji: '🏥' },
    ],
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuthStore();
  const { setOnboardingComplete } = useAppStore();
  const flatListRef = useRef<FlatList>(null);

  const step = STEPS[currentStep];

  const handleSelect = (field: string, value: string, isMulti: boolean) => {
    setAnswers(prev => {
      if (isMulti) {
        const current: string[] = prev[field] || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [field]: updated };
      }
      return { ...prev, [field]: value };
    });
  };

  const canProceed = () => {
    if (step.type === 'info') return true;
    if (!step.field) return true;
    const answer = answers[step.field];
    if (step.type === 'multi_select') return (answer || []).length > 0;
    return !!answer;
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      flatListRef.current?.scrollToIndex({ index: currentStep + 1, animated: true });
    } else {
      // Final step - submit
      setIsLoading(true);
      try {
        await apiClient.post(ENDPOINTS.USERS_STUDENT_PROFILE, answers);
        updateUser({ onboardingCompleted: true });
        setOnboardingComplete();
        router.replace('/(tabs)');
      } catch (err: any) {
        Alert.alert('Error', 'Failed to save your preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <LinearGradient colors={['#F5F7FF', '#EEF2FF']} style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, idx) => (
          <View
            key={idx}
            style={[styles.progressDot, idx <= currentStep && styles.progressDotActive, idx < currentStep && styles.progressDotDone]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepEmoji}>{step.emoji}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

        {step.options && (
          <View style={[step.type === 'multi_select' ? styles.multiSelectGrid : styles.selectList]}>
            {step.options.map((opt) => {
              const isSelected = step.type === 'multi_select'
                ? (answers[step.field!] || []).includes(opt.value)
                : answers[step.field!] === opt.value;

              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    step.type === 'multi_select' ? styles.multiSelectOption : styles.selectOption,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(step.field!, opt.value, step.type === 'multi_select')}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(prev => prev - 1)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled, currentStep === 0 && styles.nextButtonFull]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === STEPS.length - 1 ? 'Generate My Plan 🚀' : 'Next →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  progressContainer: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.xl },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray300 },
  progressDotActive: { width: 24, backgroundColor: Colors.primary },
  progressDotDone: { width: 8, backgroundColor: Colors.primaryLight },
  stepContent: { flex: 1, paddingBottom: Spacing.xl },
  stepEmoji: { fontSize: 64, textAlign: 'center', marginBottom: Spacing.lg },
  stepTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, textAlign: 'center', lineHeight: 36, marginBottom: Spacing.md },
  stepSubtitle: { fontSize: FontSize.sm, color: Colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  selectList: { gap: Spacing.sm },
  selectOption: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 2, borderColor: Colors.gray200, ...Shadow.sm },
  multiSelectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  multiSelectOption: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', width: '48%', borderWidth: 2, borderColor: Colors.gray200, ...Shadow.sm },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  optionEmoji: { fontSize: 24 },
  optionLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray800 },
  optionLabelSelected: { color: Colors.primary },
  optionCheck: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '800' },
  footer: { flexDirection: 'row', gap: Spacing.md, paddingTop: Spacing.lg },
  backButton: { paddingVertical: 18, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300 },
  backButtonText: { fontSize: FontSize.base, color: Colors.gray700, fontWeight: '600' },
  nextButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', ...Shadow.primary },
  nextButtonFull: { flex: 1 },
  nextButtonDisabled: { backgroundColor: Colors.gray400, shadowColor: 'transparent' },
  nextButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
});
