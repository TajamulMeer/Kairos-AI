import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp} from '@navigation/types';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

const SUBJECTS = [
  {code: 'PHY', name: 'Physics', emoji: '⚡', color: Colors.physics},
  {code: 'CHE', name: 'Chemistry', emoji: '🧪', color: Colors.chemistry},
  {code: 'BIO', name: 'Biology', emoji: '🌿', color: Colors.biology},
  {code: 'MATH', name: 'Mathematics', emoji: '📐', color: Colors.primary},
];

const MODES = [
  {id: 'adaptive', title: 'Adaptive', emoji: '🎯', desc: 'AI picks questions based on your weak areas'},
  {id: 'chapter', title: 'Chapter Wise', emoji: '📖', desc: 'Practice topic by topic'},
  {id: 'previous_year', title: 'Previous Years', emoji: '📜', desc: 'NEET/JEE past papers'},
  {id: 'speed', title: 'Speed Round', emoji: '⚡', desc: '60 seconds per question'},
];

export default function PracticeScreen() {
  const navigation = useNavigation<AppNavProp>();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const startPractice = (mode: string) => {
    navigation.navigate('PracticeSession', {
      mode,
      subjectCode: selectedSubject || undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice 📚</Text>
          <Text style={styles.subtitle}>Sharpen your skills with AI-powered questions</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Subject</Text>
          <View style={styles.subjectRow}>
            <TouchableOpacity
              style={[styles.subjectChip, !selectedSubject && styles.subjectChipActive]}
              onPress={() => setSelectedSubject(null)}>
              <Text style={[styles.subjectChipText, !selectedSubject && styles.subjectChipTextActive]}>All</Text>
            </TouchableOpacity>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s.code}
                style={[styles.subjectChip, selectedSubject === s.code && {backgroundColor: s.color, borderColor: s.color}]}
                onPress={() => setSelectedSubject(selectedSubject === s.code ? null : s.code)}>
                <Text style={{marginRight: 4}}>{s.emoji}</Text>
                <Text style={[styles.subjectChipText, selectedSubject === s.code && styles.subjectChipTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Mode</Text>
          {MODES.map(mode => (
            <TouchableOpacity key={mode.id} style={styles.modeCard} onPress={() => startPractice(mode.id)}>
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {padding: Spacing.xl, paddingBottom: Spacing.md},
  title: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.gray900},
  subtitle: {fontSize: FontSize.md, color: Colors.gray500, marginTop: Spacing.xs},
  section: {paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray800, marginBottom: Spacing.md},
  subjectRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  subjectChip: {flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.white},
  subjectChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  subjectChipText: {fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray600},
  subjectChipTextActive: {color: Colors.white},
  modeCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md, ...Shadow.sm},
  modeEmoji: {fontSize: 32},
  modeInfo: {flex: 1},
  modeTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  modeDesc: {fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2},
  arrow: {fontSize: FontSize.xl, color: Colors.gray400},
});
