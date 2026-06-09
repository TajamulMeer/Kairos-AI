import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/src/constants/theme';
import { apiClient } from '@/src/services/api.service';

const SUBJECTS = [
  { code: 'BIOLOGY', name: 'Biology', icon: '🧬', color: Colors.biology, chapters: 38 },
  { code: 'PHYSICS', name: 'Physics', icon: '⚛️', color: Colors.physics, chapters: 29 },
  { code: 'CHEMISTRY', name: 'Chemistry', icon: '🧪', color: Colors.chemistry, chapters: 30 },
];

const PRACTICE_MODES = [
  { id: 'adaptive', icon: '🤖', title: 'AI Adaptive Practice', desc: 'Personalized for your weak areas', color: Colors.primary },
  { id: 'ncert', icon: '📖', title: 'NCERT Mode', desc: 'Master every NCERT concept', color: Colors.success },
  { id: 'pyq', icon: '📅', title: 'Previous Year Questions', desc: 'Practice with real NEET PYQs', color: Colors.secondary },
  { id: 'chapter', icon: '📚', title: 'Chapter Practice', desc: 'Focus on specific chapters', color: Colors.info },
];

export default function PracticeScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const { data: adaptiveQuestions, isLoading } = useQuery({
    queryKey: ['adaptive-questions', selectedSubject],
    queryFn: () => apiClient.get('/questions/adaptive', { params: { subjectId: selectedSubject, count: 30 } }).then(r => r.data),
    enabled: false,
  });

  const startPractice = (mode: string, subjectCode?: string) => {
    router.push({ pathname: '/practice-session', params: { mode, subjectCode } } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Master NEET one concept at a time</Text>
        </View>

        {/* Practice Modes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Modes</Text>
          <View style={styles.modesGrid}>
            {PRACTICE_MODES.map(mode => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, Shadow.sm, { borderLeftColor: mode.color }]}
                onPress={() => startPractice(mode.id)}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice by Subject</Text>
          {SUBJECTS.map(subject => (
            <TouchableOpacity
              key={subject.code}
              style={[styles.subjectCard, Shadow.sm, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}
              onPress={() => startPractice('chapter', subject.code)}
            >
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectChapters}>{subject.chapters} chapters</Text>
              </View>
              <Text style={styles.subjectArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick 10-question drill */}
        <View style={[styles.quickDrill, Shadow.primary]}>
          <Text style={styles.quickDrillEmoji}>⚡</Text>
          <View style={styles.quickDrillInfo}>
            <Text style={styles.quickDrillTitle}>Quick Drill — 10 Questions</Text>
            <Text style={styles.quickDrillSub}>Mixed topics • ~15 minutes</Text>
          </View>
          <TouchableOpacity style={styles.quickDrillBtn} onPress={() => startPractice('quick')}>
            <Text style={styles.quickDrillBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900 },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  modesGrid: { gap: Spacing.sm },
  modeCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  modeIcon: { fontSize: 28 },
  modeTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900, flex: 1 },
  modeDesc: { fontSize: FontSize.xs, color: Colors.gray500 },
  subjectCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  subjectIcon: { fontSize: 32 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.gray900 },
  subjectChapters: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  subjectArrow: { fontSize: FontSize.lg, color: Colors.primary, fontWeight: '700' },
  quickDrill: { margin: Spacing.lg, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  quickDrillEmoji: { fontSize: 32 },
  quickDrillInfo: { flex: 1 },
  quickDrillTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.white },
  quickDrillSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  quickDrillBtn: { backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  quickDrillBtnText: { color: Colors.primary, fontWeight: '800', fontSize: FontSize.sm },
});
