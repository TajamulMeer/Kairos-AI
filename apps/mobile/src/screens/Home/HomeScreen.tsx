import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {AppNavProp} from '@navigation/types';
import {useAuthStore} from '@store/auth.store';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

const {width} = Dimensions.get('window');

function StatCard({emoji, value, label, color}: {emoji: string; value: string; label: string; color: string}) {
  return (
    <View style={[styles.statCard, {borderTopColor: color}]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({emoji, title, subtitle, onPress, gradient}: {
  emoji: string; title: string; subtitle: string;
  onPress: () => void; gradient: string[];
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient colors={gradient} style={styles.quickActionGradient}>
        <Text style={styles.quickActionEmoji}>{emoji}</Text>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<AppNavProp>();
  const {user} = useAuthStore();

  const {data: studyPlan, isLoading, refetch} = useQuery({
    queryKey: ['study-plan-today'],
    queryFn: () => apiClient.get(ENDPOINTS.STUDY_PLANS_TODAY).then(r => r.data),
  });

  const {data: gamification} = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => apiClient.get(ENDPOINTS.GAMIFICATION_PROFILE).then(r => r.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}>

        {/* Header */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Student'} 👋</Text>
              <Text style={styles.examBadge}>{user?.examTarget || 'NEET'} Aspirant</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <View style={styles.notifBtn}>
                <Text style={{fontSize: 22}}>🔔</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Streak & XP */}
          <View style={styles.streakRow}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>{gamification?.streak || 0} day streak</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpStar}>⭐</Text>
              <Text style={styles.xpText}>{gamification?.xp || 0} XP</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard emoji="✅" value={`${studyPlan?.completedTopics || 0}/${studyPlan?.totalTopics || 0}`} label="Today" color={Colors.success} />
            <StatCard emoji="📊" value={`${gamification?.accuracy || 0}%`} label="Accuracy" color={Colors.primary} />
            <StatCard emoji="🏆" value={`#${gamification?.nationalRank || '—'}`} label="Rank" color={Colors.xpGold} />
          </View>

          {/* Today's Study Plan */}
          {studyPlan && (
            <TouchableOpacity style={styles.planCard} onPress={() => navigation.navigate('StudyPlan')}>
              <View style={styles.planHeader}>
                <Text style={styles.sectionTitle}>📅 Today's Plan</Text>
                <Text style={styles.seeAll}>See All →</Text>
              </View>
              {studyPlan.topics?.slice(0, 3).map((topic: any) => (
                <View key={topic.id} style={styles.topicRow}>
                  <Text style={{fontSize: 16}}>{topic.completed ? '✅' : '⭕'}</Text>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <Text style={styles.topicMeta}>{topic.subject} · {topic.estimatedMinutes}min</Text>
                  </View>
                </View>
              ))}
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              emoji="🤔" title="Doubt Solver" subtitle="Ask AI anything"
              gradient={[Colors.primary, Colors.primaryDark]}
              onPress={() => navigation.navigate('DoubtSolver')}
            />
            <QuickAction
              emoji="📝" title="Practice" subtitle="Adaptive questions"
              gradient={['#FF6B35', '#E85D04']}
              onPress={() => navigation.navigate('Practice')}
            />
            <QuickAction
              emoji="🃏" title="Flashcards" subtitle="Spaced repetition"
              gradient={[Colors.accent, '#00B894']}
              onPress={() => navigation.navigate('Flashcards', {})}
            />
            <QuickAction
              emoji="📈" title="Analytics" subtitle="Track progress"
              gradient={['#4A90E2', '#2C69B3']}
              onPress={() => navigation.navigate('Analytics')}
            />
            <QuickAction
              emoji="🔮" title="Rank Predict" subtitle="Estimate your rank"
              gradient={['#9B59B6', '#7D3C98']}
              onPress={() => navigation.navigate('RankPredictor')}
            />
            <QuickAction
              emoji="🏆" title="Leaderboard" subtitle="vs. all India"
              gradient={['#F39C12', '#D68910']}
              onPress={() => navigation.navigate('Leaderboard')}
            />
          </View>

          {/* Revision Due */}
          <TouchableOpacity style={styles.revisionCard} onPress={() => navigation.navigate('Revision')}>
            <Text style={styles.revisionEmoji}>🔄</Text>
            <View>
              <Text style={styles.revisionTitle}>Revision Due</Text>
              <Text style={styles.revisionSub}>Review spaced repetition items</Text>
            </View>
            <Text style={styles.revisionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {padding: Spacing.xl, paddingBottom: Spacing.xxl},
  headerContent: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  greeting: {fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)'},
  userName: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white},
  examBadge: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2},
  notifBtn: {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.full, padding: Spacing.sm},
  streakRow: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg},
  streakBadge: {flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, gap: 4},
  streakFire: {fontSize: 14},
  streakText: {color: Colors.white, fontSize: FontSize.sm, fontWeight: '700'},
  xpBadge: {flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, gap: 4},
  xpStar: {fontSize: 14},
  xpText: {color: Colors.xpGold, fontSize: FontSize.sm, fontWeight: '700'},
  content: {padding: Spacing.lg, marginTop: -Spacing.xl},
  statsRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg},
  statCard: {flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', borderTopWidth: 3, ...Shadow.sm},
  statEmoji: {fontSize: 22, marginBottom: 4},
  statValue: {fontSize: FontSize.lg, fontWeight: '800'},
  statLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  planCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.md},
  planHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md},
  seeAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600'},
  topicRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  topicInfo: {flex: 1},
  topicName: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray800},
  topicMeta: {fontSize: FontSize.xs, color: Colors.gray500},
  quickActionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg},
  quickAction: {width: (width - Spacing.lg * 2 - Spacing.sm) / 2 - 1, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md},
  quickActionGradient: {padding: Spacing.lg, minHeight: 100, justifyContent: 'space-between'},
  quickActionEmoji: {fontSize: 28},
  quickActionTitle: {fontSize: FontSize.md, fontWeight: '800', color: Colors.white, marginTop: Spacing.sm},
  quickActionSubtitle: {fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)'},
  revisionCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.sm},
  revisionEmoji: {fontSize: 32},
  revisionTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  revisionSub: {fontSize: FontSize.sm, color: Colors.gray500},
  revisionArrow: {marginLeft: 'auto', fontSize: FontSize.xl, color: Colors.gray400},
});
