import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

interface RankPrediction {
  predictedRank: number;
  predictedScore: number;
  percentile: number;
  collegePredictions: { name: string; state: string; category: string; probability: number }[];
  improvementTips: string[];
  confidenceLevel: number;
}

export default function RankPredictorScreen() {
  const [score, setScore] = useState('');
  const [prediction, setPrediction] = useState<RankPrediction | null>(null);

  const { mutate: predict, isPending } = useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.AI_RANK_PREDICT, data).then(r => r.data),
    onSuccess: (data) => setPrediction(data),
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to predict rank.'),
  });

  const handlePredict = () => {
    predict({ targetScore: score ? parseInt(score) : undefined });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rank Predictor</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Expected Score (optional)</Text>
          <TextInput
            style={styles.input}
            value={score}
            onChangeText={setScore}
            placeholder="e.g. 580"
            keyboardType="numeric"
          />
          <Text style={styles.inputHint}>Leave blank to predict based on your practice performance</Text>
        </View>

        <TouchableOpacity
          style={[styles.predictButton, isPending && styles.predictButtonDisabled]}
          onPress={handlePredict}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.predictingRow}>
              <ActivityIndicator color={Colors.white} />
              <Text style={styles.predictButtonText}>AI is predicting...</Text>
            </View>
          ) : (
            <Text style={styles.predictButtonText}>🎯 Predict My Rank</Text>
          )}
        </TouchableOpacity>

        {prediction && (
          <View style={styles.resultSection}>
            <LinearGradient colors={['#6C47FF', '#4D2FE0']} style={[styles.rankCard, Shadow.primary]}>
              <Text style={styles.rankLabel}>Predicted Rank</Text>
              <Text style={styles.rankValue}>#{prediction.predictedRank.toLocaleString()}</Text>
              <Text style={styles.rankPercentile}>{prediction.percentile.toFixed(1)}th Percentile</Text>
              <View style={styles.rankMetaRow}>
                <View style={styles.rankMeta}>
                  <Text style={styles.rankMetaValue}>{prediction.predictedScore}</Text>
                  <Text style={styles.rankMetaLabel}>Predicted Score</Text>
                </View>
                <View style={styles.rankDivider} />
                <View style={styles.rankMeta}>
                  <Text style={styles.rankMetaValue}>{prediction.confidenceLevel}%</Text>
                  <Text style={styles.rankMetaLabel}>Confidence</Text>
                </View>
              </View>
            </LinearGradient>

            {prediction.collegePredictions?.length > 0 && (
              <View style={styles.collegesSection}>
                <Text style={styles.sectionTitle}>Likely Colleges</Text>
                {prediction.collegePredictions.map((college, idx) => (
                  <View key={idx} style={[styles.collegeCard, Shadow.sm]}>
                    <View style={styles.collegeInfo}>
                      <Text style={styles.collegeName}>{college.name}</Text>
                      <Text style={styles.collegeMeta}>{college.state} • {college.category}</Text>
                    </View>
                    <View style={[styles.probabilityBadge, {
                      backgroundColor: college.probability > 70 ? Colors.success + '20' : college.probability > 40 ? Colors.warning + '20' : Colors.error + '20'
                    }]}>
                      <Text style={[styles.probabilityText, {
                        color: college.probability > 70 ? Colors.success : college.probability > 40 ? Colors.warning : Colors.error
                      }]}>
                        {college.probability.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {prediction.improvementTips?.length > 0 && (
              <View style={[styles.tipsCard, Shadow.sm]}>
                <Text style={styles.sectionTitle}>How to Improve</Text>
                {prediction.improvementTips.map((tip, idx) => (
                  <Text key={idx} style={styles.tipItem}>• {tip}</Text>
                ))}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  inputSection: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray700, marginBottom: Spacing.sm },
  input: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: FontSize.xl, fontWeight: '700', color: Colors.gray900, backgroundColor: Colors.white, textAlign: 'center' },
  inputHint: { fontSize: FontSize.xs, color: Colors.gray400, marginTop: Spacing.xs, textAlign: 'center' },
  predictButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.primary },
  predictButtonDisabled: { backgroundColor: Colors.primaryLight },
  predictingRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  predictButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  resultSection: { gap: Spacing.lg },
  rankCard: { borderRadius: BorderRadius.xxl, padding: Spacing.xl, alignItems: 'center' },
  rankLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  rankValue: { fontSize: 52, fontWeight: '900', color: Colors.white, marginVertical: Spacing.sm },
  rankPercentile: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.lg },
  rankMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  rankMeta: { alignItems: 'center' },
  rankMetaValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  rankMetaLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  rankDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  collegesSection: {},
  collegeCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  collegeInfo: { flex: 1 },
  collegeName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  collegeMeta: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  probabilityBadge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  probabilityText: { fontSize: FontSize.sm, fontWeight: '800' },
  tipsCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  tipItem: { fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 22, marginBottom: Spacing.sm },
});
