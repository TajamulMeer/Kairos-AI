import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';
import { useAuthStore } from '@store/auth.store';

const FEATURES = {
  free: [
    '10 questions/day',
    '2 tests/month',
    'Basic analytics',
    'Community forum',
  ],
  premium: [
    'Unlimited questions & tests',
    'AI Mentor (50 messages/day)',
    'Doubt Solver (10/day)',
    'Advanced analytics & rank predictor',
    'Personalized study plans',
    'Flashcards with spaced repetition',
    'Previous year papers (2019–2024)',
    'Leaderboard access',
    'Priority support',
  ],
  premium_plus: [
    'Everything in Premium',
    'Unlimited AI Mentor messages',
    'Unlimited doubt solving',
    '1-on-1 video mentor sessions',
    'Custom test creation',
    'Offline mode',
    'Performance report for parents',
    'Early access to new features',
  ],
};

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { user, updateUser } = useAuthStore();

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiClient.get(ENDPOINTS.PAYMENTS_PLANS).then(r => r.data),
  });

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: (tier: string) =>
      apiClient.post(ENDPOINTS.PAYMENTS_CREATE_ORDER, { tier, billing: selectedPlan }).then(r => r.data),
    onSuccess: (data) => {
      // In a real app, open Razorpay payment gateway here
      Alert.alert(
        'Payment',
        `Order created: ${data.orderId}. In production, this would open the Razorpay payment gateway.`,
        [{ text: 'OK' }]
      );
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to create order.'),
  });

  const currentTier = user?.subscriptionTier || 'free';

  const getPricing = (tier: string) => {
    if (!plans) return { monthly: '₹999', yearly: '₹7,999' };
    const plan = plans[tier];
    return {
      monthly: `₹${plan?.monthlyPrice || (tier === 'premium' ? 999 : 1499)}`,
      yearly: `₹${plan?.yearlyPrice || (tier === 'premium' ? 7999 : 11999)}`,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upgrade Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Billing Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.toggleOption, selectedPlan === 'monthly' && styles.toggleOptionActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.toggleText, selectedPlan === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, selectedPlan === 'yearly' && styles.toggleOptionActive]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <Text style={[styles.toggleText, selectedPlan === 'yearly' && styles.toggleTextActive]}>Yearly</Text>
            <View style={styles.savingsBadge}><Text style={styles.savingsBadgeText}>Save 33%</Text></View>
          </TouchableOpacity>
        </View>

        {/* Plan Cards */}
        {/* Premium */}
        <LinearGradient colors={['#6C47FF', '#4D2FE0']} style={[styles.planCard, styles.planCardPremium, Shadow.primary]}>
          <View style={styles.planHeader}>
            <Text style={styles.planEmoji}>⭐</Text>
            <View>
              <Text style={styles.planNameLight}>Premium</Text>
              <Text style={styles.planPriceLight}>
                {getPricing('premium')[selectedPlan]}
                <Text style={styles.planPricePeriod}>/{selectedPlan === 'monthly' ? 'mo' : 'yr'}</Text>
              </Text>
            </View>
            {currentTier === 'premium' && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Current</Text></View>}
          </View>
          <View style={styles.featuresList}>
            {FEATURES.premium.map((f, idx) => (
              <Text key={idx} style={styles.featureItemLight}>✓ {f}</Text>
            ))}
          </View>
          {currentTier !== 'premium' && currentTier !== 'premium_plus' && (
            <TouchableOpacity style={styles.subscribeButtonLight} onPress={() => createOrder('premium')} disabled={isPending}>
              {isPending ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.subscribeButtonLightText}>Get Premium</Text>}
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Premium Plus */}
        <View style={[styles.planCard, Shadow.md]}>
          <View style={styles.planHeader}>
            <Text style={styles.planEmoji}>👑</Text>
            <View>
              <Text style={styles.planName}>Premium+</Text>
              <Text style={styles.planPrice}>
                {getPricing('premium_plus')[selectedPlan]}
                <Text style={styles.planPricePeriodDark}>/{selectedPlan === 'monthly' ? 'mo' : 'yr'}</Text>
              </Text>
            </View>
            {currentTier === 'premium_plus' && <View style={styles.currentBadgeDark}><Text style={styles.currentBadgeText}>Current</Text></View>}
          </View>
          <View style={styles.featuresList}>
            {FEATURES.premium_plus.map((f, idx) => (
              <Text key={idx} style={styles.featureItem}>✓ {f}</Text>
            ))}
          </View>
          {currentTier !== 'premium_plus' && (
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => createOrder('premium_plus')}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.subscribeButtonText}>Get Premium+</Text>}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.disclaimer}>
          Secure payments via Razorpay. Cancel anytime. 7-day free trial available.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  billingToggle: { flexDirection: 'row', backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, padding: 4, marginBottom: Spacing.xl },
  toggleOption: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs },
  toggleOptionActive: { backgroundColor: Colors.white, ...Shadow.sm },
  toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray600 },
  toggleTextActive: { color: Colors.gray900, fontWeight: '800' },
  savingsBadge: { backgroundColor: Colors.success, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  savingsBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '800' },
  planCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.xl, marginBottom: Spacing.lg },
  planCardPremium: {},
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  planEmoji: { fontSize: 36 },
  planName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.gray900 },
  planNameLight: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  planPrice: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  planPriceLight: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  planPricePeriod: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '400' },
  planPricePeriodDark: { fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '400' },
  currentBadge: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  currentBadgeDark: { marginLeft: 'auto', backgroundColor: Colors.success + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, borderWidth: 1, borderColor: Colors.success },
  currentBadgeText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },
  featuresList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  featureItem: { fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 20 },
  featureItemLight: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  subscribeButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center', ...Shadow.primary },
  subscribeButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  subscribeButtonLight: { backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
  subscribeButtonLightText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '800' },
  disclaimer: { fontSize: FontSize.xs, color: Colors.gray400, textAlign: 'center', lineHeight: 18 },
});
