import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

export default function TestResultScreen() {
  const { attemptId, testId } = useLocalSearchParams<{ attemptId: string; testId: string }>();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['test-analysis', attemptId],
    queryFn: () => apiClient.get(
      ENDPOINTS.TESTS_ATTEMPT_ANALYSIS.replace(':id', testId).replace(':attemptId', attemptId)
    ).then(r => r.data),
    enabled: !!attemptId && !!testId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing your performance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scorePercentage = analysis ? (analysis.score / analysis.totalMarks) * 100 : 0;
  const getScoreColor = () => {
    if (scorePercentage >= 70) return Colors.success;
    if (scorePercentage >= 50) return Colors.warning;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score Header */}
        <View style={[styles.scoreCard, { borderColor: getScoreColor() + '40' }, Shadow.md]}>
          <Text style={styles.resultEmoji}>
            {scorePercentage >= 70 ? '🎉' : scorePercentage >= 50 ? '👍' : '💪'}
          </Text>
          <Text style={[styles.scorePercentage, { color: getScoreColor() }]}>
            {scorePercentage.toFixed(1)}%
          </Text>
          <Text style={styles.scoreValue}>
            {analysis?.score || 0} / {analysis?.totalMarks || 720}
          </Text>
          <Text style={styles.scoreRank}>
            {analysis?.estimatedRank ? `Estimated Rank: #${analysis.estimatedRank.toLocaleString()}` : 'Keep practicing!'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Correct', value: analysis?.correct || 0, color: Colors.success, icon: '✅' },
            { label: 'Wrong', value: analysis?.wrong || 0, color: Colors.error, icon: '❌' },
            { label: 'Skipped', value: analysis?.unattempted || 0, color: Colors.gray500, icon: '⏭️' },
            { label: 'Time Taken', value: analysis?.timeTaken ? `${Math.round(analysis.timeTaken / 60)}m` : '--', color: Colors.physics, icon: '⏱️' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, Shadow.sm]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Subject-wise */}
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        {(analysis?.subjectWise || []).map((sub: any) => (
          <View key={sub.subject} style={[styles.subjectCard, Shadow.sm]}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{sub.subject}</Text>
              <Text style={[styles.subjectScore, {
                color: sub.percentage >= 70 ? Colors.success : sub.percentage >= 50 ? Colors.warning : Colors.error
              }]}>
                {sub.score}/{sub.totalMarks} ({sub.percentage.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${sub.percentage}%`,
                backgroundColor: sub.percentage >= 70 ? Colors.success : sub.percentage >= 50 ? Colors.warning : Colors.error,
              }]} />
            </View>
            <View style={styles.subjectMeta}>
              <Text style={styles.subjectMetaItem}>✅ {sub.correct}</Text>
              <Text style={styles.subjectMetaItem}>❌ {sub.wrong}</Text>
              <Text style={styles.subjectMetaItem}>⏭️ {sub.unattempted}</Text>
            </View>
          </View>
        ))}

        {/* AI Feedback */}
        {analysis?.aiFeedback && (
          <View style={[styles.aiFeedbackCard, Shadow.sm]}>
            <Text style={styles.aiFeedbackTitle}>🧠 AI Analysis</Text>
            <Text style={styles.aiFeedbackText}>{analysis.aiFeedback}</Text>
            {analysis?.weakTopics?.length > 0 && (
              <View style={styles.weakTopics}>
                <Text style={styles.weakTopicsTitle}>Focus Areas:</Text>
                {analysis.weakTopics.map((topic: string, idx: number) => (
                  <Text key={idx} style={styles.weakTopicItem}>• {topic}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/(tabs)/tests')}>
            <Text style={styles.primaryActionText}>Take Another Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.secondaryActionText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  loadingText: { fontSize: FontSize.base, color: Colors.gray600 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  scoreCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 2 },
  resultEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  scorePercentage: { fontSize: 52, fontWeight: '900' },
  scoreValue: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.gray700, marginTop: Spacing.xs },
  scoreRank: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: Spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray500 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  subjectCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  subjectName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  subjectScore: { fontSize: FontSize.sm, fontWeight: '800' },
  progressBar: { height: 6, backgroundColor: Colors.gray200, borderRadius: 3, marginBottom: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  subjectMeta: { flexDirection: 'row', gap: Spacing.lg },
  subjectMetaItem: { fontSize: FontSize.xs, color: Colors.gray500 },
  aiFeedbackCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.lg },
  aiFeedbackTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  aiFeedbackText: { fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 22, marginBottom: Spacing.md },
  weakTopics: { backgroundColor: Colors.error + '10', borderRadius: BorderRadius.md, padding: Spacing.md },
  weakTopicsTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.error, marginBottom: Spacing.xs },
  weakTopicItem: { fontSize: FontSize.sm, color: Colors.gray700, marginBottom: 2 },
  actions: { gap: Spacing.md },
  primaryAction: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', ...Shadow.primary },
  primaryActionText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  secondaryAction: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
  secondaryActionText: { color: Colors.gray700, fontSize: FontSize.base, fontWeight: '600' },
});
