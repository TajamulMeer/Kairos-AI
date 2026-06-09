import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

interface RevisionItem {
  id: string;
  topic: string;
  subject: string;
  dueDate: string;
  intervalDays: number;
  easeFactor: number;
  type: 'flashcard' | 'concept' | 'formula';
}

export default function RevisionScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ['revision-due'],
    queryFn: () => apiClient.get(ENDPOINTS.REVISION_DUE).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({itemId, quality}: {itemId: string; quality: 0|1|2|3|4|5}) =>
      apiClient.post(`/revision/${itemId}/review`, {quality}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['revision-due']});
    },
  });

  const items: RevisionItem[] = data?.items || [];
  const overdue = items.filter(i => new Date(i.dueDate) <= new Date());

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Revision 🔄</Text>
        <Text style={styles.badge}>{overdue.length} due</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Summary */}
          <View style={styles.summaryRow}>
            {[
              {emoji: '🔴', label: 'Overdue', value: overdue.length, color: Colors.error},
              {emoji: '📅', label: 'Today', value: items.length, color: Colors.primary},
              {emoji: '✅', label: 'Done', value: data?.reviewedToday || 0, color: Colors.success},
            ].map(s => (
              <View key={s.label} style={[styles.statCard, {borderTopColor: s.color}]}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>No revision items due. Come back later.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Due for Review</Text>
              {items.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={[styles.subjectDot, {backgroundColor: item.subject === 'Physics' ? Colors.physics : item.subject === 'Chemistry' ? Colors.chemistry : Colors.biology}]} />
                    <Text style={styles.itemSubject}>{item.subject}</Text>
                    <View style={[styles.typeBadge, {backgroundColor: item.type === 'formula' ? '#FFF3E0' : '#E8F5E9'}]}>
                      <Text style={[styles.typeText, {color: item.type === 'formula' ? Colors.warning : Colors.success}]}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemTopic}>{item.topic}</Text>
                  <Text style={styles.itemDue}>
                    {new Date(item.dueDate) <= new Date() ? '🔴 Overdue' : `📅 Due ${new Date(item.dueDate).toLocaleDateString()}`}
                  </Text>

                  <View style={styles.ratingRow}>
                    {([
                      {q: 0, label: '😓 Forgot', color: Colors.error},
                      {q: 3, label: '🙂 OK', color: Colors.warning},
                      {q: 4, label: '😊 Good', color: Colors.info},
                      {q: 5, label: '🎯 Perfect', color: Colors.success},
                    ] as {q: 0|1|2|3|4|5; label: string; color: string}[]).map(({q, label, color}) => (
                      <TouchableOpacity
                        key={q}
                        style={[styles.ratingBtn, {borderColor: color}]}
                        onPress={() => reviewMutation.mutate({itemId: item.id, quality: q})}>
                        <Text style={[styles.ratingText, {color}]}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
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
  badge: {backgroundColor: Colors.error + '20', color: Colors.error, fontSize: FontSize.sm, fontWeight: '700', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full},
  content: {padding: Spacing.lg, gap: Spacing.lg},
  summaryRow: {flexDirection: 'row', gap: Spacing.sm},
  statCard: {flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', borderTopWidth: 3, ...Shadow.sm},
  statEmoji: {fontSize: 20},
  statValue: {fontSize: FontSize.xl, fontWeight: '800'},
  statLabel: {fontSize: FontSize.xs, color: Colors.gray500},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray800},
  itemCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm},
  itemHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  subjectDot: {width: 10, height: 10, borderRadius: 5},
  itemSubject: {fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray600, flex: 1},
  typeBadge: {borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2},
  typeText: {fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize'},
  itemTopic: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  itemDue: {fontSize: FontSize.xs, color: Colors.gray400},
  ratingRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  ratingBtn: {borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4},
  ratingText: {fontSize: FontSize.xs, fontWeight: '600'},
  emptyCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xxl, alignItems: 'center', ...Shadow.sm},
  emptyEmoji: {fontSize: 56, marginBottom: Spacing.md},
  emptyTitle: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray900},
  emptySub: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center', marginTop: Spacing.sm},
});
