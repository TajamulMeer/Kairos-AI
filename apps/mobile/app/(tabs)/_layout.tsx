import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="practice"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📚" label="Practice" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tests"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📝" label="Tests" focused={focused} /> }}
      />
      <Tabs.Screen
        name="mentor"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🧠" label="AI Mentor" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    height: 80,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIcon: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 22, opacity: 0.5 },
  emojiFocused: { opacity: 1 },
  label: { fontSize: 9, color: Colors.gray400, fontWeight: '600' },
  labelFocused: { color: Colors.primary },
});
