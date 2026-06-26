import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh, rf } from '../../constants/theme';
import { dbService } from '../../services/dbService';
import { getInitials, formatRelativeTime } from '../../utils';

import Ionicons from '@expo/vector-icons/Ionicons';

export const UserProfileScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [profileData, postsData] = await Promise.all([
          dbService.getUserProfile(userId),
          dbService.getUserPosts(userId),
        ]);
        setProfile(profileData);
        setUserPosts(postsData);
      } catch (e) {
        console.error('Error loading user profile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [userId]);

  const displayName = profile?.fullName || userName || 'User';
  const displayBio = profile?.bio || 'No bio available.';
  const displayPicture = profile?.profilePicture || '';

  const renderPostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postGridItem}
      onPress={() => navigation.navigate('Comments', { post: item })}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.postGridImage} />
      ) : (
        <View style={styles.postGridTextOnly}>
          <Text style={styles.postGridCaption} numberOfLines={4}>
            {item.caption || 'Post'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        {displayPicture ? (
          <Image source={{ uri: displayPicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{displayName}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userPosts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <Text style={styles.bioTitle}>Bio</Text>
        <Text style={styles.bioText}>{displayBio}</Text>
      </View>

      <View style={styles.divider} />
      <Text style={styles.postsGridTitle}>
        Posts ({userPosts.length})
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={userPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.postId}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderProfileHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.gridRow}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    ...TYPOGRAPHY.subbody,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },
  headerSpacer: {
    width: rw(12),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  avatarContainer: {
    width: rw(28),
    height: rw(28),
    borderRadius: rw(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 3,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: rw(13),
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: rw(13),
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: rf(3.5),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bioContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.xs,
  },
  bioText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  postsGridTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },

  // Post Grid
  gridRow: {
    justifyContent: 'flex-start',
    gap: 2,
  },
  postGridItem: {
    width: rw(31.5),
    aspectRatio: 1,
    margin: 1,
    borderRadius: 4,
    overflow: 'hidden',
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

export default UserProfileScreen;
