import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

const { width } = Dimensions.get('window');

const PERIODS = ['7 days', '30 days', '3 months', 'All time'];

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('30 days');

  const { data: performance } = useQuery({
    queryKey: ['performance', selectedPeriod],
    queryFn: () => apiClient.get(ENDPOINTS.ANALYTICS_PERFORMANCE, {
      params: { period: selectedPeriod },
    }).then(r => r.data),
  });

  const { data: subjectData } = useQuery({
    queryKey: ['subject-analytics'],
    queryFn: () => apiClient.get(ENDPOINTS.ANALYTICS_SUBJECTS).then(r => r.data),
  });

  const SUBJECTS = [
    { name: 'Biology', key: 'biology', color: Colors.biology, icon: '🧬' },
    { name: 'Physics', key: 'physics', color: Colors.physics, icon: '⚛️' },
    { name: 'Chemistry', key: 'chemistry', color: Colors.chemistry, icon: '🧪' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodChip, selectedPeriod === p && styles.periodChipActive]}
              onPress={() => setSelectedPeriod(p)}
            >
              <Text style={[styles.periodChipText, selectedPeriod === p && styles.periodChipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Questions Attempted', value: performance?.totalAttempted?.toLocaleString() || '0', icon: '📝', color: Colors.primary },
            { label: 'Correct Answers', value: performance?.totalCorrect?.toLocaleString() || '0', icon: '✅', color: Colors.success },
            { label: 'Overall Accuracy', value: `${(performance?.overallAccuracy || 0).toFixed(1)}%`, icon: '🎯', color: Colors.accent },
            { label: 'Study Hours', value: `${(performance?.studyHours || 0).toFixed(1)}h`, icon: '⏱️', color: Colors.secondary },
            { label: 'Tests Taken', value: performance?.testsTaken?.toString() || '0', icon: '📊', color: Colors.physics },
            { label: 'Avg Score', value: `${(performance?.avgScore || 0).toFixed(1)}%`, icon: '⭐', color: Colors.xpGold },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, Shadow.sm]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Subject-wise Breakdown */}
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        {SUBJECTS.map((sub) => {
          const data = subjectData?.[sub.key] || {};
          const accuracy = data.accuracy || 0;
          return (
            <View key={sub.key} style={[styles.subjectCard, Shadow.sm]}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectIcon}>{sub.icon}</Text>
                <Text style={styles.subjectName}>{sub.name}</Text>
                <Text style={[styles.subjectAccuracy, { color: accuracy >= 70 ? Colors.success : accuracy >= 40 ? Colors.warning : Colors.error }]}>
                  {accuracy.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBarOuter}>
                <View style={[styles.progressBarFill, { width: `${accuracy}%`, backgroundColor: sub.color }]} />
              </View>
              <View style={styles.subjectStats}>
                <Text style={styles.subjectStat}>Attempted: {data.attempted || 0}</Text>
                <Text style={styles.subjectStat}>Correct: {data.correct || 0}</Text>
                <Text style={styles.subjectStat}>Wrong: {data.wrong || 0}</Text>
              </View>

              {/* Chapter-wise weak areas */}
              {data.weakChapters?.length > 0 && (
                <View style={styles.weakChapters}>
                  <Text style={styles.weakChaptersTitle}>Needs Attention:</Text>
                  {data.weakChapters.slice(0, 3).map((ch: string, idx: number) => (
                    <Text key={idx} style={styles.weakChapterItem}>• {ch}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Rank Predictor */}
        <View style={[styles.rankCard, Shadow.md]}>
          <Text style={styles.rankCardTitle}>🏆 Rank Predictor</Text>
          <Text style={styles.rankCardSubtext}>Based on your performance trends</Text>
          <View style={styles.rankRow}>
            <View style={styles.rankItem}>
              <Text style={styles.rankValue}>{performance?.predictedRank ? `#${performance.predictedRank.toLocaleString()}` : 'N/A'}</Text>
              <Text style={styles.rankItemLabel}>Predicted Rank</Text>
            </View>
            <View style={styles.rankDivider} />
            <View style={styles.rankItem}>
              <Text style={styles.rankValue}>{performance?.percentile ? `${performance.percentile.toFixed(1)}%ile` : 'N/A'}</Text>
              <Text style={styles.rankItemLabel}>Percentile</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.rankButton}
            onPress={() => router.push('/rank-predictor' as any)}
          >
            <Text style={styles.rankButtonText}>Get Detailed Prediction →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  periodScroll: { marginBottom: Spacing.lg },
  periodChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white, marginRight: Spacing.sm },
  periodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  periodChipTextActive: { color: Colors.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { width: '31%', flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: FontSize.base, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.gray500, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  subjectCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  subjectIcon: { fontSize: 22 },
  subjectName: { flex: 1, fontSize: FontSize.base, fontWeight: '700', color: Colors.gray900 },
  subjectAccuracy: { fontSize: FontSize.base, fontWeight: '800' },
  progressBarOuter: { height: 8, backgroundColor: Colors.gray200, borderRadius: 4, marginBottom: Spacing.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  subjectStats: { flexDirection: 'row', gap: Spacing.lg },
  subjectStat: { fontSize: FontSize.xs, color: Colors.gray500 },
  weakChapters: { marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.error + '10', borderRadius: BorderRadius.md },
  weakChaptersTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.error, marginBottom: 4 },
  weakChapterItem: { fontSize: FontSize.xs, color: Colors.gray700 },
  rankCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginTop: Spacing.md },
  rankCardTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  rankCardSubtext: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: Spacing.lg },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  rankItem: { flex: 1, alignItems: 'center' },
  rankValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  rankItemLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  rankDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  rankButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  rankButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
});
