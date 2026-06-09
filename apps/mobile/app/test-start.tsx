import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

interface Question {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  subject: string;
  marks: number;
  negativeMarks: number;
}

interface Attempt {
  id: string;
  questions: Question[];
  durationMinutes: number;
  totalMarks: number;
}

export default function TestStartScreen() {
  const { testId, type } = useLocalSearchParams<{ testId?: string; type?: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: testData, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => testId
      ? apiClient.get(`${ENDPOINTS.TESTS_LIST}/${testId}`).then(r => r.data)
      : Promise.resolve(null),
    enabled: !!testId,
  });

  const { mutate: startAttempt, isPending: isStarting } = useMutation({
    mutationFn: () => {
      const endpoint = testId
        ? ENDPOINTS.TESTS_ATTEMPT_START.replace(':id', testId)
        : ENDPOINTS.TESTS_ATTEMPT_START.replace(':id', 'quick');
      return apiClient.post(endpoint, { type }).then(r => r.data);
    },
    onSuccess: (data) => {
      setAttempt(data);
      setTimeLeft(data.durationMinutes * 60);
      setIsStarted(true);
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to start test.'),
  });

  const { mutate: submitAttempt, isPending: isSubmitting } = useMutation({
    mutationFn: () => {
      const endpoint = testId
        ? ENDPOINTS.TESTS_ATTEMPT_SUBMIT.replace(':id', testId)
        : ENDPOINTS.TESTS_ATTEMPT_SUBMIT.replace(':id', 'quick');
      return apiClient.post(endpoint, {
        attemptId: attempt?.id,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }).then(r => r.data);
    },
    onSuccess: (data) => {
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace({ pathname: '/test-result', params: { attemptId: data.attemptId, testId: testId || 'quick' } } as any);
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to submit test.'),
  });

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            Alert.alert('Time Up!', 'Your test time has ended. Submitting now...', [
              { text: 'OK', onPress: () => submitAttempt() },
            ]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isStarted) {
        Alert.alert('Exit Test?', 'Your progress will be lost. Are you sure?', [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => router.back() },
        ]);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [isStarted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Test?',
      `You have answered ${Object.keys(answers).length} out of ${attempt?.questions.length} questions.`,
      [
        { text: 'Review First', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: () => submitAttempt() },
      ]
    );
  };

  if (isLoadingTest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!isStarted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Test Details</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.testInfoCard, Shadow.md]}>
            <Text style={styles.testName}>{testData?.title || 'NEET Mock Test'}</Text>
            <View style={styles.testMetaGrid}>
              {[
                { label: 'Questions', value: testData?.questionCount || 180 },
                { label: 'Duration', value: `${testData?.durationMinutes || 200} min` },
                { label: 'Total Marks', value: testData?.totalMarks || 720 },
                { label: 'Marking', value: '+4 / -1' },
              ].map((meta) => (
                <View key={meta.label} style={styles.testMetaItem}>
                  <Text style={styles.testMetaValue}>{meta.value}</Text>
                  <Text style={styles.testMetaLabel}>{meta.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            {[
              'Each correct answer carries +4 marks.',
              'Each wrong answer carries -1 mark.',
              'Unattempted questions carry 0 marks.',
              'You can mark questions for review and come back to them.',
              'The test will auto-submit when time runs out.',
            ].map((instruction, idx) => (
              <Text key={idx} style={styles.instructionItem}>• {instruction}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, isStarting && styles.startButtonDisabled]}
            onPress={() => startAttempt()}
            disabled={isStarting}
          >
            {isStarting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.startButtonText}>Start Test →</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = attempt!.questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Timer & Progress */}
      <View style={styles.testHeader}>
        <Text style={styles.questionCounter}>{currentQuestion + 1}/{attempt!.questions.length}</Text>
        <View style={[styles.timer, timeLeft < 300 && styles.timerWarning]}>
          <Text style={[styles.timerText, timeLeft < 300 && styles.timerTextWarning]}>⏱ {formatTime(timeLeft)}</Text>
        </View>
        <TouchableOpacity style={styles.submitHeaderButton} onPress={handleSubmit}>
          <Text style={styles.submitHeaderText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.questionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionMeta}>
          <Text style={styles.questionSubject}>{question.subject}</Text>
          <Text style={styles.questionMarks}>+{question.marks} | -{question.negativeMarks}</Text>
        </View>

        <Text style={styles.questionText}>{question.questionText}</Text>

        <View style={styles.options}>
          {question.options.map((opt, idx) => {
            const isSelected = answers[question.id] === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => setAnswers(prev => ({ ...prev, [question.id]: opt.id }))}
              >
                <View style={[styles.optionBullet, isSelected && styles.optionBulletSelected]}>
                  <Text style={[styles.optionBulletText, isSelected && styles.optionBulletTextSelected]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentQuestion(prev => prev - 1)}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.reviewButton, markedForReview.has(question.id) && styles.reviewButtonActive]}
          onPress={() => {
            setMarkedForReview(prev => {
              const next = new Set(prev);
              if (next.has(question.id)) next.delete(question.id);
              else next.add(question.id);
              return next;
            });
          }}
        >
          <Text style={styles.reviewButtonText}>
            {markedForReview.has(question.id) ? '🚩 Marked' : '🚩 Mark'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentQuestion === attempt!.questions.length - 1 && styles.navButtonDisabled]}
          onPress={() => setCurrentQuestion(prev => prev + 1)}
          disabled={currentQuestion === attempt!.questions.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  testInfoCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  testName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.lg },
  testMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  testMetaItem: { width: '45%', backgroundColor: Colors.gray100, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center' },
  testMetaValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  testMetaLabel: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  instructions: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  instructionsTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  instructionItem: { fontSize: FontSize.sm, color: Colors.gray700, marginBottom: Spacing.sm, lineHeight: 20 },
  startButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', ...Shadow.primary },
  startButtonDisabled: { opacity: 0.7 },
  startButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  testHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  questionCounter: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray700, width: 60 },
  timer: { backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  timerWarning: { backgroundColor: Colors.error + '20' },
  timerText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900 },
  timerTextWarning: { color: Colors.error },
  submitHeaderButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  submitHeaderText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  questionContent: { padding: Spacing.lg, paddingBottom: 32 },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  questionSubject: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  questionMarks: { fontSize: FontSize.sm, color: Colors.gray500 },
  questionText: { fontSize: FontSize.base, color: Colors.gray900, lineHeight: 26, fontWeight: '500', marginBottom: Spacing.xl },
  options: { gap: Spacing.sm },
  option: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.gray200, ...Shadow.sm },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  optionBullet: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center' },
  optionBulletSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionBulletText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray700 },
  optionBulletTextSelected: { color: Colors.white },
  optionText: { flex: 1, fontSize: FontSize.sm, color: Colors.gray800, lineHeight: 20 },
  optionTextSelected: { color: Colors.primary, fontWeight: '600' },
  navigation: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200 },
  navButton: { flex: 1, backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray700 },
  reviewButton: { flex: 1, borderWidth: 1.5, borderColor: Colors.warning, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  reviewButtonActive: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  reviewButtonText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.warning },
});
