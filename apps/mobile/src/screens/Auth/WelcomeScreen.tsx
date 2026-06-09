import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {AuthNavProp} from '@navigation/types';
import {Colors, FontSize, Spacing, BorderRadius} from '@constants/theme';

const {width, height} = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthNavProp>();

  return (
    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🧠</Text>
        <Text style={styles.title}>AIRIX AI</Text>
        <Text style={styles.subtitle}>Your AI-Powered NEET & JEE Mentor</Text>
        <Text style={styles.tagline}>Personalised · Adaptive · Intelligent</Text>
      </View>

      <View style={styles.features}>
        {['🎯 Adaptive Practice Tests', '🤖 24/7 AI Doubt Solver', '📊 Rank Predictor', '🏆 Gamified Learning'].map(f => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.primaryBtnText}>Get Started Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'space-between', padding: Spacing.xl},
  hero: {alignItems: 'center', marginTop: height * 0.08},
  logo: {fontSize: 72, marginBottom: Spacing.md},
  title: {fontSize: 42, fontWeight: '900', color: Colors.white, letterSpacing: 2},
  subtitle: {fontSize: FontSize.lg, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.sm, textAlign: 'center'},
  tagline: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: Spacing.xs, letterSpacing: 1},
  features: {gap: Spacing.sm},
  featureRow: {backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: BorderRadius.lg, padding: Spacing.md},
  featureText: {color: Colors.white, fontSize: FontSize.md, fontWeight: '500'},
  buttons: {gap: Spacing.sm, marginBottom: Spacing.lg},
  primaryBtn: {backgroundColor: Colors.white, borderRadius: BorderRadius.xxl, padding: Spacing.md, alignItems: 'center'},
  primaryBtnText: {color: Colors.primary, fontSize: FontSize.base, fontWeight: '700'},
  secondaryBtn: {borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', borderRadius: BorderRadius.xxl, padding: Spacing.md, alignItems: 'center'},
  secondaryBtnText: {color: Colors.white, fontSize: FontSize.base, fontWeight: '600'},
});
