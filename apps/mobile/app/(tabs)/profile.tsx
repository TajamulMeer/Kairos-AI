import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { useAuthStore } from '@store/auth.store';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => apiClient.get(ENDPOINTS.GAMIFICATION_PROFILE).then(r => r.data),
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/welcome');
      }},
    ]);
  };

  const isPremium = user?.subscriptionTier !== 'free';

  const MENU_SECTIONS = [
    {
      title: 'Study',
      items: [
        { icon: '📊', label: 'Analytics & Performance', route: '/analytics' },
        { icon: '📅', label: 'Study Plan', route: '/study-plan' },
        { icon: '🃏', label: 'Flashcards', route: '/flashcards' },
        { icon: '🏆', label: 'Leaderboard', route: '/leaderboard' },
        { icon: '🎮', label: 'Achievements', route: '/achievements' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '✏️', label: 'Edit Profile', route: '/edit-profile' },
        { icon: '🔔', label: 'Notifications', route: '/notifications-settings' },
        { icon: '🌙', label: 'Appearance', route: '/appearance' },
        { icon: '🔒', label: 'Privacy & Security', route: '/privacy' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & FAQ', route: '/help' },
        { icon: '💬', label: 'Contact Support', route: '/support' },
        { icon: '⭐', label: 'Rate the App', route: '/rate' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {user?.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
            {isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>PRO</Text></View>}
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.userMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{user?.examTarget || 'NEET'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>Target {user?.targetYear}</Text>
            </View>
            {user?.classYear && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{user.classYear.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
              </View>
            )}
          </View>
        </View>

        {/* XP & Level */}
        {gamification && (
          <View style={[styles.xpCard, Shadow.md]}>
            <View style={styles.xpLeft}>
              <Text style={styles.xpLabel}>Level {gamification.level}</Text>
              <Text style={styles.xpValue}>{gamification.totalXp?.toLocaleString()} XP</Text>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${((gamification.xpToNextLevel - gamification.xpRequired) / gamification.xpRequired) * 100}%` }]} />
              </View>
              <Text style={styles.xpNext}>{gamification.xpToNextLevel} XP to Level {gamification.level + 1}</Text>
            </View>
            <View style={styles.xpRight}>
              <Text style={styles.streakCount}>🔥 {gamification.currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
        )}

        {/* Subscription Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => router.push('/subscription' as any)}
          >
            <Text style={styles.upgradeEmoji}>👑</Text>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtext}>Unlock AI Mentor, unlimited tests & more</Text>
            </View>
            <Text style={styles.upgradeArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={[styles.menuCard, Shadow.sm]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton, Shadow.sm]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AIRIX AI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatarEmoji: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, fontSize: 36, textAlign: 'center', lineHeight: 80, color: Colors.white, fontWeight: '800', overflow: 'hidden' },
  premiumBadge: { position: 'absolute', bottom: 0, right: -4, backgroundColor: Colors.xpGold, borderRadius: BorderRadius.full, paddingHorizontal: 6, paddingVertical: 2 },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.white },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900 },
  userEmail: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2, marginBottom: Spacing.md },
  userMeta: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.full, paddingVertical: 4, paddingHorizontal: Spacing.md },
  metaChipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  xpCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg, flexDirection: 'row', marginBottom: Spacing.lg },
  xpLeft: { flex: 1 },
  xpLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  xpValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white, marginTop: 2 },
  xpBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: Spacing.sm, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.xpGold, borderRadius: 3 },
  xpNext: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  xpRight: { alignItems: 'center', justifyContent: 'center' },
  streakCount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  streakLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  upgradeBanner: { backgroundColor: Colors.xpGold + '20', borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1.5, borderColor: Colors.xpGold },
  upgradeEmoji: { fontSize: 28 },
  upgradeInfo: { flex: 1 },
  upgradeTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900 },
  upgradeSubtext: { fontSize: FontSize.xs, color: Colors.gray600, marginTop: 2 },
  upgradeArrow: { fontSize: FontSize.base, color: Colors.gray700, fontWeight: '700' },
  menuSection: { marginBottom: Spacing.lg },
  menuSectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray500, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  menuItemIcon: { fontSize: 20, width: 28 },
  menuItemLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray900 },
  menuItemArrow: { fontSize: FontSize.xl, color: Colors.gray400 },
  logoutButton: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.error + '30' },
  logoutText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.error },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.gray400 },
});
