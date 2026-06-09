import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, FontSize} from '@constants/theme';
import {AppStackParamList, MainTabParamList} from './types';

// Screens
import HomeScreen from '@screens/Home/HomeScreen';
import PracticeScreen from '@screens/Practice/PracticeScreen';
import TestsScreen from '@screens/Tests/TestsScreen';
import MentorScreen from '@screens/Mentor/MentorScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import TestStartScreen from '@screens/Tests/TestStartScreen';
import TestSessionScreen from '@screens/Tests/TestSessionScreen';
import TestResultScreen from '@screens/Tests/TestResultScreen';
import DoubtSolverScreen from '@screens/DoubtSolver/DoubtSolverScreen';
import FlashcardsScreen from '@screens/Flashcards/FlashcardsScreen';
import StudyPlanScreen from '@screens/StudyPlan/StudyPlanScreen';
import AnalyticsScreen from '@screens/Analytics/AnalyticsScreen';
import LeaderboardScreen from '@screens/Leaderboard/LeaderboardScreen';
import RankPredictorScreen from '@screens/RankPredictor/RankPredictorScreen';
import AchievementsScreen from '@screens/Achievements/AchievementsScreen';
import SubscriptionScreen from '@screens/Subscription/SubscriptionScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import RevisionScreen from '@screens/Revision/RevisionScreen';
import PracticeSessionScreen from '@screens/Practice/PracticeSessionScreen';
import NotificationsScreen from '@screens/Notifications/NotificationsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function TabIcon({emoji, label, focused}: {emoji: string; label: string; focused: boolean}) {
  return (
    <View style={styles.tabIcon}>
      <Text style={{fontSize: 22, opacity: focused ? 1 : 0.45}}>{emoji}</Text>
      <Text style={[styles.tabLabel, {color: focused ? Colors.primary : Colors.gray400}]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: ({focused}) => <TabIcon emoji="🏠" label="Home" focused={focused} />}} />
      <Tab.Screen name="Practice" component={PracticeScreen} options={{tabBarIcon: ({focused}) => <TabIcon emoji="📚" label="Practice" focused={focused} />}} />
      <Tab.Screen name="Tests" component={TestsScreen} options={{tabBarIcon: ({focused}) => <TabIcon emoji="📝" label="Tests" focused={focused} />}} />
      <Tab.Screen name="Mentor" component={MentorScreen} options={{tabBarIcon: ({focused}) => <TabIcon emoji="🧠" label="Mentor" focused={focused} />}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: ({focused}) => <TabIcon emoji="👤" label="Profile" focused={focused} />}} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="TestStart" component={TestStartScreen} />
      <Stack.Screen name="TestSession" component={TestSessionScreen} />
      <Stack.Screen name="TestResult" component={TestResultScreen} />
      <Stack.Screen name="DoubtSolver" component={DoubtSolverScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
      <Stack.Screen name="StudyPlan" component={StudyPlanScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="RankPredictor" component={RankPredictorScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Revision" component={RevisionScreen} />
      <Stack.Screen name="PracticeSession" component={PracticeSessionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray200, height: 80, paddingBottom: 12, paddingTop: 8, elevation: 8},
  tabIcon: {alignItems: 'center', gap: 2},
  tabLabel: {fontSize: 9, fontWeight: '600'},
});
