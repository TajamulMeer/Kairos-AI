import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';
import { useAuthStore } from '@store/auth.store';

const TABS = ['National', 'State', 'Friends'];

export default function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState('National');
  const { user } = useAuthStore();

  const endpoint = selectedTab === 'National'
    ? ENDPOINTS.LEADERBOARD_NATIONAL
    : selectedTab === 'State'
    ? ENDPOINTS.LEADERBOARD_STATE
    : ENDPOINTS.LEADERBOARD_FRIENDS;

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedTab],
    queryFn: () => apiClient.get(endpoint).then(r => r.data),
  });

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const entries = data?.entries || [];
  const myRank = data?.myRank;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* My Rank Banner */}
      {myRank && (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <Text style={styles.myRankValue}>{getRankEmoji(myRank.rank)}</Text>
          <Text style={styles.myRankXp}>{myRank.weeklyXp?.toLocaleString()} XP this week</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {entries.map((entry: any, idx: number) => {
            const isMe = entry.userId === user?.id;
            return (
              <View
                key={entry.userId}
                style={[styles.entryCard, isMe && styles.entryCardMe, idx < 3 && styles.entryCardTop, Shadow.sm]}
              >
                <Text style={[styles.entryRank, idx < 3 && styles.entryRankTop]}>
                  {getRankEmoji(idx + 1)}
                </Text>
                <View style={styles.entryAvatar}>
                  <Text style={styles.entryAvatarText}>{entry.fullName?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryName, isMe && styles.entryNameMe]}>
                    {entry.fullName} {isMe ? '(You)' : ''}
                  </Text>
                  <Text style={styles.entryMeta}>{entry.state} • {entry.classYear?.replace('_', ' ')}</Text>
                </View>
                <View style={styles.entryXp}>
                  <Text style={styles.entryXpValue}>{entry.weeklyXp?.toLocaleString()}</Text>
                  <Text style={styles.entryXpLabel}>XP</Text>
                </View>
              </View>
            );
          })}

          {entries.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={styles.emptyText}>No entries yet.</Text>
              {selectedTab === 'Friends' && (
                <Text style={styles.emptySubtext}>Invite friends to compete with them!</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  myRankBanner: { backgroundColor: Colors.primary, padding: Spacing.md, alignItems: 'center' },
  myRankLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  myRankValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white, marginVertical: 4 },
  myRankXp: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray500 },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  entryCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  entryCardMe: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.primary + '05' },
  entryCardTop: { backgroundColor: Colors.white },
  entryRank: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray700, width: 32, textAlign: 'center' },
  entryRankTop: { fontSize: 24 },
  entryAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  entryAvatarText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.base },
  entryInfo: { flex: 1 },
  entryName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  entryNameMe: { color: Colors.primary },
  entryMeta: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  entryXp: { alignItems: 'flex-end' },
  entryXpValue: { fontSize: FontSize.base, fontWeight: '800', color: Colors.xpGold },
  entryXpLabel: { fontSize: FontSize.xs, color: Colors.gray500 },
  emptyState: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.gray400, textAlign: 'center', marginTop: Spacing.sm },
});
