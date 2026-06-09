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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Colors, FontSize, Spacing, BorderRadius, Shadow} from '@constants/theme';
import {apiClient} from '@services/api.service';
import {ENDPOINTS} from '@constants/api';
import Markdown from 'react-native-markdown-display';
import {launchImageLibrary} from 'react-native-image-picker';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUri?: string;
}

export default function DoubtSolverScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI Doubt Solver 🤖\n\nAsk me any **Physics**, **Chemistry**, **Biology**, or **Math** doubt.\n\nYou can:\n- Type your question\n- Upload a photo of your textbook/notes",
    },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const askMutation = useMutation({
    mutationFn: (payload: {doubt: string; imageBase64?: string; subject?: string}) =>
      apiClient.post(ENDPOINTS.AI_DOUBT_SOLVE, payload).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {id: Date.now().toString(), role: 'assistant', content: data.solution},
      ]);
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {id: Date.now().toString(), role: 'assistant', content: 'Sorry, I could not process your doubt. Please try again.'},
      ]);
    },
  });

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg: Message = {id: Date.now().toString(), role: 'user', content: msg};
    setMessages(prev => [...prev, userMsg]);
    askMutation.mutate({doubt: msg});
    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', includeBase64: true, quality: 0.8});
    if (result.assets?.[0]) {
      const asset = result.assets[0];
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '📷 Image uploaded for doubt solving',
        imageUri: asset.uri,
      };
      setMessages(prev => [...prev, userMsg]);
      askMutation.mutate({doubt: 'Solve the doubt shown in the image', imageBase64: asset.base64 || ''});
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Doubt Solver 🤔</Text>
        <View style={{width: 60}} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        ListFooterComponent={
          askMutation.isPending ? (
            <View style={[styles.bubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          ) : null
        }
        renderItem={({item}) => (
          <View style={[styles.row, item.role === 'user' && styles.rowUser]}>
            {item.role === 'assistant' && <Text style={styles.botAvatar}>🤖</Text>}
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              {item.role === 'assistant' ? (
                <Markdown style={mdStyles}>{item.content}</Markdown>
              ) : (
                <Text style={styles.userText}>{item.content}</Text>
              )}
            </View>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text style={{fontSize: 22}}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your doubt here..."
            placeholderTextColor={Colors.gray400}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || askMutation.isPending) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || askMutation.isPending}>
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const mdStyles = {
  body: {fontSize: FontSize.md, color: Colors.gray800, lineHeight: 22},
  code_block: {backgroundColor: Colors.gray100, borderRadius: 6, padding: 8},
  code_inline: {backgroundColor: Colors.gray100, borderRadius: 4, paddingHorizontal: 4},
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200},
  back: {color: Colors.primary, fontSize: FontSize.md, fontWeight: '600'},
  title: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900},
  list: {flex: 1},
  listContent: {padding: Spacing.md, gap: Spacing.md},
  row: {flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm},
  rowUser: {flexDirection: 'row-reverse'},
  botAvatar: {fontSize: 22},
  bubble: {maxWidth: '85%', borderRadius: BorderRadius.xl, padding: Spacing.md},
  assistantBubble: {backgroundColor: Colors.white, ...Shadow.sm},
  userBubble: {backgroundColor: Colors.primary},
  userText: {color: Colors.white, fontSize: FontSize.md, lineHeight: 22},
  thinkingText: {color: Colors.gray500, fontSize: FontSize.sm, marginLeft: Spacing.sm},
  inputRow: {flexDirection: 'row', padding: Spacing.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200, gap: Spacing.sm, alignItems: 'flex-end'},
  imageBtn: {padding: Spacing.sm},
  input: {flex: 1, backgroundColor: Colors.gray100, borderRadius: BorderRadius.xl, padding: Spacing.md, fontSize: FontSize.md, color: Colors.gray900, maxHeight: 120},
  sendBtn: {backgroundColor: Colors.primary, borderRadius: BorderRadius.full, width: 44, height: 44, justifyContent: 'center', alignItems: 'center'},
  sendBtnDisabled: {opacity: 0.5},
  sendBtnText: {color: Colors.white, fontSize: FontSize.xl, fontWeight: '900'},
});
