import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp, AppStackParamList} from '@navigation/types';
import {apiClient} from '@services/api.service';

type Route = RouteProp<AppStackParamList, 'TestSession'>;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function TestSessionScreen() {
  const navigation = useNavigation<AppNavProp>();
  const route = useRoute<Route>();
  const {testId, attemptId} = route.params;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const {data: attempt, isLoading} = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => apiClient.get(`/tests/attempts/${attemptId}`).then(r => r.data),
    onSuccess: (data: any) => {
      setTimeLeft(data.remainingSeconds || data.test?.duration * 60);
    },
  } as any);

  const submitMutation = useMutation({
    mutationFn: () => apiClient.post(`/tests/attempts/${attemptId}/submit`, {answers}).then(r => r.data),
    onSuccess: () => {
      clearInterval(timerRef.current);
      navigation.replace('TestResult', {attemptId});
    },
  });

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitMutation.mutate();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const confirmSubmit = () => {
    const unattempted = (attempt?.questions?.length || 0) - Object.keys(answers).length;
    Alert.alert(
      'Submit Test?',
      `${unattempted} question(s) unattempted. Are you sure?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Submit', style: 'destructive', onPress: () => submitMutation.mutate()},
      ],
    );
  };

  if (isLoading || !attempt) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const questions = attempt.questions || [];
  const question = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeColor = timeLeft < 300 ? Colors.error : Colors.success;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.timer, {borderColor: timeColor}]}>
          <Text style={[styles.timerText, {color: timeColor}]}>⏱ {pad(mins)}:{pad(secs)}</Text>
        </View>
        <Text style={styles.progress}>{currentQ + 1}/{questions.length}</Text>
        <TouchableOpacity style={styles.submitBtn} onPress={confirmSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Question palette strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palette} contentContainerStyle={styles.paletteContent}>
        {questions.map((_: any, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.paletteBtn,
              answers[questions[i]?.id] != null && styles.paletteBtnAnswered,
              i === currentQ && styles.paletteBtnCurrent,
            ]}
            onPress={() => setCurrentQ(i)}>
            <Text style={[styles.paletteBtnText, (answers[questions[i]?.id] != null || i === currentQ) && {color: Colors.white}]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.questionArea}>
        {question && (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{question.questionText}</Text>
            <View style={styles.options}>
              {question.options?.map((opt: any, idx: number) => {
                const selected = answers[question.id] === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => setAnswers(prev => ({...prev, [question.id]: idx}))}>
                    <View style={[styles.optionCircle, selected && styles.optionCircleSelected]}>
                      <Text style={[styles.optionLetter, selected && {color: Colors.white}]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navBtn, currentQ === 0 && styles.navBtnDisabled]}
                onPress={() => setCurrentQ(q => Math.max(0, q - 1))}
                disabled={currentQ === 0}>
                <Text style={styles.navBtnText}>← Prev</Text>
              </TouchableOpacity>
              {answers[question.id] != null && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setAnswers(prev => {const n = {...prev}; delete n[question.id]; return n;})}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnNext, currentQ === questions.length - 1 && styles.navBtnDisabled]}
                onPress={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
                disabled={currentQ === questions.length - 1}>
                <Text style={[styles.navBtnText, {color: Colors.white}]}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  timer: {borderWidth: 1.5, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4},
  timerText: {fontSize: FontSize.md, fontWeight: '800'},
  progress: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray700},
  submitBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 6},
  submitBtnText: {color: Colors.white, fontWeight: '700', fontSize: FontSize.sm},
  palette: {maxHeight: 52, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  paletteContent: {padding: Spacing.sm, gap: 6, flexDirection: 'row'},
  paletteBtn: {width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: Colors.gray300, justifyContent: 'center', alignItems: 'center'},
  paletteBtnAnswered: {backgroundColor: Colors.success, borderColor: Colors.success},
  paletteBtnCurrent: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  paletteBtnText: {fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray600},
  questionArea: {flex: 1},
  questionCard: {margin: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.md},
  questionText: {fontSize: FontSize.md, color: Colors.gray900, lineHeight: 24, marginBottom: Spacing.xl},
  options: {gap: Spacing.sm},
  option: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md},
  optionSelected: {borderColor: Colors.primary, backgroundColor: '#F0EEFF'},
  optionCircle: {width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.gray300, justifyContent: 'center', alignItems: 'center'},
  optionCircleSelected: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  optionLetter: {fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray600},
  optionText: {fontSize: FontSize.md, color: Colors.gray800, flex: 1},
  optionTextSelected: {color: Colors.primary, fontWeight: '600'},
  navRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl},
  navBtn: {borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm},
  navBtnNext: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  navBtnDisabled: {opacity: 0.4},
  navBtnText: {fontWeight: '700', color: Colors.gray600},
  clearBtn: {borderWidth: 1, borderColor: Colors.error, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  clearBtnText: {color: Colors.error, fontSize: FontSize.sm, fontWeight: '600'},
});
