import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

interface RankResult {
  estimatedRank: number;
  percentile: number;
  category: string;
  topColleges: string[];
  recommendations: string[];
}

export default function RankPredictorScreen() {
  const navigation = useNavigation();
  const [physics, setPhysics] = useState('');
  const [chemistry, setChemistry] = useState('');
  const [biology, setBiology] = useState('');
  const [result, setResult] = useState<RankResult | null>(null);

  const predictMutation = useMutation({
    mutationFn: () =>
      apiClient.post(ENDPOINTS.AI_RANK_PREDICT, {
        physics: Number(physics),
        chemistry: Number(chemistry),
        biology: Number(biology),
      }).then(r => r.data),
    onSuccess: setResult,
  });

  const total = (Number(physics) || 0) + (Number(chemistry) || 0) + (Number(biology) || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rank Predictor 🔮</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Enter your expected/scored marks to predict your NEET rank</Text>

        <View style={styles.inputCard}>
          {[
            {label: '⚡ Physics', value: physics, setter: setPhysics, max: 180},
            {label: '🧪 Chemistry', value: chemistry, setter: setChemistry, max: 180},
            {label: '🌿 Biology', value: biology, setter: setBiology, max: 360},
          ].map(field => (
            <View key={field.label} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.fieldRight}>
                <TextInput
                  style={styles.scoreInput}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.gray400}
                  maxLength={3}
                />
                <Text style={styles.maxText}>/{field.max}</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Score</Text>
            <Text style={styles.totalValue}>{total}/720</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.predictBtn}
          onPress={() => predictMutation.mutate()}
          disabled={predictMutation.isPending || !physics || !chemistry || !biology}>
          {predictMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.predictBtnText}>Predict My Rank 🔮</Text>
          )}
        </TouchableOpacity>

        {result && (
          <>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.resultCard}>
              <Text style={styles.resultEmoji}>🎯</Text>
              <Text style={styles.resultRank}>#{result.estimatedRank?.toLocaleString()}</Text>
              <Text style={styles.resultLabel}>Estimated All-India Rank</Text>
              <Text style={styles.resultPercentile}>{result.percentile}th Percentile</Text>
              {result.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{result.category}</Text>
                </View>
              )}
            </LinearGradient>

            {result.topColleges && result.topColleges.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🏛 Colleges in Range</Text>
                {result.topColleges.map((college, i) => (
                  <View key={i} style={styles.collegeRow}>
                    <Text style={styles.collegeNum}>{i + 1}.</Text>
                    <Text style={styles.collegeName}>{college}</Text>
                  </View>
                ))}
              </View>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>💡 AI Recommendations</Text>
                {result.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recRow}>
                    <Text style={styles.recArrow}>→</Text>
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  content: {padding: Spacing.lg, gap: Spacing.lg},
  subtitle: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center'},
  inputCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.md, ...Shadow.md},
  fieldRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fieldLabel: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray700},
  fieldRight: {flexDirection: 'row', alignItems: 'center', gap: 4},
  scoreInput: {borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.md, padding: Spacing.sm, width: 64, textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  maxText: {fontSize: FontSize.md, color: Colors.gray400},
  totalRow: {flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.gray200, paddingTop: Spacing.md},
  totalLabel: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray700},
  totalValue: {fontSize: FontSize.xl, fontWeight: '900', color: Colors.primary},
  predictBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: Spacing.lg, alignItems: 'center', ...Shadow.primary},
  predictBtnText: {color: Colors.white, fontSize: FontSize.lg, fontWeight: '800'},
  resultCard: {borderRadius: BorderRadius.xl, padding: Spacing.xxl, alignItems: 'center'},
  resultEmoji: {fontSize: 56, marginBottom: Spacing.md},
  resultRank: {fontSize: 56, fontWeight: '900', color: Colors.white},
  resultLabel: {fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 4},
  resultPercentile: {fontSize: FontSize.lg, color: Colors.xpGold, fontWeight: '700', marginTop: Spacing.sm},
  categoryBadge: {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.lg, paddingVertical: 6, marginTop: Spacing.sm},
  categoryText: {color: Colors.white, fontWeight: '700'},
  card: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm},
  cardTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.sm},
  collegeRow: {flexDirection: 'row', gap: Spacing.sm},
  collegeNum: {fontSize: FontSize.md, fontWeight: '700', color: Colors.primary, width: 20},
  collegeName: {flex: 1, fontSize: FontSize.md, color: Colors.gray700, lineHeight: 22},
  recRow: {flexDirection: 'row', gap: Spacing.sm},
  recArrow: {color: Colors.primary, fontWeight: '700'},
  recText: {flex: 1, fontSize: FontSize.md, color: Colors.gray600, lineHeight: 22},
});
