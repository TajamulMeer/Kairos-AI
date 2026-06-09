import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp, AppStackParamList} from '@navigation/types';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

type Route = RouteProp<AppStackParamList, 'PracticeSession'>;

interface Question {
  id: string;
  questionText: string;
  options: {id: string; text: string}[];
  subject: string;
  difficulty: string;
  topic: string;
}

export default function PracticeSessionScreen() {
  const navigation = useNavigation<AppNavProp>();
  const route = useRoute<Route>();
  const {mode, subjectCode} = route.params;

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState({correct: 0, wrong: 0});

  const {data: question, isLoading, refetch} = useQuery({
    queryKey: ['practice-question', mode, subjectCode, questionIndex],
    queryFn: () =>
      apiClient.get(ENDPOINTS.QUESTIONS_ADAPTIVE, {
        params: {mode, subjectCode, skip: questionIndex},
      }).then(r => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: ({questionId, selectedOption}: {questionId: string; selectedOption: number}) =>
      apiClient.post(`/questions/${questionId}/attempt`, {selectedOption}).then(r => r.data),
    onSuccess: (data) => {
      setRevealed(true);
      if (data.correct) {
        setScore(s => ({...s, correct: s.correct + 1}));
      } else {
        setScore(s => ({...s, wrong: s.wrong + 1}));
      }
    },
  });

  const next = () => {
    setSelected(null);
    setRevealed(false);
    setQuestionIndex(i => i + 1);
  };

  const q: Question | undefined = question?.question;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerStats}>
          <Text style={styles.correctStat}>✅ {score.correct}</Text>
          <Text style={styles.wrongStat}>❌ {score.wrong}</Text>
        </View>
        <Text style={styles.modeLabel}>{mode}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : q ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Text style={styles.metaSubject}>{q.subject}</Text>
              <Text style={styles.metaTopic}>{q.topic}</Text>
              <View style={[styles.difficultyBadge, {
                backgroundColor: q.difficulty === 'hard' ? '#FFE8E8' : q.difficulty === 'medium' ? '#FFF3E0' : '#E8F5E9'
              }]}>
                <Text style={[styles.difficultyText, {
                  color: q.difficulty === 'hard' ? Colors.error : q.difficulty === 'medium' ? Colors.warning : Colors.success
                }]}>{q.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.questionText}>{q.questionText}</Text>
          </View>

          <View style={styles.options}>
            {q.options?.map((opt, idx) => {
              let optStyle = styles.option;
              let textStyle = styles.optionText;

              if (revealed && submitMutation.data) {
                if (idx === submitMutation.data.correctOption) {
                  optStyle = {...styles.option, ...styles.optionCorrect} as any;
                  textStyle = {...styles.optionText, color: Colors.success} as any;
                } else if (idx === selected && !submitMutation.data.correct) {
                  optStyle = {...styles.option, ...styles.optionWrong} as any;
                  textStyle = {...styles.optionText, color: Colors.error} as any;
                }
              } else if (selected === idx) {
                optStyle = {...styles.option, ...styles.optionSelected} as any;
              }

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={optStyle}
                  onPress={() => !revealed && setSelected(idx)}
                  disabled={revealed}>
                  <View style={styles.optionCircle}>
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={textStyle}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {revealed && submitMutation.data?.explanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>💡 Explanation</Text>
              <Text style={styles.explanationText}>{submitMutation.data.explanation}</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            {!revealed ? (
              <TouchableOpacity
                style={[styles.submitBtn, selected === null && styles.submitBtnDisabled]}
                onPress={() => selected !== null && submitMutation.mutate({questionId: q.id, selectedOption: selected})}
                disabled={selected === null || submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextBtn} onPress={next}>
                <Text style={styles.nextBtnText}>Next Question →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.noMoreText}>No more questions available!</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Back to Practice</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {fontSize: FontSize.lg, color: Colors.gray600, fontWeight: '700', padding: 4},
  headerStats: {flexDirection: 'row', gap: Spacing.md},
  correctStat: {fontSize: FontSize.md, fontWeight: '700', color: Colors.success},
  wrongStat: {fontSize: FontSize.md, fontWeight: '700', color: Colors.error},
  modeLabel: {fontSize: FontSize.sm, color: Colors.gray400, textTransform: 'capitalize'},
  content: {padding: Spacing.lg, gap: Spacing.lg},
  questionCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.md},
  questionMeta: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap'},
  metaSubject: {fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary},
  metaTopic: {fontSize: FontSize.xs, color: Colors.gray400, flex: 1},
  difficultyBadge: {borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2},
  difficultyText: {fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize'},
  questionText: {fontSize: FontSize.md, color: Colors.gray900, lineHeight: 24},
  options: {gap: Spacing.sm},
  option: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md, ...Shadow.sm},
  optionSelected: {borderColor: Colors.primary, backgroundColor: '#F0EEFF'},
  optionCorrect: {borderColor: Colors.success, backgroundColor: '#E8F5E9'},
  optionWrong: {borderColor: Colors.error, backgroundColor: '#FFE8E8'},
  optionCircle: {width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center'},
  optionLetter: {fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray600},
  optionText: {flex: 1, fontSize: FontSize.md, color: Colors.gray800},
  explanationCard: {backgroundColor: '#FFF9E6', borderRadius: BorderRadius.xl, padding: Spacing.lg, borderLeftWidth: 4, borderLeftColor: Colors.warning},
  explanationTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.sm},
  explanationText: {fontSize: FontSize.md, color: Colors.gray700, lineHeight: 22},
  actionRow: {},
  submitBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: Spacing.md, alignItems: 'center', ...Shadow.primary},
  submitBtnDisabled: {opacity: 0.5},
  submitBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '700'},
  nextBtn: {backgroundColor: Colors.success, borderRadius: BorderRadius.xxl, padding: Spacing.md, alignItems: 'center'},
  nextBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '700'},
  noMoreText: {fontSize: FontSize.lg, color: Colors.gray500, textAlign: 'center'},
  doneBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md},
  doneBtnText: {color: Colors.white, fontWeight: '700'},
});
