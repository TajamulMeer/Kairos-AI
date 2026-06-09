import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

const REVISION_MODES = [
  { id: 'smart', label: 'Smart Revision', emoji: '🧠', desc: 'AI picks topics based on upcoming tests and weak areas', color: '#EEF2FF' },
  { id: 'quick_recap', label: 'Quick Recap', emoji: '⚡', desc: '15-minute rapid fire of important points', color: '#FFF0EB' },
  { id: 'formula_sheet', label: 'Formula Sheet', emoji: '📐', desc: 'All important formulas for Physics & Chemistry', color: '#F0FFF4' },
  { id: 'diagrams', label: 'Diagrams & Structures', emoji: '🔬', desc: 'Important diagrams for Biology', color: '#FFF8E6' },
  { id: 'mnemonics', label: 'Mnemonics & Tricks', emoji: '🎯', desc: 'Memory tricks for hard-to-remember content', color: '#F5F0FF' },
];

interface RevisionContent {
  title: string;
  content: { type: string; text: string; items?: string[] }[];
  subject: string;
  estimatedMinutes: number;
}

export default function RevisionScreen() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [revisionContent, setRevisionContent] = useState<RevisionContent | null>(null);

  const { mutate: generateRevision, isPending } = useMutation({
    mutationFn: (mode: string) =>
      apiClient.post('/ai/revision/generate', { mode }).then(r => r.data),
    onSuccess: (data) => setRevisionContent(data),
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to generate revision content.'),
  });

  const handleSelectMode = (modeId: string) => {
    setSelectedMode(modeId);
    setRevisionContent(null);
    generateRevision(modeId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quick Revision</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!revisionContent ? (
          <>
            <Text style={styles.subtitle}>Choose a revision mode to get started</Text>
            <View style={styles.modesGrid}>
              {REVISION_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    { backgroundColor: mode.color },
                    selectedMode === mode.id && styles.modeCardSelected,
                    Shadow.sm,
                  ]}
                  onPress={() => handleSelectMode(mode.id)}
                  disabled={isPending}
                >
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <Text style={styles.modeLabel}>{mode.label}</Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                  {selectedMode === mode.id && isPending && (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: Spacing.sm }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.revisionContent}>
            <View style={styles.revisionHeader}>
              <Text style={styles.revisionTitle}>{revisionContent.title}</Text>
              <Text style={styles.revisionMeta}>{revisionContent.subject} • {revisionContent.estimatedMinutes} min</Text>
            </View>

            {revisionContent.content.map((section, idx) => (
              <View key={idx} style={[styles.sectionCard, Shadow.sm]}>
                {section.type === 'heading' && (
                  <Text style={styles.sectionHeading}>{section.text}</Text>
                )}
                {section.type === 'text' && (
                  <Text style={styles.sectionText}>{section.text}</Text>
                )}
                {section.type === 'list' && section.items && (
                  <View>
                    {section.text && <Text style={styles.sectionHeading}>{section.text}</Text>}
                    {section.items.map((item, i) => (
                      <Text key={i} style={styles.listItem}>• {item}</Text>
                    ))}
                  </View>
                )}
                {section.type === 'formula' && (
                  <View style={styles.formulaBox}>
                    <Text style={styles.formulaText}>{section.text}</Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.newRevisionButton} onPress={() => { setRevisionContent(null); setSelectedMode(null); }}>
              <Text style={styles.newRevisionButtonText}>← Choose Another Mode</Text>
            </TouchableOpacity>
          </View>
        )}
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
  subtitle: { fontSize: FontSize.sm, color: Colors.gray600, marginBottom: Spacing.lg },
  modesGrid: { gap: Spacing.md },
  modeCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 2, borderColor: 'transparent' },
  modeCardSelected: { borderColor: Colors.primary },
  modeEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  modeLabel: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.xs },
  modeDesc: { fontSize: FontSize.sm, color: Colors.gray600, lineHeight: 20 },
  revisionContent: { gap: Spacing.md },
  revisionHeader: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  revisionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  revisionMeta: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md },
  sectionHeading: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.sm },
  sectionText: { fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 22 },
  listItem: { fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 22, marginBottom: 4 },
  formulaBox: { backgroundColor: Colors.primary + '10', borderRadius: BorderRadius.md, padding: Spacing.md, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  formulaText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary, fontFamily: 'monospace' },
  newRevisionButton: { paddingVertical: Spacing.md, alignItems: 'center' },
  newRevisionButtonText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '700' },
});
