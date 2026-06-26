import React from 'react';
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
import Animated, { FadeInRight } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh, rf } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { formatRelativeTime, getInitials } from '../../utils';

export const NotificationsScreen = () => {
  const {
    notifications,
    notificationsLoading,
    refreshNotifications,
    markNotificationRead,
  } = useAppContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notif) => {
    if (notif.isRead) return;
    markNotificationRead(notif.notificationId);
  };

  const getNotificationMessage = (notif) => {
    switch (notif.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your content';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={20} color={COLORS.secondary} />;
      case 'comment':
        return <Ionicons name="chatbubble" size={18} color={COLORS.primary} />;
      case 'follow':
        return <Ionicons name="person-add" size={18} color={COLORS.success} />;
      default:
        return <Ionicons name="notifications" size={18} color={COLORS.textMuted} />;
    }
  };

  const renderNotificationItem = ({ item, index }) => (
    <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
      <TouchableOpacity
        style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notifIconContainer}>
          {getNotificationIcon(item.type)}
        </View>

        {item.senderProfilePicture ? (
          <Image source={{ uri: item.senderProfilePicture }} style={styles.notifAvatar} />
        ) : (
          <View style={styles.notifAvatarPlaceholder}>
            <Text style={styles.notifInitials}>{getInitials(item.senderFullName)}</Text>
          </View>
        )}

        <View style={styles.notifBody}>
          <Text style={styles.notifText}>
            <Text style={styles.notifSender}>{item.senderFullName} </Text>
            {getNotificationMessage(item)}
          </Text>
          <Text style={styles.notifTime}>{formatRelativeTime(item.createdAt)}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        When someone likes or comments on your posts, you'll see it here.
      </Text>
    </View>
  );

  if (notificationsLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.notificationId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
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

  // Notification Item
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notifItemUnread: {
    backgroundColor: 'rgba(0, 149, 246, 0.06)',
  },
  notifIconContainer: {
    width: rw(8),
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: rf(2.2),
  },
  notifAvatar: {
    width: rw(11),
    height: rw(11),
    borderRadius: rw(5.5),
    marginLeft: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifAvatarPlaceholder: {
    width: rw(11),
    height: rw(11),
    borderRadius: rw(5.5),
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifInitials: {
    fontSize: rf(1.7),
    fontWeight: '800',
    color: COLORS.white,
  },
  notifBody: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  notifText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  notifSender: {
    fontWeight: '700',
    color: COLORS.white,
  },
  notifTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: rf(1.2),
  },
  unreadDot: {
    width: rw(2),
    height: rw(2),
    borderRadius: rw(1),
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },

  // Empty
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

export default NotificationsScreen;
