import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh, rf } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { formatRelativeTime, getInitials } from '../../utils';

// ─── Animated Like Button Component ───
const AnimatedLikeButton = ({ isLiked, likesCount, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withSpring(1.4, { damping: 4, stiffness: 300 }),
      withSpring(0.8, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={26}
          color={isLiked ? COLORS.secondary : COLORS.text}
        />
      </Animated.View>
      <Text style={[styles.actionCount, isLiked && styles.likedCount]}>
        {likesCount || 0}
      </Text>
    </TouchableOpacity>
  );
};

export const HomeScreen = ({ navigation }) => {
  const {
    user,
    posts,
    postsLoading,
    likedPosts,
    refreshPosts,
    toggleLike,
  } = useAppContext();

  const [refreshing, setRefreshing] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);

  useFocusEffect(
    useCallback(() => {
      if (initialLoad && posts.length === 0) {
        refreshPosts().finally(() => setInitialLoad(false));
      }
    }, [initialLoad, posts.length]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const handleLike = (post) => {
    toggleLike(post);
  };

  const navigateToUserProfile = (userId, userName) => {
    // Don't navigate to own profile via this route
    if (user && userId === user.uid) {
      navigation.navigate('Profile');
      return;
    }
    navigation.navigate('UserProfile', { userId, userName });
  };

  const renderPostItem = ({ item }) => {
    const isLiked = likedPosts[item.postId];

    return (
      <View style={styles.postCard}>
        {/* Author Header */}
        <TouchableOpacity
          style={styles.postHeader}
          onPress={() => navigateToUserProfile(item.userId, item.userFullName)}
          activeOpacity={0.7}
        >
          {item.userProfilePicture ? (
            <Image source={{ uri: item.userProfilePicture }} style={styles.authorAvatar} />
          ) : (
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorInitials}>{getInitials(item.userFullName)}</Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.userFullName || 'User'}</Text>
            <Text style={styles.postTime}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {/* Post Image */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <AnimatedLikeButton
            isLiked={isLiked}
            likesCount={item.likesCount}
            onPress={() => handleLike(item)}
          />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Comments', { post: item })}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.text} />
            <Text style={styles.actionCount}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {item.caption ? (
          <View style={styles.captionContainer}>
            <Text
              style={styles.captionAuthor}
              onPress={() => navigateToUserProfile(item.userId, item.userFullName)}
            >
              {item.userFullName}{' '}
            </Text>
            <Text style={styles.captionText}>{item.caption}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderEmptyFeed = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share a moment! Tap the + tab to create your first post.
      </Text>
    </View>
  );

  if (initialLoad && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Social Connect</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.postId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyFeed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.surface}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: rh(1.5),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xl,
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

  // Post Card
  postCard: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#c13584',
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c13584',
  },
  authorInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
  },
  likedCount: {
    color: COLORS.secondary,
  },

  // Caption
  captionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  captionAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  captionText: {
    fontSize: 14,
    color: COLORS.text,
    flexShrink: 1,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: rh(12),
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginTop: 16,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
});

export default HomeScreen;
