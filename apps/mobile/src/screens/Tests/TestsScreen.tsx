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
import {AppNavProp} from '@navigation/types';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

export default function TestsScreen() {
  const navigation = useNavigation<AppNavProp>();

  const {data: tests, isLoading} = useQuery({
    queryKey: ['tests'],
    queryFn: () => apiClient.get(ENDPOINTS.TESTS_LIST).then(r => r.data),
  });

  const generateFullTest = async () => {
    try {
      const res = await apiClient.post(ENDPOINTS.TESTS_GENERATE, {});
      navigation.navigate('TestStart', {testId: res.data.id});
    } catch {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mock Tests 📝</Text>
        <TouchableOpacity style={styles.generateBtn} onPress={generateFullTest}>
          <Text style={styles.generateBtnText}>+ Full Test</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tests?.tests || []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No tests yet. Generate your first full-length test!</Text>
          </View>
        }
        renderItem={({item}: {item: any}) => (
          <TouchableOpacity style={styles.testCard} onPress={() => navigation.navigate('TestStart', {testId: item.id})}>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle}>{item.title}</Text>
              <View style={[styles.testBadge, {backgroundColor: item.difficulty === 'hard' ? '#FFE8E8' : '#E8F5E9'}]}>
                <Text style={[styles.testBadgeText, {color: item.difficulty === 'hard' ? Colors.error : Colors.success}]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>
            <View style={styles.testMeta}>
              <Text style={styles.testMetaItem}>⏱ {item.duration}min</Text>
              <Text style={styles.testMetaItem}>❓ {item.totalQuestions}Q</Text>
              <Text style={styles.testMetaItem}>📊 {item.maxMarks}marks</Text>
            </View>
            {item.bestScore != null && (
              <Text style={styles.bestScore}>Best: {item.bestScore}/{item.maxMarks}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingBottom: Spacing.md},
  title: {fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.gray900},
  generateBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  generateBtnText: {color: Colors.white, fontWeight: '700', fontSize: FontSize.sm},
  list: {padding: Spacing.lg},
  testCard: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.md},
  testHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm},
  testTitle: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900, flex: 1},
  testBadge: {borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2},
  testBadgeText: {fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize'},
  testMeta: {flexDirection: 'row', gap: Spacing.md},
  testMetaItem: {fontSize: FontSize.sm, color: Colors.gray500},
  bestScore: {fontSize: FontSize.sm, color: Colors.success, fontWeight: '600', marginTop: Spacing.sm},
  empty: {alignItems: 'center', padding: Spacing.xxl},
  emptyEmoji: {fontSize: 64, marginBottom: Spacing.lg},
  emptyText: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center'},
});
