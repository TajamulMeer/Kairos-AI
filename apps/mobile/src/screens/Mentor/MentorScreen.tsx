import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  '📅 Give me today\'s study plan',
  '📊 How am I performing?',
  '🔮 What topics should I revise?',
  '🎯 Tips for NEET last-minute prep',
];

export default function MentorScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AIRIX AI Mentor 🧠\n\nI can help you with:\n- Personalized study plans\n- Performance analysis\n- Exam strategy\n- Motivation & tips\n\nWhat would you like to discuss?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      apiClient.post(ENDPOINTS.AI_MENTOR_CHAT, {message, sessionId}).then(r => r.data),
    onSuccess: (data, message) => {
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [
        ...prev,
        {id: Date.now().toString(), role: 'assistant', content: data.response, timestamp: new Date()},
      ]);
    },
  });

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [
      ...prev,
      {id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date()},
    ]);
    sendMutation.mutate(msg);
    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🧠</Text>
        <View>
          <Text style={styles.headerTitle}>AI Mentor</Text>
          <Text style={styles.headerSub}>Powered by AIRIX AI</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        ListFooterComponent={
          sendMutation.isPending ? (
            <View style={[styles.bubble, styles.assistantBubble, {paddingVertical: Spacing.md}]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({item}) => (
          <View style={[styles.messageRow, item.role === 'user' && styles.messageRowUser]}>
            {item.role === 'assistant' && <Text style={styles.avatar}>🧠</Text>}
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              {item.role === 'assistant' ? (
                <Markdown style={markdownStyles}>{item.content}</Markdown>
              ) : (
                <Text style={styles.userText}>{item.content}</Text>
              )}
            </View>
          </View>
        )}
      />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => send(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your AI mentor..."
            placeholderTextColor={Colors.gray400}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => send()} disabled={!input.trim() || sendMutation.isPending}>
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: {fontSize: FontSize.md, color: Colors.gray800, lineHeight: 22},
  strong: {fontWeight: '700' as any},
  bullet_list: {marginLeft: Spacing.sm},
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200, gap: Spacing.md},
  headerEmoji: {fontSize: 32},
  headerTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  headerSub: {fontSize: FontSize.xs, color: Colors.gray400},
  onlineDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, marginLeft: 'auto'},
  list: {flex: 1},
  listContent: {padding: Spacing.md, gap: Spacing.md},
  messageRow: {flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm},
  messageRowUser: {flexDirection: 'row-reverse'},
  avatar: {fontSize: 22},
  bubble: {maxWidth: '80%', borderRadius: BorderRadius.xl, padding: Spacing.md},
  assistantBubble: {backgroundColor: Colors.white, ...Shadow.sm},
  userBubble: {backgroundColor: Colors.primary},
  userText: {color: Colors.white, fontSize: FontSize.md, lineHeight: 22},
  suggestions: {padding: Spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  suggestionChip: {borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm},
  suggestionText: {color: Colors.primary, fontSize: FontSize.sm, fontWeight: '500'},
  inputRow: {flexDirection: 'row', padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200, gap: Spacing.sm, alignItems: 'flex-end'},
  input: {flex: 1, backgroundColor: Colors.gray100, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: FontSize.md, color: Colors.gray900, maxHeight: 120},
  sendBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.full, width: 44, height: 44, justifyContent: 'center', alignItems: 'center'},
  sendBtnText: {color: Colors.white, fontSize: FontSize.xl, fontWeight: '900'},
});
