import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ──────────────────────────────────────────────
// Configure notification handler (how notifications appear when app is in foreground)
// ──────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ──────────────────────────────────────────────
// Notification Service
// ──────────────────────────────────────────────
export const notificationService = {
  /**
   * Request notification permissions from the user
   */
  requestPermissions: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted.');
        return false;
      }

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('social-connect', {
          name: 'Social Connect',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
          sound: 'default',
        });
      }

      console.log('Notification permissions granted.');
      return true;
    } catch (e) {
      console.warn('notificationService: Error requesting permissions', e);
      return false;
    }
  },

  /**
   * Schedule an immediate local push notification
   * @param {string} title
   * @param {string} body
   * @param {object} data Optional data payload
   */
  scheduleLocalNotification: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // null = immediately
      });
    } catch (e) {
      console.warn('notificationService: Error scheduling notification', e);
    }
  },

  /**
   * Get the push token (for future FCM integration)
   */
  getPushToken: async () => {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (e) {
      console.warn('notificationService: Error getting push token', e);
      return null;
    }
  },
};

export default notificationService;
