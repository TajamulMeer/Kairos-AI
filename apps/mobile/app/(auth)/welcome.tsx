import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, Spacing, BorderRadius } from '@constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={['#6C47FF', '#4D2FE0', '#2A0FAD']} style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>AIRIX</Text>
        <Text style={styles.logoSubtext}>AI</Text>
        <Text style={styles.tagline}>Built for Toppers.</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Text style={styles.heroText}>Your Personal{'\n'}AI NEET Mentor</Text>
        <Text style={styles.subHeroText}>
          Adaptive learning, rank prediction, and personalized revision — all powered by AI.
        </Text>
      </View>

      <View style={styles.featuresRow}>
        {[
          { icon: '🧠', label: 'AI Mentor' },
          { icon: '📊', label: 'Rank Predictor' },
          { icon: '🎯', label: 'Adaptive Tests' },
          { icon: '⚡', label: 'Smart Revision' },
        ].map((f) => (
          <View key={f.label} style={styles.featureChip}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.primaryButtonText}>Start Your NEET Journey</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>🇮🇳 Designed for India's NEET aspirants</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logoText: { fontSize: 52, fontWeight: '900', color: Colors.white, letterSpacing: 4 },
  logoSubtext: { fontSize: 28, fontWeight: '800', color: Colors.xpGold, marginTop: -12, letterSpacing: 8 },
  tagline: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' },
  illustrationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.md },
  heroText: { fontSize: 38, fontWeight: '800', color: Colors.white, textAlign: 'center', lineHeight: 46 },
  subHeroText: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.md, lineHeight: 24 },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  featureChip: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xl, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, flex: 1, marginHorizontal: 4 },
  featureIcon: { fontSize: 24 },
  featureLabel: { fontSize: FontSize.xs, color: Colors.white, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  buttonContainer: { gap: Spacing.md },
  primaryButton: { backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  primaryButtonText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '800' },
  secondaryButton: { paddingVertical: Spacing.md, alignItems: 'center' },
  secondaryButtonText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm },
  footerText: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: FontSize.xs, marginTop: Spacing.md },
});
