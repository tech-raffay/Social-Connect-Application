import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/main/HomeScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import CommentsScreen from '../screens/main/CommentsScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';
import { useAppContext } from '../context/AppContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// ─── Home Stack (Feed + Comments + UserProfile) ───
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Comments" component={CommentsScreen} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} />
    </HomeStack.Navigator>
  );
};

// ─── Profile Stack (Profile + Edit + Comments) ───
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Comments" component={CommentsScreen} />
    </ProfileStack.Navigator>
  );
};

// ─── Tab Screen Options ───
const getScreenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.text,
  tabBarInactiveTintColor: COLORS.textMuted,
  tabBarStyle: styles.tabBar,
  tabBarShowLabel: false, // Instagram doesn't show text labels under tab icons
  tabBarIcon: ({ color, focused, size }) => {
    let iconName = '';

    if (route.name === 'Home') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'Create') {
      iconName = focused ? 'add-circle' : 'add-circle-outline';
    } else if (route.name === 'Notifications') {
      iconName = focused ? 'heart' : 'heart-outline';
    } else if (route.name === 'Profile') {
      iconName = focused ? 'person' : 'person-outline';
    } else if (route.name === 'Settings') {
      iconName = focused ? 'settings' : 'settings-outline';
    }

    return (
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={26} color={color} />
      </View>
    );
  },
});

// ─── Main Tab Navigator ───
export const MainNavigator = () => {
  const { unreadCount } = useAppContext();

  return (
    <Tab.Navigator screenOptions={getScreenOptions}>
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  badge: {
    backgroundColor: COLORS.error,
    fontSize: 9,
    fontWeight: '700',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    lineHeight: 14,
  },
});

export default MainNavigator;
