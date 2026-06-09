import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/auth.store';
import { apiClient } from '@/src/services/api.service';
import { ENDPOINTS } from '@/src/constants/api';

const TIER_CONFIG = {
  free: { label: 'Free', color: Colors.gray500, emoji: '🎯' },
  premium: { label: 'Premium', color: Colors.primary, emoji: '⭐' },
  premium_plus: { label: 'Premium+', color: Colors.xpGold, emoji: '👑' },
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const tier = TIER_CONFIG[user?.subscriptionTier || 'free'];

  const { data: gamification } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => apiClient.get('/gamification/profile').then(r => r.data),
  });

  const { data: rank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => apiClient.get('/leaderboard/my-rank').then(r => r.data),
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const MENU_ITEMS = [
    { icon: '✏️', label: 'Edit Profile', onPress: () => router.push('/edit-profile' as any) },
    { icon: '💳', label: 'Subscription', onPress: () => router.push('/subscription' as any) },
    { icon: '🏆', label: 'Achievements', onPress: () => router.push('/achievements' as any) },
    { icon: '📊', label: 'Analytics', onPress: () => router.push('/analytics' as any) },
    { icon: '📈', label: 'Rank Predictor', onPress: () => router.push('/rank-predictor' as any) },
    { icon: '🔔', label: 'Notifications', onPress: () => {} },
    { icon: '🌐', label: 'Language', onPress: () => {} },
    { icon: '🔒', label: 'Privacy & Security', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadow.md]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.tierBadge, { backgroundColor: tier.color + '20' }]}>
            <Text style={styles.tierEmoji}>{tier.emoji}</Text>
            <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
          </View>

          {user?.subscriptionTier === 'free' && (
            <TouchableOpacity style={styles.upgradeBanner} onPress={() => router.push('/subscription' as any)}>
              <Text style={styles.upgradeText}>⚡ Upgrade to Premium — Unlock AI Mentor & More</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Level', value: gamification?.level || 1, emoji: '⚡' },
            { label: 'XP', value: (gamification?.totalXp || 0).toLocaleString(), emoji: '⭐' },
            { label: 'Streak', value: `${gamification?.currentStreak || 0}d`, emoji: '🔥' },
            { label: 'Rank', value: rank?.rank ? `#${rank.rank.toLocaleString()}` : 'N/A', emoji: '🏆' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statItem, Shadow.sm]}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Level Progress */}
        {gamification && (
          <View style={[styles.levelCard, Shadow.sm]}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelName}>{gamification.levelName}</Text>
              <Text style={styles.levelXp}>{gamification.xpToNextLevel} XP to next level</Text>
            </View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${gamification.levelProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity key={item.label} style={[styles.menuItem, Shadow.sm]} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AIRIX AI v1.0.0 • Built for India's Toppers</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileCard: { margin: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.xl, alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900 },
  email: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 4 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  tierEmoji: { fontSize: 14 },
  tierLabel: { fontSize: FontSize.sm, fontWeight: '700' },
  upgradeBanner: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  upgradeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  statItem: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center' },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900 },
  statLabel: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  levelCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  levelName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  levelXp: { fontSize: FontSize.xs, color: Colors.gray500 },
  levelBar: { height: 8, backgroundColor: Colors.gray200, borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  menuSection: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  menuItem: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: { fontSize: 22, width: 32 },
  menuLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray800 },
  menuArrow: { fontSize: FontSize.xl, color: Colors.gray400 },
  logoutButton: { marginHorizontal: Spacing.lg, borderWidth: 1.5, borderColor: Colors.error, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: FontSize.base },
  version: { textAlign: 'center', color: Colors.gray400, fontSize: FontSize.xs, marginBottom: Spacing.xxl },
});
