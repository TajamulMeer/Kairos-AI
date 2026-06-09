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
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import {formatDistanceToNow} from 'date-fns';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const TYPE_EMOJI: Record<string, string> = {
  achievement: '🏆',
  study_reminder: '📚',
  streak: '🔥',
  test_result: '📝',
  rank_update: '📊',
  system: '🔔',
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get(ENDPOINTS.NOTIFICATIONS).then(r => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['notifications']}),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.put(`${ENDPOINTS.NOTIFICATIONS}/read-all`),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['notifications']}),
  });

  const notifications: Notification[] = data?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => !item.read && markReadMutation.mutate(item.id)}>
              <Text style={styles.notifEmoji}>{TYPE_EMOJI[item.type] || '🔔'}</Text>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifTime}>
                  {formatDistanceToNow(new Date(item.createdAt), {addSuffix: true})}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
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
  markAll: {color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600'},
  list: {padding: Spacing.md},
  notifCard: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.md, ...Shadow.sm},
  notifCardUnread: {backgroundColor: '#F5F3FF', borderLeftWidth: 3, borderLeftColor: Colors.primary},
  notifEmoji: {fontSize: 28},
  notifInfo: {flex: 1},
  notifTitle: {fontSize: FontSize.md, fontWeight: '600', color: Colors.gray800},
  notifTitleUnread: {fontWeight: '800', color: Colors.gray900},
  notifBody: {fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2, lineHeight: 20},
  notifTime: {fontSize: FontSize.xs, color: Colors.gray400, marginTop: 4},
  unreadDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6},
  empty: {alignItems: 'center', padding: Spacing.xxl},
  emptyEmoji: {fontSize: 56, marginBottom: Spacing.lg},
  emptyText: {fontSize: FontSize.md, color: Colors.gray400},
});
