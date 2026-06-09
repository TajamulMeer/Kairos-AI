import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp, AppStackParamList} from '@navigation/types';
import {apiClient} from '@services/api.service';

type Route = RouteProp<AppStackParamList, 'TestResult'>;

export default function TestResultScreen() {
  const navigation = useNavigation<AppNavProp>();
  const route = useRoute<Route>();
  const {attemptId} = route.params;

  const {data: result, isLoading} = useQuery({
    queryKey: ['test-result', attemptId],
    queryFn: () => apiClient.get(`/tests/attempts/${attemptId}/result`).then(r => r.data),
  });

  if (isLoading || !result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const pct = Math.round((result.score / result.maxMarks) * 100);
  const passed = pct >= (result.passingPercentage || 50);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={passed ? [Colors.success, '#27AE60'] : [Colors.error, '#C0392B']}
          style={styles.hero}>
          <Text style={styles.resultEmoji}>{passed ? '🏆' : '💪'}</Text>
          <Text style={styles.resultTitle}>{passed ? 'Well Done!' : 'Keep Going!'}</Text>
          <Text style={styles.scoreText}>{result.score}/{result.maxMarks}</Text>
          <Text style={styles.pctText}>{pct}%</Text>
          {result.estimatedRank && (
            <Text style={styles.rankText}>Estimated Rank: #{result.estimatedRank}</Text>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              {emoji: '✅', label: 'Correct', value: result.correct, color: Colors.success},
              {emoji: '❌', label: 'Wrong', value: result.wrong, color: Colors.error},
              {emoji: '⭕', label: 'Skipped', value: result.skipped, color: Colors.warning},
              {emoji: '⏱', label: 'Time', value: `${Math.round(result.timeTaken / 60)}m`, color: Colors.primary},
            ].map(s => (
              <View key={s.label} style={[styles.statCard, {borderTopColor: s.color}]}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Subject breakdown */}
          {result.subjectBreakdown && (
            <View style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>Subject Breakdown</Text>
              {result.subjectBreakdown.map((sub: any) => (
                <View key={sub.subject} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{sub.subject}</Text>
                  <View style={styles.subjectBar}>
                    <View style={[styles.subjectBarFill, {width: `${sub.accuracy}%`, backgroundColor: sub.color || Colors.primary}]} />
                  </View>
                  <Text style={styles.subjectPct}>{sub.accuracy}%</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Tests')}>
              <Text style={styles.actionBtnText}>Back to Tests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => navigation.navigate('Analytics')}>
              <Text style={[styles.actionBtnText, {color: Colors.white}]}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  hero: {padding: Spacing.xxl, alignItems: 'center'},
  resultEmoji: {fontSize: 64, marginBottom: Spacing.md},
  resultTitle: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, marginBottom: Spacing.sm},
  scoreText: {fontSize: FontSize.xxxl + 8, fontWeight: '900', color: Colors.white},
  pctText: {fontSize: FontSize.xl, color: 'rgba(255,255,255,0.8)', marginTop: 4},
  rankText: {fontSize: FontSize.md, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.sm, fontWeight: '600'},
  content: {padding: Spacing.lg},
  statsRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg},
  statCard: {flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', borderTopWidth: 3, ...Shadow.sm},
  statEmoji: {fontSize: 18},
  statValue: {fontSize: FontSize.lg, fontWeight: '800'},
  statLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  breakdownCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.sm},
  sectionTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.md},
  subjectRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  subjectName: {width: 80, fontSize: FontSize.sm, color: Colors.gray700},
  subjectBar: {flex: 1, height: 8, backgroundColor: Colors.gray200, borderRadius: 4, overflow: 'hidden'},
  subjectBarFill: {height: '100%', borderRadius: 4},
  subjectPct: {width: 36, fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700, textAlign: 'right'},
  actionRow: {flexDirection: 'row', gap: Spacing.md},
  actionBtn: {flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center'},
  actionBtnPrimary: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  actionBtnText: {fontWeight: '700', color: Colors.primary},
});
