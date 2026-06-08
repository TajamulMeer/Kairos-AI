import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';
import { useAuthStore } from '@store/auth.store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_PROMPTS = [
  "What should I study today?",
  "I'm weak in Genetics. Help me.",
  "Create a 2-week revision plan for Biology",
  "Explain Newton's laws with examples",
  "What are my weak areas?",
  "Motivate me! I'm feeling low.",
];

export default function MentorScreen() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user?.fullName?.split(' ')[0]}! 👋 I'm your personal AI NEET Mentor. I know your study history, your weak areas, and your goals. How can I help you today?`,
      timestamp: new Date(),
      suggestions: QUICK_PROMPTS.slice(0, 3),
    },
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) =>
      apiClient.post(ENDPOINTS.AI_MENTOR_CHAT, {
        message,
        conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      }).then(r => r.data),
    onSuccess: (data) => {
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    sendMessage(messageText);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
      {item.role === 'assistant' && <Text style={styles.mentorAvatar}>🧠</Text>}
      <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, item.role === 'user' ? styles.userText : styles.assistantText]}>
          {item.content}
        </Text>
        {item.suggestions && (
          <View style={styles.suggestions}>
            {item.suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.mentorInfo}>
          <View style={styles.mentorAvatarLarge}>
            <Text style={styles.mentorAvatarEmoji}>🧠</Text>
          </View>
          <View>
            <Text style={styles.mentorName}>AI Mentor</Text>
            <Text style={styles.mentorStatus}>● Online • Knows your progress</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {isPending && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingEmoji}>🧠</Text>
          <Text style={styles.typingText}>AI Mentor is thinking...</Text>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your AI Mentor anything..."
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isPending}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.white, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mentorAvatarLarge: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  mentorAvatarEmoji: { fontSize: 28 },
  mentorName: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900 },
  mentorStatus: { fontSize: FontSize.xs, color: Colors.success, marginTop: 2 },
  messagesList: { padding: Spacing.md, paddingBottom: Spacing.xl },
  messageContainer: { marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  mentorAvatar: { fontSize: 24, marginBottom: 4 },
  messageBubble: { maxWidth: '80%', borderRadius: BorderRadius.xl, padding: Spacing.md },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadow.sm },
  messageText: { fontSize: FontSize.sm, lineHeight: 20 },
  userText: { color: Colors.white },
  assistantText: { color: Colors.gray800 },
  suggestions: { marginTop: Spacing.sm, gap: Spacing.xs },
  suggestionChip: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30' },
  suggestionText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  typingEmoji: { fontSize: 20 },
  typingText: { fontSize: FontSize.sm, color: Colors.gray500, flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200 },
  input: { flex: 1, borderWidth: 1.5, borderColor: Colors.gray300, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.gray900, maxHeight: 120, backgroundColor: Colors.gray100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.primary },
  sendButtonDisabled: { backgroundColor: Colors.gray300, shadowColor: 'transparent' },
  sendIcon: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
});
