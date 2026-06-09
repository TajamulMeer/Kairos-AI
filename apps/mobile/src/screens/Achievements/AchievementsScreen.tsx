import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  xpReward: number;
  category: string;
}

export default function AchievementsScreen() {
  const navigation = useNavigation();

  const {data, isLoading} = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiClient.get(ENDPOINTS.GAMIFICATION_ACHIEVEMENTS).then(r => r.data),
  });

  const earned = (data?.achievements || []).filter((a: Achievement) => a.earnedAt);
  const unearned = (data?.achievements || []).filter((a: Achievement) => !a.earnedAt);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Achievements 🎖</Text>
        <Text style={styles.count}>{earned.length}/{(data?.achievements || []).length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={[...earned, ...unearned]}
          keyExtractor={(item: Achievement) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>🏆</Text>
              <Text style={styles.summaryValue}>{earned.length}</Text>
              <Text style={styles.summaryLabel}>Achievements Unlocked</Text>
              <Text style={styles.summaryXP}>+{earned.reduce((acc: number, a: Achievement) => acc + a.xpReward, 0)} XP earned</Text>
            </View>
          }
          renderItem={({item}: {item: Achievement}) => (
            <View style={[styles.achievementCard, !item.earnedAt && styles.achievementCardLocked]}>
              <Text style={[styles.achievementIcon, !item.earnedAt && styles.iconLocked]}>
                {item.earnedAt ? item.icon : '🔒'}
              </Text>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementTitle, !item.earnedAt && styles.textLocked]}>{item.title}</Text>
                <Text style={[styles.achievementDesc, !item.earnedAt && styles.textLocked]}>{item.description}</Text>
                {item.earnedAt && (
                  <Text style={styles.earnedDate}>Earned {new Date(item.earnedAt).toLocaleDateString()}</Text>
                )}
              </View>
              <View style={[styles.xpBadge, !item.earnedAt && styles.xpBadgeLocked]}>
                <Text style={[styles.xpText, !item.earnedAt && {color: Colors.gray400}]}>+{item.xpReward} XP</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  count: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700'},
  list: {padding: Spacing.lg, gap: Spacing.md},
  summaryCard: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg},
  summaryEmoji: {fontSize: 48, marginBottom: Spacing.sm},
  summaryValue: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.white},
  summaryLabel: {fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)'},
  summaryXP: {fontSize: FontSize.sm, color: Colors.xpGold, fontWeight: '700', marginTop: 4},
  achievementCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.sm},
  achievementCardLocked: {opacity: 0.55},
  achievementIcon: {fontSize: 36},
  iconLocked: {fontSize: 28},
  achievementInfo: {flex: 1},
  achievementTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  achievementDesc: {fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2},
  earnedDate: {fontSize: FontSize.xs, color: Colors.success, marginTop: 4, fontWeight: '500'},
  textLocked: {color: Colors.gray400},
  xpBadge: {backgroundColor: '#FFF9E6', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4},
  xpBadgeLocked: {backgroundColor: Colors.gray100},
  xpText: {fontSize: FontSize.xs, fontWeight: '700', color: Colors.xpGold},
});
