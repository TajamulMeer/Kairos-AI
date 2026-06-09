import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'national' | 'weekly'>('national');

  const {data, isLoading, refetch} = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn: () => apiClient.get(`${ENDPOINTS.LEADERBOARD_NATIONAL}?type=${tab}`).then(r => r.data),
  });

  const {data: myRank} = useQuery({
    queryKey: ['my-rank'],
    queryFn: () => apiClient.get(ENDPOINTS.LEADERBOARD_MY_RANK).then(r => r.data),
  });

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.heroHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard 🏆</Text>

        {myRank && (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankLabel}>Your Rank</Text>
            <Text style={styles.myRankValue}>#{myRank.rank?.toLocaleString()}</Text>
            <Text style={styles.myRankXP}>{myRank.xp} XP · {myRank.accuracy}% accuracy</Text>
          </View>
        )}

        <View style={styles.tabs}>
          {(['national', 'weekly'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'national' ? '🌍 National' : '📅 This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={data?.leaderboard || []}
          keyExtractor={(item: any) => item.userId}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
          contentContainerStyle={styles.list}
          renderItem={({item, index}: {item: any; index: number}) => (
            <View style={[styles.rankRow, item.isCurrentUser && styles.rankRowMe]}>
              <View style={[styles.rankBadge, index < 3 && {backgroundColor: podiumColors[index] + '30'}]}>
                <Text style={[styles.rankNum, index < 3 && {color: podiumColors[index]}]}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${item.rank}`}
                </Text>
              </View>
              <View style={styles.rankAvatar}>
                <Text style={{fontSize: 22}}>👤</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.fullName}</Text>
                <Text style={styles.rankMeta}>{item.examTarget} · {item.accuracy}% accuracy</Text>
              </View>
              <View style={styles.rankXP}>
                <Text style={styles.rankXPValue}>{item.xp?.toLocaleString()}</Text>
                <Text style={styles.rankXPLabel}>XP</Text>
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
  heroHeader: {padding: Spacing.xl, paddingBottom: Spacing.lg},
  back: {color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.md},
  title: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.white, marginBottom: Spacing.lg},
  myRankCard: {backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center'},
  myRankLabel: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)'},
  myRankValue: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.xpGold},
  myRankXP: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4},
  tabs: {flexDirection: 'row', gap: Spacing.sm},
  tab: {flex: 1, padding: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center'},
  tabActive: {backgroundColor: Colors.white},
  tabText: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600'},
  tabTextActive: {color: Colors.primary},
  list: {padding: Spacing.lg},
  rankRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md, ...Shadow.sm},
  rankRowMe: {borderWidth: 2, borderColor: Colors.primary},
  rankBadge: {width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.gray100},
  rankNum: {fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray700},
  rankAvatar: {width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center'},
  rankInfo: {flex: 1},
  rankName: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  rankMeta: {fontSize: FontSize.xs, color: Colors.gray400},
  rankXP: {alignItems: 'center'},
  rankXPValue: {fontSize: FontSize.md, fontWeight: '800', color: Colors.primary},
  rankXPLabel: {fontSize: FontSize.xs, color: Colors.gray400},
});
