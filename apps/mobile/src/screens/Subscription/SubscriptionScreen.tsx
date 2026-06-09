import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useQuery, useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {useAuthStore} from '@store/auth.store';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Toast from 'react-native-toast-message';

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    '10 questions/day',
    'Basic AI doubt solving',
    'Limited flashcards',
    'Basic analytics',
  ],
  premium: [
    'Unlimited questions',
    'Full AI doubt solver',
    'Unlimited flashcards',
    'Advanced analytics',
    'Full mock tests',
    'AI study plan',
    'Rank predictor',
    'Priority support',
  ],
  premium_plus: [
    'Everything in Premium',
    '1-on-1 AI mentor sessions',
    'Personalized video explanations',
    'Custom study materials',
    'College counselling AI',
    'Parent progress reports',
  ],
};

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const {user, updateUser} = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const {data: plans, isLoading} = useQuery({
    queryKey: ['payment-plans'],
    queryFn: () => apiClient.get(ENDPOINTS.PAYMENTS_PLANS).then(r => r.data),
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const order = await apiClient.post(ENDPOINTS.PAYMENTS_CREATE_ORDER, {planId});
      // In production, integrate Razorpay here
      return order.data;
    },
    onSuccess: (data) => {
      Toast.show({type: 'success', text1: 'Subscription activated! 🎉'});
      updateUser({subscriptionTier: selectedPlan as any});
      navigation.goBack();
    },
    onError: () => Toast.show({type: 'error', text1: 'Payment failed. Please try again.'}),
  });

  const PLANS = plans?.plans || [
    {id: 'premium_monthly', name: 'Premium', tier: 'premium', price: 499, period: '/month', originalPrice: 999, savings: '50%'},
    {id: 'premium_yearly', name: 'Premium', tier: 'premium', price: 3999, period: '/year', originalPrice: 11988, savings: '67%'},
    {id: 'premium_plus', name: 'Premium+', tier: 'premium_plus', price: 799, period: '/month', originalPrice: 1499, savings: '47%'},
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upgrade Plan 👑</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSub}>Join 1 lakh+ NEET/JEE aspirants on AIRIX AI Premium</Text>
        </LinearGradient>

        {/* Plan selector */}
        <View style={styles.planSelector}>
          {(['free', 'premium', 'premium_plus'] as const).map(tier => (
            <TouchableOpacity
              key={tier}
              style={[styles.tierTab, selectedPlan === tier && styles.tierTabActive]}
              onPress={() => setSelectedPlan(tier)}>
              <Text style={[styles.tierTabText, selectedPlan === tier && styles.tierTabTextActive]}>
                {tier === 'free' ? 'Free' : tier === 'premium' ? 'Premium' : 'Premium+'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>
            {selectedPlan === 'free' ? '🆓 Free Plan' : selectedPlan === 'premium' ? '⭐ Premium' : '👑 Premium+'}
          </Text>
          {(PLAN_FEATURES[selectedPlan] || []).map(feature => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Pricing cards */}
        {selectedPlan !== 'free' && (
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {PLANS.filter((p: any) => p.tier === selectedPlan).map((plan: any) => (
              <TouchableOpacity
                key={plan.id}
                style={[styles.priceCard, user?.subscriptionTier === plan.tier && styles.priceCardActive]}
                onPress={() => subscribeMutation.mutate(plan.id)}
                disabled={subscribeMutation.isPending || user?.subscriptionTier === plan.tier}>
                <View>
                  <Text style={styles.planName}>{plan.name} {plan.period}</Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>Save {plan.savings}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceRight}>
                  {plan.originalPrice && (
                    <Text style={styles.originalPrice}>₹{plan.originalPrice}</Text>
                  )}
                  <Text style={styles.price}>₹{plan.price}</Text>
                  {user?.subscriptionTier === plan.tier ? (
                    <Text style={styles.activeBadge}>Active</Text>
                  ) : subscribeMutation.isPending ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.buyText}>Subscribe →</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Secure payments via Razorpay. Cancel anytime. No hidden charges.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  content: {gap: Spacing.lg, paddingBottom: Spacing.xxl},
  heroBanner: {padding: Spacing.xxl, alignItems: 'center'},
  heroEmoji: {fontSize: 56, marginBottom: Spacing.md},
  heroTitle: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white, textAlign: 'center'},
  heroSub: {fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.sm},
  planSelector: {flexDirection: 'row', marginHorizontal: Spacing.lg, backgroundColor: Colors.gray100, borderRadius: BorderRadius.xl, padding: 4},
  tierTab: {flex: 1, padding: Spacing.sm, borderRadius: BorderRadius.lg, alignItems: 'center'},
  tierTabActive: {backgroundColor: Colors.white, ...Shadow.sm},
  tierTabText: {fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '600'},
  tierTabTextActive: {color: Colors.primary},
  featuresCard: {marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.sm, ...Shadow.sm},
  featuresTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.sm},
  featureRow: {flexDirection: 'row', gap: Spacing.sm, alignItems: 'center'},
  checkMark: {fontSize: 16},
  featureText: {fontSize: FontSize.md, color: Colors.gray700},
  pricingSection: {marginHorizontal: Spacing.lg},
  sectionTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray800, marginBottom: Spacing.md},
  priceCard: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 2, borderColor: Colors.gray200, ...Shadow.sm},
  priceCardActive: {borderColor: Colors.primary},
  planName: {fontSize: FontSize.md, fontWeight: '700', color: Colors.gray900},
  savingsBadge: {backgroundColor: '#E8F5E9', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start'},
  savingsText: {fontSize: FontSize.xs, color: Colors.success, fontWeight: '700'},
  priceRight: {alignItems: 'flex-end'},
  originalPrice: {fontSize: FontSize.sm, color: Colors.gray400, textDecorationLine: 'line-through'},
  price: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary},
  activeBadge: {fontSize: FontSize.xs, color: Colors.success, fontWeight: '700'},
  buyText: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700'},
  disclaimer: {fontSize: FontSize.xs, color: Colors.gray400, textAlign: 'center', marginHorizontal: Spacing.xl},
});
