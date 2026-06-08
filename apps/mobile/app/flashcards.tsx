import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReviewAt: string;
}

type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export default function FlashcardsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionMode, setSessionMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: dueCards, isLoading } = useQuery({
    queryKey: ['flashcards-due'],
    queryFn: () => apiClient.get(ENDPOINTS.FLASHCARDS_DUE).then(r => r.data),
  });

  const { mutate: reviewCard } = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: ReviewRating }) =>
      apiClient.post(ENDPOINTS.FLASHCARDS_REVIEW.replace(':id', id), { rating }).then(r => r.data),
    onSuccess: () => {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    },
  });

  const cards: Flashcard[] = dueCards?.cards || [];
  const currentCard = cards[currentIndex];
  const isDone = currentIndex >= cards.length;

  const RATINGS: { rating: ReviewRating; label: string; color: string }[] = [
    { rating: 'again', label: 'Again', color: Colors.error },
    { rating: 'hard', label: 'Hard', color: Colors.warning },
    { rating: 'good', label: 'Good', color: Colors.success },
    { rating: 'easy', label: 'Easy', color: Colors.accent },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flashcards</Text>
        <Text style={styles.progress}>{Math.min(currentIndex, cards.length)}/{cards.length}</Text>
      </View>

      {!sessionMode ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.dueInfo}>
            <Text style={styles.dueEmoji}>🃏</Text>
            <Text style={styles.dueCount}>{cards.length} cards due</Text>
            <Text style={styles.dueSubtext}>Based on spaced repetition algorithm</Text>
          </View>

          <TouchableOpacity
            style={[styles.startButton, cards.length === 0 && styles.startButtonDisabled]}
            onPress={() => cards.length > 0 && setSessionMode(true)}
            disabled={cards.length === 0}
          >
            <Text style={styles.startButtonText}>
              {cards.length > 0 ? `Start Review Session 🚀` : 'No cards due today! ✅'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => router.push('/generate-flashcards' as any)}
          >
            <Text style={styles.generateButtonText}>🤖 Generate AI Flashcards</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : isDone ? (
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Session Complete!</Text>
          <Text style={styles.doneSubtext}>You reviewed {cards.length} flashcards. Great job!</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => { setSessionMode(false); setCurrentIndex(0); }}>
            <Text style={styles.doneButtonText}>Back to Flashcards</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sessionContainer}>
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentIndex / cards.length) * 100}%` }]} />
          </View>

          <Text style={styles.subjectTag}>{currentCard.subject} • {currentCard.chapter}</Text>

          {/* Card */}
          <TouchableOpacity
            style={[styles.card, Shadow.lg]}
            onPress={() => setIsFlipped(!isFlipped)}
            activeOpacity={0.9}
          >
            <Text style={styles.cardSide}>{isFlipped ? 'ANSWER' : 'QUESTION'}</Text>
            <Text style={styles.cardText}>{isFlipped ? currentCard.back : currentCard.front}</Text>
            {!isFlipped && <Text style={styles.tapHint}>Tap to reveal answer</Text>}
          </TouchableOpacity>

          {/* Rating Buttons */}
          {isFlipped && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>How well did you know this?</Text>
              <View style={styles.ratingButtons}>
                {RATINGS.map((r) => (
                  <TouchableOpacity
                    key={r.rating}
                    style={[styles.ratingButton, { borderColor: r.color }]}
                    onPress={() => reviewCard({ id: currentCard.id, rating: r.rating })}
                  >
                    <Text style={[styles.ratingButtonText, { color: r.color }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  progress: { fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '600', width: 60, textAlign: 'right' },
  content: { padding: Spacing.lg, flex: 1, alignItems: 'center', justifyContent: 'center' },
  dueInfo: { alignItems: 'center', marginBottom: Spacing.xl },
  dueEmoji: { fontSize: 64, marginBottom: Spacing.md },
  dueCount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900 },
  dueSubtext: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: Spacing.xs },
  startButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md, ...Shadow.primary },
  startButtonDisabled: { backgroundColor: Colors.success },
  startButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  generateButton: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 16, paddingHorizontal: Spacing.xxl },
  generateButtonText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '700' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  doneEmoji: { fontSize: 72, marginBottom: Spacing.lg },
  doneTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  doneSubtext: { fontSize: FontSize.sm, color: Colors.gray600, textAlign: 'center', marginBottom: Spacing.xl },
  doneButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 16, paddingHorizontal: Spacing.xxl, ...Shadow.primary },
  doneButtonText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.base },
  sessionContainer: { flex: 1, padding: Spacing.lg },
  progressBar: { height: 6, backgroundColor: Colors.gray200, borderRadius: 3, marginBottom: Spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  subjectTag: { fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.xl, flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  cardSide: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  cardText: { fontSize: FontSize.lg, color: Colors.gray900, fontWeight: '600', textAlign: 'center', lineHeight: 28 },
  tapHint: { fontSize: FontSize.xs, color: Colors.gray400, marginTop: Spacing.lg },
  ratingContainer: { paddingBottom: Spacing.md },
  ratingLabel: { fontSize: FontSize.sm, color: Colors.gray600, textAlign: 'center', marginBottom: Spacing.md, fontWeight: '600' },
  ratingButtons: { flexDirection: 'row', gap: Spacing.sm },
  ratingButton: { flex: 1, borderWidth: 2, borderRadius: BorderRadius.xl, paddingVertical: 14, alignItems: 'center' },
  ratingButtonText: { fontSize: FontSize.sm, fontWeight: '800' },
});
