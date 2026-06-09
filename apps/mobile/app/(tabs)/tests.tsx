import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/src/constants/theme';
import { apiClient } from '@/src/services/api.service';
import { ENDPOINTS } from '@/src/constants/api';

const TEST_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'full_length', label: 'Full Mock' },
  { key: 'chapter', label: 'Chapter' },
  { key: 'subject', label: 'Subject' },
];

export default function TestsScreen() {
  const [selectedType, setSelectedType] = useState('all');

  const { data: tests, isLoading } = useQuery({
    queryKey: ['tests', selectedType],
    queryFn: () => apiClient.get(ENDPOINTS.TESTS_LIST, {
      params: selectedType !== 'all' ? { type: selectedType } : {},
    }).then(r => r.data),
  });

  const { mutate: generateTest, isPending: isGenerating } = useMutation({
    mutationFn: () => apiClient.post('/tests/generate/full-length', { examTypeId: 'neet-exam-type-id' }).then(r => r.data),
    onSuccess: (test) => router.push({ pathname: '/test-start', params: { testId: test.id } }),
    onError: () => Alert.alert('Error', 'Could not generate test. Please ensure questions are loaded.'),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mock Tests</Text>
        <Text style={styles.subtitle}>Practice and track your NEET performance</Text>
      </View>

      {/* Generate Full Mock CTA */}
      <TouchableOpacity style={styles.generateCard} onPress={() => generateTest()} disabled={isGenerating}>
        <View style={styles.generateLeft}>
          <Text style={styles.generateEmoji}>🏆</Text>
          <View>
            <Text style={styles.generateTitle}>Full NEET Mock Test</Text>
            <Text style={styles.generateSub}>180 Questions • 200 Minutes • AI Analysis</Text>
          </View>
        </View>
        {isGenerating ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.generateArrow}>→</Text>}
      </TouchableOpacity>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {TEST_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.filterTab, selectedType === t.key && styles.filterTabActive]}
            onPress={() => setSelectedType(t.key)}
          >
            <Text style={[styles.filterTabText, selectedType === t.key && styles.filterTabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={tests || []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No tests available yet</Text>
              <Text style={styles.emptySubtext}>Generate your first full mock test above</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.testCard, Shadow.sm]}
              onPress={() => router.push({ pathname: '/test-start', params: { testId: item.id } })}
            >
              <View style={styles.testCardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'full_length' ? Colors.primary + '20' : Colors.secondary + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: item.type === 'full_length' ? Colors.primary : Colors.secondary }]}>
                    {item.type?.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.questionsCount}>{item.totalQuestions} Q</Text>
              </View>
              <Text style={styles.testTitle}>{item.title}</Text>
              <View style={styles.testMeta}>
                <Text style={styles.testMetaText}>⏱ {item.durationMinutes} min</Text>
                <Text style={styles.testMetaText}>📊 {item.totalMarks} marks</Text>
                <Text style={styles.testMetaText}>➖ {item.negativeMarks} negative</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900 },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2 },
  generateCard: { margin: Spacing.lg, marginTop: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadow.primary },
  generateLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  generateEmoji: { fontSize: 32 },
  generateTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.white },
  generateSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  generateArrow: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  filterTab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200 },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray600 },
  filterTabTextActive: { color: Colors.white },
  loader: { flex: 1, marginTop: 60 },
  listContent: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.md },
  testCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  testCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  typeBadge: { paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.full },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  questionsCount: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray600 },
  testTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.gray900, marginBottom: Spacing.sm },
  testMeta: { flexDirection: 'row', gap: Spacing.md },
  testMetaText: { fontSize: FontSize.xs, color: Colors.gray500 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.gray700 },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: Spacing.sm },
});
