import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

const SUBJECTS = [
  { id: 'all', label: 'All', icon: '📚', color: Colors.primary },
  { id: 'biology', label: 'Biology', icon: '🧬', color: Colors.biology },
  { id: 'physics', label: 'Physics', icon: '⚛️', color: Colors.physics },
  { id: 'chemistry', label: 'Chemistry', icon: '🧪', color: Colors.chemistry },
];

const MODES = [
  { id: 'adaptive', label: 'Adaptive Practice', icon: '🎯', desc: 'AI selects questions based on your weak areas', color: '#EEF2FF' },
  { id: 'chapter', label: 'Chapter-wise', icon: '📖', desc: 'Practice by specific chapters', color: '#FFF0EB' },
  { id: 'previous_year', label: 'Previous Year', icon: '🗓️', desc: 'NEET 2019–2024 questions', color: '#F0FFF4' },
  { id: 'mock', label: 'Quick Mock', icon: '⚡', desc: '30-question timed session', color: '#FFF8E6' },
];

export default function PracticeScreen() {
  const [selectedSubject, setSelectedSubject] = useState('all');

  const { data: chaptersData, isLoading } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: () => apiClient.get(ENDPOINTS.CHAPTERS_LIST, {
      params: { subject: selectedSubject !== 'all' ? selectedSubject : undefined },
    }).then(r => r.data),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Choose how you want to practice today</Text>

        {/* Practice Modes */}
        <View style={styles.modesGrid}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, { backgroundColor: mode.color }, Shadow.sm]}
              onPress={() => router.push({ pathname: '/practice-session', params: { mode: mode.id } } as any)}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text style={styles.modeLabel}>{mode.label}</Text>
              <Text style={styles.modeDesc}>{mode.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject Filter */}
        <Text style={styles.sectionTitle}>Browse by Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.subjectChip, selectedSubject === s.id && { backgroundColor: s.color, borderColor: s.color }]}
              onPress={() => setSelectedSubject(s.id)}
            >
              <Text style={styles.subjectChipIcon}>{s.icon}</Text>
              <Text style={[styles.subjectChipLabel, selectedSubject === s.id && styles.subjectChipLabelActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chapters List */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <View style={styles.chaptersList}>
            {(chaptersData?.chapters || []).map((chapter: any) => (
              <TouchableOpacity
                key={chapter.id}
                style={[styles.chapterCard, Shadow.sm]}
                onPress={() => router.push({ pathname: '/practice-session', params: { chapterId: chapter.id, mode: 'chapter' } } as any)}
              >
                <View style={styles.chapterLeft}>
                  <View style={[styles.chapterDot, { backgroundColor: chapter.subjectColor || Colors.primary }]} />
                  <View>
                    <Text style={styles.chapterName}>{chapter.name}</Text>
                    <Text style={styles.chapterMeta}>{chapter.subject} • {chapter.questionCount} questions</Text>
                  </View>
                </View>
                <View style={styles.chapterRight}>
                  <Text style={[styles.chapterAccuracy, { color: chapter.accuracy > 70 ? Colors.success : chapter.accuracy > 40 ? Colors.warning : Colors.error }]}>
                    {chapter.accuracy ? `${chapter.accuracy.toFixed(0)}%` : '--'}
                  </Text>
                  <Text style={styles.chapterArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
            {(!chaptersData?.chapters || chaptersData.chapters.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyText}>No chapters found for this subject.</Text>
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
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray600, marginBottom: Spacing.lg },
  modesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  modeCard: { width: '48%', borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.xs },
  modeIcon: { fontSize: 28 },
  modeLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900 },
  modeDesc: { fontSize: FontSize.xs, color: Colors.gray600, lineHeight: 16 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  subjectScroll: { marginBottom: Spacing.lg },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white, marginRight: Spacing.sm },
  subjectChipIcon: { fontSize: 16 },
  subjectChipLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  subjectChipLabelActive: { color: Colors.white },
  chaptersList: { gap: Spacing.sm },
  chapterCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chapterLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  chapterDot: { width: 12, height: 12, borderRadius: 6 },
  chapterName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  chapterMeta: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  chapterRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chapterAccuracy: { fontSize: FontSize.sm, fontWeight: '800' },
  chapterArrow: { fontSize: FontSize.sm, color: Colors.gray400 },
  emptyState: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center' },
});
