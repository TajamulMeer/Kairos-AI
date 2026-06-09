import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp, AppStackParamList} from '@navigation/types';
import {apiClient} from '@services/api.service';
import Toast from 'react-native-toast-message';

type Route = RouteProp<AppStackParamList, 'TestStart'>;

export default function TestStartScreen() {
  const navigation = useNavigation<AppNavProp>();
  const route = useRoute<Route>();
  const {testId} = route.params;

  const {data: test, isLoading} = useQuery({
    queryKey: ['test', testId],
    queryFn: () => apiClient.get(`/tests/${testId}`).then(r => r.data),
  });

  const startMutation = useMutation({
    mutationFn: () => apiClient.post(`/tests/${testId}/attempt`).then(r => r.data),
    onSuccess: (data) => {
      navigation.replace('TestSession', {testId, attemptId: data.id});
    },
    onError: () => {
      Toast.show({type: 'error', text1: 'Failed to start test'});
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.testEmoji}>📝</Text>
          <Text style={styles.testTitle}>{test?.title}</Text>
          <Text style={styles.testSub}>{test?.description}</Text>
        </View>

        <View style={styles.infoGrid}>
          {[
            {emoji: '⏱', label: 'Duration', value: `${test?.duration} min`},
            {emoji: '❓', label: 'Questions', value: test?.totalQuestions},
            {emoji: '📊', label: 'Max Marks', value: test?.maxMarks},
            {emoji: '🎯', label: 'Passing', value: `${test?.passingPercentage}%`},
          ].map(info => (
            <View key={info.label} style={styles.infoCard}>
              <Text style={styles.infoEmoji}>{info.emoji}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
              <Text style={styles.infoLabel}>{info.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📋 Instructions</Text>
          {[
            '+4 marks for correct answer',
            '-1 mark for wrong answer',
            '0 marks for unattempted',
            'Timer cannot be paused',
            'Auto-submit when time ends',
          ].map(rule => (
            <View key={rule} style={styles.ruleRow}>
              <Text style={styles.ruleDot}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => startMutation.mutate()}
          disabled={startMutation.isPending}>
          {startMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.startBtnText}>Start Test 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  container: {padding: Spacing.xl},
  back: {marginBottom: Spacing.lg},
  backText: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  heroCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, ...Shadow.md},
  testEmoji: {fontSize: 56, marginBottom: Spacing.md},
  testTitle: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray900, textAlign: 'center'},
  testSub: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center', marginTop: Spacing.sm},
  infoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg},
  infoCard: {flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', ...Shadow.sm},
  infoEmoji: {fontSize: 24, marginBottom: 4},
  infoValue: {fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary},
  infoLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  rulesCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl, ...Shadow.sm},
  rulesTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.md},
  ruleRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: 6},
  ruleDot: {color: Colors.primary, fontWeight: '900'},
  ruleText: {fontSize: FontSize.md, color: Colors.gray600, flex: 1},
  startBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: Spacing.lg, alignItems: 'center', ...Shadow.primary},
  startBtnText: {color: Colors.white, fontSize: FontSize.lg, fontWeight: '800'},
});
