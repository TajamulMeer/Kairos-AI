import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

const {width} = Dimensions.get('window');

const SUBJECT_COLORS: Record<string, string> = {
  Physics: Colors.physics,
  Chemistry: Colors.chemistry,
  Biology: Colors.biology,
  Mathematics: Colors.primary,
};

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'overview' | 'subjects' | 'forecast'>('overview');

  const {data: performance, isLoading: perfLoading} = useQuery({
    queryKey: ['analytics-performance'],
    queryFn: () => apiClient.get(ENDPOINTS.ANALYTICS_PERFORMANCE).then(r => r.data),
  });

  const {data: subjects, isLoading: subLoading} = useQuery({
    queryKey: ['analytics-subjects'],
    queryFn: () => apiClient.get(ENDPOINTS.ANALYTICS_SUBJECTS).then(r => r.data),
  });

  const {data: forecast} = useQuery({
    queryKey: ['analytics-forecast'],
    queryFn: () => apiClient.get(ENDPOINTS.ANALYTICS_FORECAST).then(r => r.data),
  });

  const isLoading = perfLoading || subLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics 📊</Text>
        <View style={{width: 60}} />
      </View>

      <View style={styles.tabs}>
        {(['overview', 'subjects', 'forecast'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {tab === 'overview' && performance && (
            <>
              {/* Key metrics */}
              <View style={styles.metricsGrid}>
                {[
                  {emoji: '📊', label: 'Accuracy', value: `${performance.accuracy}%`, color: Colors.primary},
                  {emoji: '✅', label: 'Questions', value: performance.totalQuestions, color: Colors.success},
                  {emoji: '🔥', label: 'Streak', value: `${performance.currentStreak}d`, color: Colors.streak},
                  {emoji: '⏱', label: 'Avg Time', value: `${performance.avgTimePerQ}s`, color: Colors.info},
                ].map(m => (
                  <View key={m.label} style={[styles.metricCard, {borderTopColor: m.color}]}>
                    <Text style={styles.metricEmoji}>{m.emoji}</Text>
                    <Text style={[styles.metricValue, {color: m.color}]}>{m.value}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>

              {/* Weekly trend */}
              {performance.weeklyAccuracy && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>7-Day Accuracy Trend</Text>
                  <View style={styles.barChart}>
                    {performance.weeklyAccuracy.map((day: any, i: number) => (
                      <View key={i} style={styles.barItem}>
                        <View style={styles.barTrack}>
                          <View style={[styles.bar, {height: `${day.accuracy}%`, backgroundColor: Colors.primary}]} />
                        </View>
                        <Text style={styles.barLabel}>{day.dayLabel}</Text>
                        <Text style={styles.barValue}>{day.accuracy}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Strong/Weak */}
              {performance.strongTopics && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>💪 Strong Topics</Text>
                  {performance.strongTopics.map((t: string) => (
                    <View key={t} style={styles.topicBadge}><Text style={styles.topicBadgeText}>✅ {t}</Text></View>
                  ))}
                </View>
              )}
              {performance.weakTopics && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>⚠️ Needs Improvement</Text>
                  {performance.weakTopics.map((t: string) => (
                    <View key={t} style={[styles.topicBadge, {backgroundColor: '#FFF3E0'}]}><Text style={[styles.topicBadgeText, {color: Colors.warning}]}>⚡ {t}</Text></View>
                  ))}
                </View>
              )}
            </>
          )}

          {tab === 'subjects' && subjects && (
            <View style={styles.card}>
              {subjects.subjects?.map((sub: any) => (
                <View key={sub.subject} style={styles.subjectRow}>
                  <View style={[styles.subjectDot, {backgroundColor: SUBJECT_COLORS[sub.subject] || Colors.primary}]} />
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{sub.subject}</Text>
                    <Text style={styles.subjectMeta}>{sub.correct}/{sub.total} correct</Text>
                  </View>
                  <View style={styles.subjectBarContainer}>
                    <View style={[styles.subjectBar, {width: `${sub.accuracy}%`, backgroundColor: SUBJECT_COLORS[sub.subject] || Colors.primary}]} />
                  </View>
                  <Text style={styles.subjectPct}>{sub.accuracy}%</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'forecast' && forecast && (
            <>
              <View style={styles.forecastCard}>
                <Text style={styles.forecastEmoji}>🔮</Text>
                <Text style={styles.forecastRank}>#{forecast.estimatedRank?.toLocaleString()}</Text>
                <Text style={styles.forecastLabel}>Estimated All-India Rank</Text>
                <Text style={styles.forecastScore}>Predicted Score: {forecast.predictedScore}/{forecast.maxScore}</Text>
              </View>
              {forecast.recommendations && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>AI Recommendations</Text>
                  {forecast.recommendations.map((rec: string, i: number) => (
                    <View key={i} style={styles.recRow}>
                      <Text style={styles.recDot}>→</Text>
                      <Text style={styles.recText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  tabs: {flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  tab: {flex: 1, padding: Spacing.md, alignItems: 'center'},
  tabActive: {borderBottomWidth: 2, borderBottomColor: Colors.primary},
  tabText: {fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '600'},
  tabTextActive: {color: Colors.primary},
  content: {padding: Spacing.lg, gap: Spacing.lg},
  metricsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  metricCard: {flex: 1, minWidth: (width - Spacing.lg * 2 - Spacing.sm) / 2 - 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', borderTopWidth: 3, ...Shadow.sm},
  metricEmoji: {fontSize: 22},
  metricValue: {fontSize: FontSize.xl, fontWeight: '800'},
  metricLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  card: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.sm, gap: Spacing.sm},
  cardTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.sm},
  barChart: {flexDirection: 'row', height: 120, gap: 8, alignItems: 'flex-end'},
  barItem: {flex: 1, alignItems: 'center'},
  barTrack: {flex: 1, width: '100%', backgroundColor: Colors.gray100, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end'},
  bar: {width: '100%', borderRadius: 4},
  barLabel: {fontSize: 9, color: Colors.gray500, marginTop: 4},
  barValue: {fontSize: 9, color: Colors.primary, fontWeight: '700'},
  topicBadge: {backgroundColor: '#E8F5E9', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4},
  topicBadgeText: {fontSize: FontSize.sm, color: Colors.success, fontWeight: '500'},
  subjectRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  subjectDot: {width: 12, height: 12, borderRadius: 6},
  subjectInfo: {width: 100},
  subjectName: {fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray800},
  subjectMeta: {fontSize: FontSize.xs, color: Colors.gray400},
  subjectBarContainer: {flex: 1, height: 8, backgroundColor: Colors.gray200, borderRadius: 4, overflow: 'hidden'},
  subjectBar: {height: '100%', borderRadius: 4},
  subjectPct: {width: 40, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'right', color: Colors.gray700},
  forecastCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xxl, alignItems: 'center', ...Shadow.md},
  forecastEmoji: {fontSize: 56, marginBottom: Spacing.md},
  forecastRank: {fontSize: 48, fontWeight: '900', color: Colors.primary},
  forecastLabel: {fontSize: FontSize.md, color: Colors.gray500, marginTop: 4},
  forecastScore: {fontSize: FontSize.md, color: Colors.gray700, fontWeight: '600', marginTop: Spacing.sm},
  recRow: {flexDirection: 'row', gap: Spacing.sm},
  recDot: {color: Colors.primary, fontWeight: '700'},
  recText: {flex: 1, fontSize: FontSize.md, color: Colors.gray700, lineHeight: 22},
});
