import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh, rf } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { dbService } from '../../services/dbService';
import { formatRelativeTime, getInitials } from '../../utils';

export const CommentsScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const { user, profile } = useAppContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await dbService.getComments(post.postId);
        setComments(data);
      } catch (e) {
        console.error('Error loading comments:', e);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [post.postId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || sending || !user) return;

    setSending(true);
    try {
      const comment = await dbService.addComment(
        post.postId,
        user.uid,
        profile?.fullName || user.email,
        profile?.profilePicture || '',
        newComment.trim(),
      );

      setComments(prev => [...prev, comment]);
      setNewComment('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send notification to post author (if not self)
      if (post.userId !== user.uid) {
        await dbService.createNotification(
          post.userId,
          user.uid,
          profile?.fullName || user.email,
          profile?.profilePicture || '',
          'comment',
          post.postId,
        );
      }
    } catch (e) {
      console.error('Error sending comment:', e);
    } finally {
      setSending(false);
    }
  };

  const navigateToUserProfile = (userId, userName) => {
    if (user && userId === user.uid) return;
    navigation.navigate('UserProfile', { userId, userName });
  };

  const renderCommentItem = ({ item, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(300)}
      style={styles.commentItem}
    >
      <TouchableOpacity
        onPress={() => navigateToUserProfile(item.userId, item.userFullName)}
        activeOpacity={0.7}
      >
        {item.userProfilePicture ? (
          <Image source={{ uri: item.userProfilePicture }} style={styles.commentAvatar} />
        ) : (
          <View style={styles.commentAvatarPlaceholder}>
            <Text style={styles.commentInitials}>{getInitials(item.userFullName)}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.commentBody}>
        <View style={styles.commentBubble}>
          <Text
            style={styles.commentAuthor}
            onPress={() => navigateToUserProfile(item.userId, item.userFullName)}
          >
            {item.userFullName}
          </Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        <Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </Animated.View>
  );

  const renderPostHeader = () => (
    <View style={styles.postPreview}>
      <TouchableOpacity
        style={styles.postPreviewHeader}
        onPress={() => navigateToUserProfile(post.userId, post.userFullName)}
        activeOpacity={0.7}
      >
        {post.userProfilePicture ? (
          <Image source={{ uri: post.userProfilePicture }} style={styles.postAuthorAvatar} />
        ) : (
          <View style={styles.postAuthorAvatarPlaceholder}>
            <Text style={styles.postAuthorInitials}>{getInitials(post.userFullName)}</Text>
          </View>
        )}
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthorName}>{post.userFullName || 'User'}</Text>
          <Text style={styles.postTimeText}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
      </TouchableOpacity>
      {post.caption ? <Text style={styles.postCaption}>{post.caption}</Text> : null}
      <View style={styles.divider} />
      <Text style={styles.commentsTitle}>
        Comments ({comments.length})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.commentId}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderPostHeader}
            ListEmptyComponent={
              <View style={styles.emptyComments}>
                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!newComment.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSendComment}
            disabled={!newComment.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.md,
  },

  // Post Preview
  postPreview: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorAvatar: {
    width: rw(9),
    height: rw(9),
    borderRadius: rw(4.5),
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  postAuthorAvatarPlaceholder: {
    width: rw(9),
    height: rw(9),
    borderRadius: rw(4.5),
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorInitials: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: COLORS.white,
  },
  postAuthorInfo: {
    marginLeft: SPACING.sm,
  },
  postAuthorName: {
    ...TYPOGRAPHY.subbody,
    fontWeight: '700',
    color: COLORS.white,
  },
  postTimeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  postCaption: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  commentsTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },

  // Comment Items
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  commentAvatar: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(4),
  },
  commentAvatarPlaceholder: {
    width: rw(8),
    height: rw(8),
    borderRadius: rw(4),
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInitials: {
    fontSize: rf(1.4),
    fontWeight: '800',
    color: COLORS.white,
  },
  commentBody: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  commentBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentAuthor: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  commentText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  commentTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: SPACING.sm,
    fontSize: rf(1.2),
  },

  // Empty
  emptyComments: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    ...TYPOGRAPHY.subbody,
    maxHeight: rh(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  sendBtnText: {
    fontSize: rf(2.2),
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default CommentsScreen;
