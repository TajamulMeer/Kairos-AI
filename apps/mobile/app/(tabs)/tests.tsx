import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';
import { format } from 'date-fns';

const TEST_TYPES = ['All', 'Full Mock', 'Subject', 'Chapter', 'Previous Year'];

export default function TestsScreen() {
  const [selectedType, setSelectedType] = useState('All');

  const { data: testsData, isLoading } = useQuery({
    queryKey: ['tests', selectedType],
    queryFn: () => apiClient.get(ENDPOINTS.TESTS_LIST, {
      params: { type: selectedType !== 'All' ? selectedType.toLowerCase().replace(' ', '_') : undefined },
    }).then(r => r.data),
  });

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'easy') return Colors.success;
    if (difficulty === 'medium') return Colors.warning;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tests</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-test' as any)}
          >
            <Text style={styles.createButtonText}>+ Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Full NEET Mock CTA */}
        <TouchableOpacity
          style={styles.mockCta}
          onPress={() => router.push({ pathname: '/test-start', params: { type: 'full_mock' } } as any)}
        >
          <View style={styles.mockCtaLeft}>
            <Text style={styles.mockCtaEmoji}>🎯</Text>
            <View>
              <Text style={styles.mockCtaTitle}>Full NEET Mock Test</Text>
              <Text style={styles.mockCtaSubtext}>180 questions • 3 hours 20 min • 720 marks</Text>
            </View>
          </View>
          <Text style={styles.mockCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {TEST_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tests List */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <View style={styles.testsList}>
            {(testsData?.tests || []).map((test: any) => (
              <TouchableOpacity
                key={test.id}
                style={[styles.testCard, Shadow.sm]}
                onPress={() => router.push({ pathname: '/test-start', params: { testId: test.id } } as any)}
              >
                <View style={styles.testCardTop}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.title}</Text>
                    <Text style={styles.testMeta}>
                      {test.questionCount} questions • {test.durationMinutes} min • {test.totalMarks} marks
                    </Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(test.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(test.difficulty) }]}>
                      {test.difficulty}
                    </Text>
                  </View>
                </View>

                {test.lastAttempt && (
                  <View style={styles.lastAttempt}>
                    <Text style={styles.lastAttemptText}>
                      Last attempt: {format(new Date(test.lastAttempt.completedAt), 'dd MMM')} •{' '}
                      <Text style={{ color: test.lastAttempt.percentage >= 60 ? Colors.success : Colors.error }}>
                        {test.lastAttempt.percentage.toFixed(1)}%
                      </Text>
                    </Text>
                  </View>
                )}

                <View style={styles.testCardBottom}>
                  <View style={styles.subjectTags}>
                    {(test.subjects || []).map((s: string) => (
                      <View key={s} style={styles.subjectTag}>
                        <Text style={styles.subjectTagText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.startText}>Start →</Text>
                </View>
              </TouchableOpacity>
            ))}
            {(!testsData?.tests || testsData.tests.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyText}>No tests available yet.</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/create-test' as any)}
                >
                  <Text style={styles.emptyButtonText}>Create a Test</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900 },
  createButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  createButtonText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  mockCta: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, ...Shadow.md },
  mockCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  mockCtaEmoji: { fontSize: 32 },
  mockCtaTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.white },
  mockCtaSubtext: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  mockCtaArrow: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
  filterScroll: { marginBottom: Spacing.lg },
  filterChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white, marginRight: Spacing.sm },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  filterChipTextActive: { color: Colors.white },
  testsList: { gap: Spacing.sm },
  testCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md },
  testCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  testInfo: { flex: 1, marginRight: Spacing.sm },
  testName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  testMeta: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  difficultyBadge: { borderRadius: BorderRadius.full, paddingVertical: 4, paddingHorizontal: Spacing.sm },
  difficultyText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  lastAttempt: { backgroundColor: Colors.gray100, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  lastAttemptText: { fontSize: FontSize.xs, color: Colors.gray600 },
  testCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectTags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', flex: 1 },
  subjectTag: { backgroundColor: Colors.gray100, borderRadius: BorderRadius.sm, paddingVertical: 2, paddingHorizontal: Spacing.sm },
  subjectTagText: { fontSize: FontSize.xs, color: Colors.gray600, fontWeight: '600' },
  startText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center', marginBottom: Spacing.lg },
  emptyButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  emptyButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
});
