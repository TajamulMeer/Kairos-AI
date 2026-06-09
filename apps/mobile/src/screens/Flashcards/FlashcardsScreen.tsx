import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
}

function FlashCard({card, onRate}: {card: Flashcard; onRate: (rating: 1|2|3|4|5) => void}) {
  const [flipped, setFlipped] = useState(false);
  const anim = new Animated.Value(0);

  const flip = () => {
    Animated.spring(anim, {toValue: flipped ? 0 : 1, useNativeDriver: true}).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = anim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});
  const backInterpolate = anim.interpolate({inputRange: [0, 1], outputRange: ['180deg', '360deg']});

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={flip} activeOpacity={0.9}>
        <Animated.View style={[styles.card, styles.cardFront, {transform: [{rotateY: frontInterpolate}], opacity: flipped ? 0 : 1}]}>
          <Text style={styles.cardSide}>Question</Text>
          <Text style={styles.cardText}>{card.front}</Text>
          <Text style={styles.tapHint}>Tap to reveal answer</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, {transform: [{rotateY: backInterpolate}], opacity: flipped ? 1 : 0, position: 'absolute', top: 0, left: 0, right: 0}]}>
          <Text style={[styles.cardSide, {color: Colors.accent}]}>Answer</Text>
          <Text style={styles.cardText}>{card.back}</Text>
        </Animated.View>
      </TouchableOpacity>

      {flipped && (
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>How well did you know this?</Text>
          <View style={styles.ratingBtns}>
            {([
              {r: 1, label: '😓 Again', color: Colors.error},
              {r: 2, label: '😐 Hard', color: Colors.warning},
              {r: 3, label: '🙂 Good', color: Colors.info},
              {r: 4, label: '😊 Easy', color: Colors.success},
            ] as {r: 1|2|3|4|5; label: string; color: string}[]).map(({r, label, color}) => (
              <TouchableOpacity
                key={r}
                style={[styles.ratingBtn, {borderColor: color}]}
                onPress={() => onRate(r)}>
                <Text style={[styles.ratingBtnText, {color}]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function FlashcardsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(0);

  const {data, isLoading} = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => apiClient.get(`${ENDPOINTS.FLASHCARDS}?limit=20`).then(r => r.data),
  });

  const rateMutation = useMutation({
    mutationFn: ({cardId, rating}: {cardId: string; rating: number}) =>
      apiClient.post(`${ENDPOINTS.FLASHCARDS}/${cardId}/review`, {rating}),
    onSuccess: () => {
      setDone(d => d + 1);
      if (data?.cards && idx < data.cards.length - 1) {
        setIdx(i => i + 1);
      }
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const cards: Flashcard[] = data?.cards || [];
  const finished = idx >= cards.length || cards.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flashcards 🃏</Text>
        <Text style={styles.counter}>{Math.min(idx + 1, cards.length)}/{cards.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: `${cards.length ? (done / cards.length) * 100 : 0}%`}]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {finished ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Session Complete!</Text>
            <Text style={styles.doneSub}>You reviewed {done} cards. Great work!</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={() => {setIdx(0); setDone(0); queryClient.invalidateQueries({queryKey: ['flashcards']}); }}>
              <Text style={styles.restartBtnText}>New Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlashCard
            card={cards[idx]}
            onRate={rating => rateMutation.mutate({cardId: cards[idx].id, rating})}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  counter: {fontSize: FontSize.md, color: Colors.gray500, fontWeight: '600'},
  progressBar: {height: 4, backgroundColor: Colors.gray200},
  progressFill: {height: '100%', backgroundColor: Colors.primary},
  content: {padding: Spacing.lg, flexGrow: 1},
  cardContainer: {gap: Spacing.lg},
  card: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xxl, minHeight: 240, justifyContent: 'center', alignItems: 'center', ...Shadow.lg},
  cardFront: {},
  cardBack: {backgroundColor: '#F0EEFF'},
  cardSide: {fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.lg},
  cardText: {fontSize: FontSize.lg, color: Colors.gray900, textAlign: 'center', lineHeight: 28, fontWeight: '500'},
  tapHint: {fontSize: FontSize.xs, color: Colors.gray400, marginTop: Spacing.xl},
  ratingRow: {backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.sm},
  ratingLabel: {fontSize: FontSize.sm, color: Colors.gray500, textAlign: 'center', marginBottom: Spacing.md},
  ratingBtns: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center'},
  ratingBtn: {borderWidth: 1.5, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  ratingBtnText: {fontSize: FontSize.sm, fontWeight: '600'},
  doneCard: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xxl, ...Shadow.md},
  doneEmoji: {fontSize: 72, marginBottom: Spacing.lg},
  doneTitle: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.gray900},
  doneSub: {fontSize: FontSize.md, color: Colors.gray500, textAlign: 'center', marginTop: Spacing.sm},
  restartBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, marginTop: Spacing.xl},
  restartBtnText: {color: Colors.white, fontWeight: '700', fontSize: FontSize.md},
});
