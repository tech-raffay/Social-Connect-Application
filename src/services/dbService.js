import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

let isFirebaseAvailable = true;

try {
  firestore();
  console.log('Firebase Firestore is available.');
} catch (e) {
  console.warn('Firebase Firestore initialization failed. Using Mock database.');
  isFirebaseAvailable = false;
}

// ──────────────────────────────────────────────
// Helper: Mock data storage keys
// ──────────────────────────────────────────────
const MOCK_POSTS_KEY = '@social_connect_posts';
const MOCK_NOTIFICATIONS_KEY = '@social_connect_notifications';

const getMockPosts = async () => {
  const json = await AsyncStorage.getItem(MOCK_POSTS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveMockPosts = async (posts) => {
  await AsyncStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
};

const getMockNotifications = async () => {
  const json = await AsyncStorage.getItem(MOCK_NOTIFICATIONS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveMockNotifications = async (notifications) => {
  await AsyncStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// ──────────────────────────────────────────────
// Database Service
// ──────────────────────────────────────────────
export const dbService = {

  // ═══════════════════════════════════════════
  // USER PROFILES
  // ═══════════════════════════════════════════

  getUserProfile: async (uid) => {
    if (isFirebaseAvailable) {
      try {
        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
          return doc.data();
        }
        return null;
      } catch (e) {
        console.warn('Firestore getUserProfile error, using Mock database.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    const profileJson = await AsyncStorage.getItem(`@social_connect_profile_${uid}`);
    return profileJson ? JSON.parse(profileJson) : null;
  },

  updateUserProfile: async (uid, profileData) => {
    const dataToSave = {
      uid,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAvailable) {
      try {
        await firestore().collection('users').doc(uid).set(dataToSave, { merge: true });
        return dataToSave;
      } catch (e) {
        console.warn('Firestore updateUserProfile error, using Mock database.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    await AsyncStorage.setItem(`@social_connect_profile_${uid}`, JSON.stringify(dataToSave));
    return dataToSave;
  },

  // ═══════════════════════════════════════════
  // POSTS
  // ═══════════════════════════════════════════

  createPost: async (userId, userFullName, userProfilePicture, imageUrl, caption) => {
    const postData = {
      userId,
      userFullName: userFullName || 'Anonymous',
      userProfilePicture: userProfilePicture || '',
      imageUrl: imageUrl || '',
      caption: caption || '',
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAvailable) {
      try {
        const docRef = await firestore().collection('posts').add({
          ...postData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        return { ...postData, postId: docRef.id };
      } catch (e) {
        console.warn('Firestore createPost error, using Mock database.', e.message);
      }
    }

    // Mock
    const postId = 'mock-post-' + Math.random().toString(36).substring(2, 9);
    const post = { ...postData, postId };
    const posts = await getMockPosts();
    posts.unshift(post);
    await saveMockPosts(posts);
    return post;
  },

  getPosts: async () => {
    if (isFirebaseAvailable) {
      try {
        const snapshot = await firestore()
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        return snapshot.docs.map(doc => ({
          postId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Firestore getPosts error, using Mock database.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    return await getMockPosts();
  },

  getUserPosts: async (userId) => {
    if (isFirebaseAvailable) {
      try {
        const snapshot = await firestore()
          .collection('posts')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        return snapshot.docs.map(doc => ({
          postId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Firestore getUserPosts error, using Mock database.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    const posts = await getMockPosts();
    return posts.filter(p => p.userId === userId);
  },

  // ═══════════════════════════════════════════
  // LIKES
  // ═══════════════════════════════════════════

  checkIfUserLikedPost: async (postId, userId) => {
    if (isFirebaseAvailable) {
      try {
        const doc = await firestore()
          .collection('posts')
          .doc(postId)
          .collection('likes')
          .doc(userId)
          .get();
        return doc.exists;
      } catch (e) {
        console.warn('Firestore checkIfUserLikedPost error.', e.message);
      }
    }
    // Mock
    const key = `@social_connect_like_${postId}_${userId}`;
    const val = await AsyncStorage.getItem(key);
    return val === 'true';
  },

  toggleLikePost: async (postId, userId, userFullName) => {
    if (isFirebaseAvailable) {
      try {
        const likeRef = firestore()
          .collection('posts')
          .doc(postId)
          .collection('likes')
          .doc(userId);
        const postRef = firestore().collection('posts').doc(postId);

        const likeDoc = await likeRef.get();
        if (likeDoc.exists) {
          // Unlike
          await likeRef.delete();
          await postRef.update({ likesCount: firestore.FieldValue.increment(-1) });
          return { liked: false };
        } else {
          // Like
          await likeRef.set({
            userId,
            userFullName: userFullName || 'User',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          await postRef.update({ likesCount: firestore.FieldValue.increment(1) });
          return { liked: true };
        }
      } catch (e) {
        console.warn('Firestore toggleLikePost error.', e.message);
      }
    }

    // Mock
    const key = `@social_connect_like_${postId}_${userId}`;
    const existing = await AsyncStorage.getItem(key);
    const posts = await getMockPosts();
    const postIndex = posts.findIndex(p => p.postId === postId);

    if (existing === 'true') {
      await AsyncStorage.removeItem(key);
      if (postIndex !== -1) {
        posts[postIndex].likesCount = Math.max(0, (posts[postIndex].likesCount || 0) - 1);
      }
      await saveMockPosts(posts);
      return { liked: false };
    } else {
      await AsyncStorage.setItem(key, 'true');
      if (postIndex !== -1) {
        posts[postIndex].likesCount = (posts[postIndex].likesCount || 0) + 1;
      }
      await saveMockPosts(posts);
      return { liked: true };
    }
  },

  // ═══════════════════════════════════════════
  // COMMENTS
  // ═══════════════════════════════════════════

  addComment: async (postId, userId, userFullName, userProfilePicture, text) => {
    const commentData = {
      postId,
      userId,
      userFullName: userFullName || 'User',
      userProfilePicture: userProfilePicture || '',
      text,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseAvailable) {
      try {
        const docRef = await firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .add({
            ...commentData,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        // Atomically increment commentsCount
        await firestore()
          .collection('posts')
          .doc(postId)
          .update({ commentsCount: firestore.FieldValue.increment(1) });

        return { ...commentData, commentId: docRef.id };
      } catch (e) {
        console.warn('Firestore addComment error.', e.message);
      }
    }

    // Mock
    const commentId = 'mock-comment-' + Math.random().toString(36).substring(2, 9);
    const comment = { ...commentData, commentId };
    const commentsKey = `@social_connect_comments_${postId}`;
    const commentsJson = await AsyncStorage.getItem(commentsKey);
    const comments = commentsJson ? JSON.parse(commentsJson) : [];
    comments.push(comment);
    await AsyncStorage.setItem(commentsKey, JSON.stringify(comments));

    // Increment commentsCount on mock post
    const posts = await getMockPosts();
    const postIndex = posts.findIndex(p => p.postId === postId);
    if (postIndex !== -1) {
      posts[postIndex].commentsCount = (posts[postIndex].commentsCount || 0) + 1;
      await saveMockPosts(posts);
    }
    return comment;
  },

  getComments: async (postId) => {
    if (isFirebaseAvailable) {
      try {
        const snapshot = await firestore()
          .collection('posts')
          .doc(postId)
          .collection('comments')
          .orderBy('createdAt', 'asc')
          .get();

        return snapshot.docs.map(doc => ({
          commentId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Firestore getComments error.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    const commentsKey = `@social_connect_comments_${postId}`;
    const commentsJson = await AsyncStorage.getItem(commentsKey);
    return commentsJson ? JSON.parse(commentsJson) : [];
  },

  // ═══════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════

  createNotification: async (receiverId, senderId, senderFullName, senderProfilePicture, type, postId) => {
    // Don't notify yourself
    if (receiverId === senderId) return null;

    const notifData = {
      receiverId,
      senderId,
      senderFullName: senderFullName || 'Someone',
      senderProfilePicture: senderProfilePicture || '',
      type,
      postId: postId || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // ── Trigger local push notification ──
    const pushTitle = 'Social Connect';
    let pushBody = `${senderFullName || 'Someone'} interacted with your content.`;
    if (type === 'like') {
      pushBody = `${senderFullName || 'Someone'} liked your post ❤️`;
    } else if (type === 'comment') {
      pushBody = `${senderFullName || 'Someone'} commented on your post 💬`;
    } else if (type === 'follow') {
      pushBody = `${senderFullName || 'Someone'} started following you 👤`;
    }
    notificationService.scheduleLocalNotification(pushTitle, pushBody, { type, postId });

    if (isFirebaseAvailable) {
      try {
        const docRef = await firestore().collection('notifications').add({
          ...notifData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        return { ...notifData, notificationId: docRef.id };
      } catch (e) {
        console.warn('Firestore createNotification error.', e.message);
      }
    }

    // Mock
    const notificationId = 'mock-notif-' + Math.random().toString(36).substring(2, 9);
    const notif = { ...notifData, notificationId };
    const notifications = await getMockNotifications();
    notifications.unshift(notif);
    await saveMockNotifications(notifications);
    return notif;
  },

  getNotifications: async (userId) => {
    if (isFirebaseAvailable) {
      try {
        const snapshot = await firestore()
          .collection('notifications')
          .where('receiverId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        return snapshot.docs.map(doc => ({
          notificationId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Firestore getNotifications error.', e.message);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    const notifications = await getMockNotifications();
    return notifications.filter(n => n.receiverId === userId);
  },

  markNotificationAsRead: async (notificationId) => {
    if (isFirebaseAvailable) {
      try {
        await firestore().collection('notifications').doc(notificationId).update({ isRead: true });
        return true;
      } catch (e) {
        console.warn('Firestore markNotificationAsRead error.', e.message);
      }
    }
    // Mock
    const notifications = await getMockNotifications();
    const idx = notifications.findIndex(n => n.notificationId === notificationId);
    if (idx !== -1) {
      notifications[idx].isRead = true;
      await saveMockNotifications(notifications);
    }
    return true;
  },

  // ═══════════════════════════════════════════
  // REAL-TIME SUBSCRIPTIONS
  // ═══════════════════════════════════════════

  /**
   * Subscribe to real-time post updates.
   * Uses Firestore onSnapshot when available, otherwise polls every 10s.
   * @param {function} callback Called with array of posts
   * @returns {function} Unsubscribe function
   */
  subscribeToPosts: (callback) => {
    if (isFirebaseAvailable) {
      try {
        const unsubscribe = firestore()
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .onSnapshot(
            (snapshot) => {
              const posts = snapshot.docs.map((doc) => ({
                postId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
                  ? doc.data().createdAt.toDate().toISOString()
                  : new Date().toISOString(),
              }));
              callback(posts);
            },
            (error) => {
              console.warn('Firestore subscribeToPosts error:', error.message);
            },
          );
        return unsubscribe;
      } catch (e) {
        console.warn('Firestore subscribeToPosts setup error:', e.message);
      }
    }

    // Mock fallback: poll every 10 seconds
    let isActive = true;
    const poll = async () => {
      while (isActive) {
        try {
          const posts = await getMockPosts();
          if (isActive) callback(posts);
        } catch (e) {
          console.error('Mock subscribeToPosts poll error:', e);
        }
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    };
    // Initial fetch
    getMockPosts().then((posts) => { if (isActive) callback(posts); });
    poll();
    return () => { isActive = false; };
  },

  /**
   * Subscribe to real-time notification updates for a specific user.
   * Uses Firestore onSnapshot when available, otherwise polls every 10s.
   * @param {string} userId
   * @param {function} callback Called with array of notifications
   * @returns {function} Unsubscribe function
   */
  subscribeToNotifications: (userId, callback) => {
    if (isFirebaseAvailable) {
      try {
        const unsubscribe = firestore()
          .collection('notifications')
          .where('receiverId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .onSnapshot(
            (snapshot) => {
              const notifs = snapshot.docs.map((doc) => ({
                notificationId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
                  ? doc.data().createdAt.toDate().toISOString()
                  : new Date().toISOString(),
              }));
              callback(notifs);
            },
            (error) => {
              console.warn('Firestore subscribeToNotifications error:', error.message);
            },
          );
        return unsubscribe;
      } catch (e) {
        console.warn('Firestore subscribeToNotifications setup error:', e.message);
      }
    }

    // Mock fallback: poll every 10 seconds
    let isActive = true;
    const poll = async () => {
      while (isActive) {
        try {
          const all = await getMockNotifications();
          const filtered = all.filter((n) => n.receiverId === userId);
          if (isActive) callback(filtered);
        } catch (e) {
          console.error('Mock subscribeToNotifications poll error:', e);
        }
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    };
    // Initial fetch
    getMockNotifications().then((all) => {
      const filtered = all.filter((n) => n.receiverId === userId);
      if (isActive) callback(filtered);
    });
    poll();
    return () => { isActive = false; };
  },
};
