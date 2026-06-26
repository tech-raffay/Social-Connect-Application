import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh, rf } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { dbService } from '../../services/dbService';
import CustomButton from '../../components/CustomButton';

export const ProfileScreen = ({ navigation }) => {
  const { user, profile, refreshProfile, logout } = useAppContext();
  const [userPosts, setUserPosts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (user) {
        dbService.getUserPosts(user.uid).then(setUserPosts).catch(console.error);
      }
    }, [user]),
  );

  const getInitials = () => {
    if (profile && profile.fullName) {
      return profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user && user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'SC';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const renderPostGrid = ({ item }) => (
    <TouchableOpacity
      style={styles.postGridItem}
      onPress={() => navigation.navigate('HomeMain')}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.postGridImage} />
      ) : (
        <View style={styles.postGridTextOnly}>
          <Text style={styles.postGridCaption} numberOfLines={3}>
            {item.caption || 'Post'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Instagram Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{profile?.fullName?.toLowerCase().replace(/\s+/g, '_') || 'my_profile'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Instagram Bio/Stats Row */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.profileHeaderSection}>
          <View style={styles.avatarStatsRow}>
            {/* Avatar container */}
            <View style={styles.avatarContainer}>
              {profile && profile.profilePicture ? (
                <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
              )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>142</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>254</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
            </View>
          </View>

          {/* Name & Bio Details */}
          <View style={styles.bioSection}>
            <Text style={styles.fullName}>
              {profile && profile.fullName ? profile.fullName : 'Social Connect User'}
            </Text>
            <Text style={styles.email}>{user ? user.email : ''}</Text>
            <Text style={styles.bioText}>
              {profile && profile.bio ? profile.bio : 'No bio added yet. Tap Edit Profile to describe yourself.'}
            </Text>
          </View>

          {/* Instagram Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.instagramButton}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <Text style={styles.instagramButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.instagramButton, styles.logoutInstagramButton]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.instagramButtonText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tab Divider for Posts Grid */}
        <View style={styles.tabDividerRow}>
          <View style={styles.activeTabIndicator}>
            <Ionicons name="grid" size={20} color={COLORS.white} />
          </View>
        </View>

        {/* User Posts Grid */}
        {userPosts.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.gridContainer}>
            <View style={styles.postsGrid}>
              {userPosts.map((item) => (
                <TouchableOpacity
                  key={item.postId}
                  style={styles.postGridItem}
                  onPress={() => navigation.navigate('Comments', { post: item })}
                  activeOpacity={0.8}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.postGridImage} />
                  ) : (
                    <View style={styles.postGridTextOnly}>
                      <Text style={styles.postGridCaption} numberOfLines={3}>
                        {item.caption || 'Post'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.emptyFeedContainer}>
            <Ionicons name="camera-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyFeedText}>No Posts Yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 4,
  },
  profileHeaderSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  avatarStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: rw(22),
    height: rw(22),
    borderRadius: rw(11),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c13584',
    padding: 3,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: rw(10),
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: rw(10),
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginLeft: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bioSection: {
    marginTop: SPACING.md,
    paddingHorizontal: 2,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.white,
    marginTop: 6,
    lineHeight: 18,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  instagramButton: {
    flex: 0.48,
    backgroundColor: COLORS.surfaceLight,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutInstagramButton: {
    backgroundColor: 'rgba(255, 48, 64, 0.1)',
  },
  instagramButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  logoutText: {
    color: COLORS.error,
  },
  tabDividerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  activeTabIndicator: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.white,
  },
  gridContainer: {
    paddingTop: 2,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postGridItem: {
    width: rw(33.1),
    aspectRatio: 1,
    margin: 0.5,
    backgroundColor: COLORS.surface,
  },
  postGridImage: {
    width: '100%',
    height: '100%',
  },
  postGridTextOnly: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
  },
  postGridCaption: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyFeedText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    fontWeight: '600',
  },
});

export default ProfileScreen;
