import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { useAuthStore } from '@store/auth.store';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: studentProfile, refetch } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => apiClient.get(ENDPOINTS.USERS_STUDENT_PROFILE).then(r => r.data),
  });

  const { data: todayPlan } = useQuery({
    queryKey: ['today-plan'],
    queryFn: () => apiClient.get(ENDPOINTS.STUDY_PLANS_TODAY).then(r => r.data),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {user?.fullName?.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>Let's crack NEET {user?.targetYear}!</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{studentProfile?.currentStreak || 0}</Text>
          </View>
        </View>

        {/* AI Insights Banner */}
        <TouchableOpacity style={styles.aiBanner} onPress={() => router.push('/(tabs)/mentor')}>
          <View style={styles.aiBannerLeft}>
            <Text style={styles.aiBannerEmoji}>🧠</Text>
            <View>
              <Text style={styles.aiBannerTitle}>Your AI Mentor has insights!</Text>
              <Text style={styles.aiBannerSubtext}>Tap to see today's personalized recommendations</Text>
            </View>
          </View>
          <Text style={styles.aiBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Accuracy', value: `${(studentProfile?.overallAccuracy || 0).toFixed(1)}%`, icon: '🎯', color: Colors.success },
            { label: 'Study Hours', value: `${(studentProfile?.totalStudyHours || 0).toFixed(0)}h`, icon: '⏱️', color: Colors.physics },
            { label: 'XP Points', value: `${(studentProfile?.totalXp || 0).toLocaleString()}`, icon: '⭐', color: Colors.xpGold },
            { label: 'Predicted Rank', value: studentProfile?.predictedRank ? `#${studentProfile.predictedRank.toLocaleString()}` : 'N/A', icon: '📈', color: Colors.secondary },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, Shadow.sm]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Study Plan</Text>
            <TouchableOpacity onPress={() => router.push('/study-plan')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          {todayPlan?.tasks?.length > 0 ? (
            todayPlan.tasks.slice(0, 3).map((task: any) => (
              <TouchableOpacity key={task.id} style={[styles.planCard, Shadow.sm]}>
                <View style={[styles.planSubjectDot, { backgroundColor: task.color || Colors.primary }]} />
                <View style={styles.planCardContent}>
                  <Text style={styles.planCardTitle}>{task.title}</Text>
                  <Text style={styles.planCardSub}>{task.subject} • {task.durationMinutes} min</Text>
                </View>
                <View style={[styles.planStatus, task.completed && styles.planStatusDone]}>
                  <Text style={styles.planStatusText}>{task.completed ? '✓' : '→'}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity style={[styles.generatePlanCard, Shadow.sm]} onPress={() => router.push('/study-plan')}>
              <Text style={styles.generatePlanEmoji}>🤖</Text>
              <Text style={styles.generatePlanText}>Generate your AI study plan for today</Text>
              <Text style={styles.generatePlanArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '🤔', label: 'Solve a Doubt', route: '/doubt-solver', color: '#EEF2FF' },
              { icon: '📝', label: 'Take a Test', route: '/(tabs)/tests', color: '#FFF0EB' },
              { icon: '🃏', label: 'Review Flashcards', route: '/flashcards', color: '#F0FFF4' },
              { icon: '📊', label: 'View Analytics', route: '/analytics', color: '#FFF8E6' },
              { icon: '🏆', label: 'Leaderboard', route: '/leaderboard', color: '#F5F0FF' },
              { icon: '⚡', label: 'Quick Revision', route: '/revision', color: '#FFF0F5' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionCard, { backgroundColor: action.color }, Shadow.sm]}
                onPress={() => router.push(action.route as any)}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Accuracy</Text>
          {[
            { subject: 'Biology', code: 'BIO', accuracy: studentProfile?.subjectAccuracy?.biology || 0, color: Colors.biology, icon: '🧬' },
            { subject: 'Physics', code: 'PHY', accuracy: studentProfile?.subjectAccuracy?.physics || 0, color: Colors.physics, icon: '⚛️' },
            { subject: 'Chemistry', code: 'CHE', accuracy: studentProfile?.subjectAccuracy?.chemistry || 0, color: Colors.chemistry, icon: '🧪' },
          ].map((sub) => (
            <View key={sub.code} style={[styles.subjectCard, Shadow.sm]}>
              <Text style={styles.subjectIcon}>{sub.icon}</Text>
              <View style={styles.subjectInfo}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{sub.subject}</Text>
                  <Text style={[styles.subjectAccuracy, { color: sub.color }]}>{sub.accuracy.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${sub.accuracy}%`, backgroundColor: sub.color }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900 },
  subGreeting: { fontSize: FontSize.sm, color: Colors.gray600, marginTop: 2 },
  streakBadge: { backgroundColor: '#FFF3E0', borderRadius: BorderRadius.xl, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakEmoji: { fontSize: 18 },
  streakCount: { fontSize: FontSize.base, fontWeight: '800', color: Colors.streak },
  aiBanner: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, ...Shadow.primary },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  aiBannerEmoji: { fontSize: 28 },
  aiBannerTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  aiBannerSubtext: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  aiBannerArrow: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: Spacing.xs },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  planCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.md },
  planSubjectDot: { width: 12, height: 12, borderRadius: 6 },
  planCardContent: { flex: 1 },
  planCardTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  planCardSub: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  planStatus: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  planStatusDone: { backgroundColor: Colors.success },
  planStatusText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray600 },
  generatePlanCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  generatePlanEmoji: { fontSize: 32 },
  generatePlanText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  generatePlanArrow: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '30%', flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray700, textAlign: 'center' },
  subjectCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  subjectIcon: { fontSize: 28 },
  subjectInfo: { flex: 1 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  subjectName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  subjectAccuracy: { fontSize: FontSize.sm, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: Colors.gray200, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
