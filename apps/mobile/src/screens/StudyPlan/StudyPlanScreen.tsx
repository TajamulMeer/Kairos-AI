import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

export default function StudyPlanScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {data: plan, isLoading, refetch} = useQuery({
    queryKey: ['study-plan-today'],
    queryFn: () => apiClient.get(ENDPOINTS.STUDY_PLANS_TODAY).then(r => r.data),
  });

  const {data: stats} = useQuery({
    queryKey: ['study-plan-stats'],
    queryFn: () => apiClient.get(ENDPOINTS.STUDY_PLANS_STATS).then(r => r.data),
  });

  const startSession = useMutation({
    mutationFn: (topicId: string) =>
      apiClient.post(ENDPOINTS.STUDY_SESSIONS_START, {topicId}).then(r => r.data),
    onSuccess: () => {
      Toast.show({type: 'success', text1: 'Study session started!'});
      queryClient.invalidateQueries({queryKey: ['study-plan-today']});
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const topics = plan?.topics || [];
  const completed = topics.filter((t: any) => t.completed).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Study Plan 📅</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}>

        {/* Today's Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressDate}>Today · {new Date().toLocaleDateString('en', {weekday: 'long', month: 'short', day: 'numeric'})}</Text>
          <Text style={styles.progressCount}>{completed}/{topics.length} topics</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${topics.length ? (completed / topics.length) * 100 : 0}%`}]} />
          </View>
          <Text style={styles.progressPct}>{topics.length ? Math.round((completed / topics.length) * 100) : 0}% complete</Text>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            {[
              {emoji: '📅', label: 'Study Days', value: stats.studyDays},
              {emoji: '⏱', label: 'Total Hours', value: `${stats.totalHours}h`},
              {emoji: '✅', label: 'Topics Done', value: stats.topicsCompleted},
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Topics</Text>
          {topics.map((topic: any) => (
            <View key={topic.id} style={[styles.topicCard, topic.completed && styles.topicCardDone]}>
              <View style={styles.topicLeft}>
                <Text style={styles.topicStatus}>{topic.completed ? '✅' : '⭕'}</Text>
                <View>
                  <Text style={[styles.topicName, topic.completed && styles.topicNameDone]}>{topic.name}</Text>
                  <Text style={styles.topicMeta}>{topic.subject} · {topic.estimatedMinutes}min</Text>
                </View>
              </View>
              {!topic.completed && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => startSession.mutate(topic.id)}>
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {topics.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>All done for today! Great work!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  progressCard: {margin: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadow.md},
  progressDate: {fontSize: FontSize.sm, color: Colors.gray500, marginBottom: Spacing.xs},
  progressCount: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray900, marginBottom: Spacing.md},
  progressBar: {height: 8, backgroundColor: Colors.gray200, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm},
  progressFill: {height: '100%', backgroundColor: Colors.primary, borderRadius: 4},
  progressPct: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600'},
  statsRow: {flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg},
  statCard: {flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', ...Shadow.sm},
  statEmoji: {fontSize: 22},
  statValue: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary},
  statLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  section: {paddingHorizontal: Spacing.lg},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray800, marginBottom: Spacing.md},
  topicCard: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.sm, ...Shadow.sm},
  topicCardDone: {opacity: 0.6},
  topicLeft: {flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1},
  topicStatus: {fontSize: 20},
  topicName: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray900},
  topicNameDone: {textDecorationLine: 'line-through', color: Colors.gray500},
  topicMeta: {fontSize: FontSize.xs, color: Colors.gray400, marginTop: 2},
  startBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 6},
  startBtnText: {color: Colors.white, fontWeight: '700', fontSize: FontSize.sm},
  empty: {alignItems: 'center', padding: Spacing.xxl},
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.md},
  emptyText: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center'},
});
