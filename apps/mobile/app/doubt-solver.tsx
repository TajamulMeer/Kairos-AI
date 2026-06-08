import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

interface Solution {
  explanation: string;
  steps: string[];
  relatedConcepts: string[];
  difficulty: string;
  estimatedTime: number;
}

export default function DoubtSolverScreen() {
  const [question, setQuestion] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [subject, setSubject] = useState('');

  const SUBJECTS = ['Biology', 'Physics', 'Chemistry'];

  const { mutate: solveDoubt, isPending } = useMutation({
    mutationFn: (data: { question: string; subject?: string; imageBase64?: string }) =>
      apiClient.post(ENDPOINTS.AI_DOUBT_SOLVE, data).then(r => r.data),
    onSuccess: (data) => setSolution(data),
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to solve doubt. Try again.'),
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to scan questions.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSolve = () => {
    if (!question.trim() && !imageUri) {
      Alert.alert('Input needed', 'Please type a question or upload an image.');
      return;
    }
    solveDoubt({ question: question.trim(), subject: subject || undefined });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Doubt Solver</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Subject Select */}
        <Text style={styles.label}>Subject (optional)</Text>
        <View style={styles.subjectRow}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.subjectChip, subject === s && styles.subjectChipActive]}
              onPress={() => setSubject(subject === s ? '' : s)}
            >
              <Text style={[styles.subjectChipText, subject === s && styles.subjectChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Question Input */}
        <Text style={styles.label}>Type your question</Text>
        <TextInput
          style={styles.questionInput}
          placeholder="e.g. What is the role of mitochondria in cellular respiration?"
          value={question}
          onChangeText={setQuestion}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />

        {/* Image Upload */}
        <Text style={styles.label}>Or upload an image</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={handleCamera}>
            <Text style={styles.imageButtonIcon}>📷</Text>
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
            <Text style={styles.imageButtonIcon}>🖼️</Text>
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImageUri(null)}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Solve Button */}
        <TouchableOpacity
          style={[styles.solveButton, isPending && styles.solveButtonDisabled]}
          onPress={handleSolve}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.solvingRow}>
              <ActivityIndicator color={Colors.white} />
              <Text style={styles.solveButtonText}>AI is solving...</Text>
            </View>
          ) : (
            <Text style={styles.solveButtonText}>🧠 Solve with AI</Text>
          )}
        </TouchableOpacity>

        {/* Solution Display */}
        {solution && (
          <View style={[styles.solutionCard, Shadow.md]}>
            <View style={styles.solutionHeader}>
              <Text style={styles.solutionTitle}>✅ Solution</Text>
              <View style={styles.solutionMeta}>
                <Text style={styles.solutionMetaText}>{solution.difficulty}</Text>
                <Text style={styles.solutionMetaText}>~{solution.estimatedTime} min</Text>
              </View>
            </View>

            <Text style={styles.solutionText}>{solution.explanation}</Text>

            {solution.steps?.length > 0 && (
              <View style={styles.stepsSection}>
                <Text style={styles.stepsSectionTitle}>Step-by-Step:</Text>
                {solution.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {solution.relatedConcepts?.length > 0 && (
              <View style={styles.conceptsSection}>
                <Text style={styles.conceptsSectionTitle}>Related Concepts:</Text>
                <View style={styles.conceptsRow}>
                  {solution.relatedConcepts.map((concept, idx) => (
                    <View key={idx} style={styles.conceptChip}>
                      <Text style={styles.conceptChipText}>{concept}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
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
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray700, marginBottom: Spacing.sm, marginTop: Spacing.md },
  subjectRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  subjectChip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.gray300, backgroundColor: Colors.white },
  subjectChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  subjectChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  subjectChipTextActive: { color: Colors.white },
  questionInput: { borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.gray900, backgroundColor: Colors.white, minHeight: 120, marginBottom: Spacing.md },
  imageButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  imageButton: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.gray300, gap: Spacing.xs },
  imageButtonIcon: { fontSize: 28 },
  imageButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray700 },
  imagePreviewContainer: { position: 'relative', marginBottom: Spacing.md },
  imagePreview: { width: '100%', height: 200, borderRadius: BorderRadius.xl },
  removeImage: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: Colors.white, fontWeight: '700' },
  solveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, ...Shadow.primary },
  solveButtonDisabled: { backgroundColor: Colors.primaryLight },
  solvingRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  solveButtonText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '800' },
  solutionCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  solutionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  solutionTitle: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900 },
  solutionMeta: { flexDirection: 'row', gap: Spacing.sm },
  solutionMetaText: { fontSize: FontSize.xs, color: Colors.gray500, backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  solutionText: { fontSize: FontSize.sm, color: Colors.gray800, lineHeight: 22, marginBottom: Spacing.lg },
  stepsSection: { marginBottom: Spacing.lg },
  stepsSectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.md },
  stepItem: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '800' },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.gray700, lineHeight: 20 },
  conceptsSection: {},
  conceptsSectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gray900, marginBottom: Spacing.sm },
  conceptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  conceptChip: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.full, paddingVertical: 4, paddingHorizontal: Spacing.md },
  conceptChipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
});
