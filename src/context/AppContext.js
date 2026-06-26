import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { dbService } from '../services/dbService';

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const AppContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  // ─── Auth State ───
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // ─── Posts State ───
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  // ─── Notifications State ───
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscription refs for cleanup
  const postsUnsubRef = useRef(null);
  const notifsUnsubRef = useRef(null);

  // ═══════════════════════════════════════════
  // AUTH LISTENER
  // ═══════════════════════════════════════════
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((usr) => {
      setUser(usr);
      setAuthLoading(false);
      if (!usr) {
        // User logged out — reset all state
        setProfile(null);
        setPosts([]);
        setLikedPosts({});
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // ═══════════════════════════════════════════
  // LOAD PROFILE WHEN USER CHANGES
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const data = await dbService.getUserProfile(user.uid);
        setProfile(data);
      } catch (e) {
        console.error('AppContext: Error loading profile', e);
      }
    };
    loadProfile();
  }, [user]);

  // ═══════════════════════════════════════════
  // REAL-TIME SUBSCRIPTIONS
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (!user) return;

    // Subscribe to posts (real-time via onSnapshot / polling for mock)
    const unsubPosts = dbService.subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      // Re-check likes for the new posts
      recheckLikes(newPosts, user.uid);
    });
    postsUnsubRef.current = unsubPosts;

    // Subscribe to notifications
    const unsubNotifs = dbService.subscribeToNotifications(user.uid, (newNotifs) => {
      setNotifications(newNotifs);
      setUnreadCount(newNotifs.filter((n) => !n.isRead).length);
    });
    notifsUnsubRef.current = unsubNotifs;

    return () => {
      if (postsUnsubRef.current) postsUnsubRef.current();
      if (notifsUnsubRef.current) notifsUnsubRef.current();
    };
  }, [user]);

  const recheckLikes = async (postsList, uid) => {
    try {
      const likeMap = {};
      for (const post of postsList) {
        const liked = await dbService.checkIfUserLikedPost(post.postId, uid);
        likeMap[post.postId] = liked;
      }
      setLikedPosts(likeMap);
    } catch (e) {
      console.error('AppContext: error checking likes', e);
    }
  };

  // ═══════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const data = await dbService.getUserProfile(user.uid);
      setProfile(data);
    } catch (e) {
      console.error('AppContext: Error refreshing profile', e);
    }
  };

  const refreshPosts = async () => {
    setPostsLoading(true);
    try {
      const data = await dbService.getPosts();
      setPosts(data);
      if (user) {
        await recheckLikes(data, user.uid);
      }
    } catch (e) {
      console.error('AppContext: Error refreshing posts', e);
    } finally {
      setPostsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      const data = await dbService.getNotifications(user.uid);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (e) {
      console.error('AppContext: Error refreshing notifications', e);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleLike = async (post) => {
    if (!user) return;

    // Optimistic UI update
    const wasLiked = likedPosts[post.postId];
    setLikedPosts((prev) => ({ ...prev, [post.postId]: !wasLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === post.postId
          ? { ...p, likesCount: wasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1 }
          : p,
      ),
    );

    try {
      const result = await dbService.toggleLikePost(post.postId, user.uid, user.email);

      // If the user just liked it, send a notification to the post owner
      if (result.liked && post.userId !== user.uid) {
        await dbService.createNotification(
          post.userId,
          user.uid,
          profile?.fullName || user.email,
          profile?.profilePicture || '',
          'like',
          post.postId,
        );
      }
    } catch (e) {
      console.error('AppContext: Like error:', e);
      // Revert optimistic update
      setLikedPosts((prev) => ({ ...prev, [post.postId]: wasLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === post.postId
            ? { ...p, likesCount: wasLiked ? p.likesCount : Math.max(0, p.likesCount - 1) }
            : p,
        ),
      );
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await dbService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error('AppContext: Error marking notification read:', e);
    }
  };

  const logout = async () => {
    await authService.signOut();
  };

  // ═══════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════
  const value = {
    // Auth
    user,
    authLoading,
    profile,
    // Posts
    posts,
    postsLoading,
    likedPosts,
    // Notifications
    notifications,
    notificationsLoading,
    unreadCount,
    // Actions
    refreshProfile,
    refreshPosts,
    refreshNotifications,
    toggleLike,
    markNotificationRead,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
