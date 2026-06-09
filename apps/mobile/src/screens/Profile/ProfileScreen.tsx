import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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

function MenuItem({emoji, title, subtitle, onPress, danger}: {
  emoji: string; title: string; subtitle?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={styles.menuInfo}>
        <Text style={[styles.menuTitle, danger && {color: Colors.error}]}>{title}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<AppNavProp>();
  const {user, logout} = useAuthStore();

  const {data: gamification} = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => apiClient.get(ENDPOINTS.GAMIFICATION_PROFILE).then(r => r.data),
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  const tierColor = user?.subscriptionTier === 'premium_plus'
    ? '#FFD700'
    : user?.subscriptionTier === 'premium'
    ? Colors.primary
    : Colors.gray500;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.hero}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={[styles.tierText, {color: tierColor}]}>
              {user?.subscriptionTier === 'premium_plus' ? '👑 Premium+' :
               user?.subscriptionTier === 'premium' ? '⭐ Premium' : '🆓 Free'}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            {emoji: '🔥', value: `${gamification?.streak || 0}`, label: 'Streak'},
            {emoji: '⭐', value: `${gamification?.xp || 0}`, label: 'XP'},
            {emoji: '🏆', value: `#${gamification?.nationalRank || '—'}`, label: 'Rank'},
            {emoji: '🎖', value: `${gamification?.level || 1}`, label: 'Level'},
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.content}>
          {/* Account */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="✏️" title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
            <MenuItem emoji="🎯" title="Exam Settings" subtitle={`${user?.examTarget} · ${user?.targetYear}`} onPress={() => navigation.navigate('EditProfile')} />
            <MenuItem emoji="🌐" title="Language" subtitle={user?.preferredLanguage?.toUpperCase()} onPress={() => {}} />
          </View>

          {/* Learning */}
          <Text style={styles.sectionTitle}>Learning</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="📊" title="Analytics" subtitle="Track your progress" onPress={() => navigation.navigate('Analytics')} />
            <MenuItem emoji="🏆" title="Achievements" subtitle={`${gamification?.achievements?.length || 0} unlocked`} onPress={() => navigation.navigate('Achievements')} />
            <MenuItem emoji="🔄" title="Revision" subtitle="Spaced repetition" onPress={() => navigation.navigate('Revision')} />
            <MenuItem emoji="🃏" title="Flashcards" onPress={() => navigation.navigate('Flashcards', {})} />
          </View>

          {/* Subscription */}
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.menuCard}>
            <MenuItem
              emoji="👑"
              title="Upgrade Plan"
              subtitle={user?.subscriptionTier === 'free' ? 'Unlock all features' : 'Manage subscription'}
              onPress={() => navigation.navigate('Subscription')}
            />
          </View>

          {/* Danger */}
          <View style={styles.menuCard}>
            <MenuItem emoji="🚪" title="Logout" onPress={handleLogout} danger />
          </View>

          <Text style={styles.version}>AIRIX AI v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  hero: {padding: Spacing.xl, alignItems: 'center', paddingBottom: Spacing.xxl},
  avatarContainer: {width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md},
  avatarEmoji: {fontSize: 40},
  name: {fontSize: FontSize.xl, fontWeight: '900', color: Colors.white},
  email: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  tierBadge: {backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginTop: Spacing.sm},
  tierText: {fontSize: FontSize.sm, fontWeight: '700'},
  statsRow: {flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm, marginTop: -Spacing.xl},
  statCard: {flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.sm, alignItems: 'center', ...Shadow.sm},
  statEmoji: {fontSize: 18},
  statValue: {fontSize: FontSize.md, fontWeight: '800', color: Colors.primary},
  statLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  content: {paddingHorizontal: Spacing.lg},
  sectionTitle: {fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg},
  menuCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.sm, ...Shadow.sm},
  menuItem: {flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: Spacing.md},
  menuEmoji: {fontSize: 22, width: 32, textAlign: 'center'},
  menuInfo: {flex: 1},
  menuTitle: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray900},
  menuSub: {fontSize: FontSize.xs, color: Colors.gray500, marginTop: 1},
  menuArrow: {color: Colors.gray400, fontSize: FontSize.md},
  version: {textAlign: 'center', color: Colors.gray400, fontSize: FontSize.xs, marginTop: Spacing.xl, marginBottom: Spacing.xxl},
});
