import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

export default function AchievementsScreen() {
  const { data } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiClient.get(ENDPOINTS.GAMIFICATION_ACHIEVEMENTS).then(r => r.data),
  });

  const achievements = data?.achievements || [];
  const unlocked = achievements.filter((a: any) => a.unlockedAt);
  const locked = achievements.filter((a: any) => !a.unlockedAt);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.count}>{unlocked.length}/{achievements.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unlocked 🏆</Text>
            <View style={styles.grid}>
              {unlocked.map((achievement: any) => (
                <View key={achievement.id} style={[styles.achievementCard, Shadow.sm]}>
                  <Text style={styles.achievementEmoji}>{achievement.icon || '🏅'}</Text>
                  <Text style={styles.achievementName}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpBadgeText}>+{achievement.xpReward} XP</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Locked 🔒</Text>
            <View style={styles.grid}>
              {locked.map((achievement: any) => (
                <View key={achievement.id} style={[styles.achievementCard, styles.achievementCardLocked, Shadow.sm]}>
                  <Text style={[styles.achievementEmoji, styles.achievementEmojiLocked]}>🔒</Text>
                  <Text style={[styles.achievementName, styles.achievementNameLocked]}>{achievement.title}</Text>
                  <Text style={[styles.achievementDesc, styles.achievementDescLocked]}>{achievement.description}</Text>
                  <View style={[styles.xpBadge, styles.xpBadgeLocked]}>
                    <Text style={[styles.xpBadgeText, styles.xpBadgeTextLocked]}>+{achievement.xpReward} XP</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {achievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏅</Text>
            <Text style={styles.emptyText}>Complete study sessions and tests to earn achievements!</Text>
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
  count: { fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '600', width: 60, textAlign: 'right' },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md, marginTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  achievementCard: { width: '47%', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  achievementCardLocked: { backgroundColor: Colors.gray100 },
  achievementEmoji: { fontSize: 36, marginBottom: Spacing.xs },
  achievementEmojiLocked: { opacity: 0.4 },
  achievementName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900, textAlign: 'center' },
  achievementNameLocked: { color: Colors.gray400 },
  achievementDesc: { fontSize: FontSize.xs, color: Colors.gray600, textAlign: 'center', lineHeight: 16 },
  achievementDescLocked: { color: Colors.gray400 },
  xpBadge: { backgroundColor: Colors.xpGold + '30', borderRadius: BorderRadius.full, paddingVertical: 2, paddingHorizontal: Spacing.sm, marginTop: Spacing.xs },
  xpBadgeLocked: { backgroundColor: Colors.gray200 },
  xpBadgeText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.xpGold },
  xpBadgeTextLocked: { color: Colors.gray400 },
  emptyState: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center', lineHeight: 24 },
});
