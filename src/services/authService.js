import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory state for auth listeners
let authListeners = [];
let currentUser = null;
let isFirebaseAvailable = true;

// Check if Firebase is available and configured
try {
  // Accessing currentUser will throw an error if Firebase is not linked
  auth().currentUser;
  console.log('Firebase Authentication is available.');
} catch (e) {
  console.warn('Firebase Auth initialization failed. Falling back to Mock service.', e.message);
  isFirebaseAvailable = false;
}

// Initial load for Mock User
const loadMockUser = async () => {
  if (isFirebaseAvailable) {
    console.log('authService: Firebase is available, skipping mock user load.');
    return;
  }
  try {
    console.log('authService: Loading mock user from AsyncStorage...');
    const userJson = await AsyncStorage.getItem('@social_connect_user');
    currentUser = userJson ? JSON.parse(userJson) : null;
    console.log('authService: Mock user loaded:', currentUser);
    notifyListeners();
  } catch (e) {
    console.error('authService: Failed to load mock user', e);
  }
};
loadMockUser();

const notifyListeners = () => {
  console.log('authService: Notifying auth listeners. Listener count:', authListeners.length);
  authListeners.forEach(callback => {
    try {
      callback(currentUser);
    } catch (err) {
      console.error('authService: Error in auth listener callback:', err);
    }
  });
};

export const authService = {
  /**
   * Monitor auth state changes
   * @param {function} callback 
   */
  onAuthStateChanged: (callback) => {
    console.log('authService: onAuthStateChanged called. Registering listener.');
    if (isFirebaseAvailable) {
      try {
        return auth().onAuthStateChanged((user) => {
          // Normalize firebase user
          const normalizedUser = user ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
          } : null;
          console.log('authService: Firebase auth state changed:', normalizedUser);
          callback(normalizedUser);
        });
      } catch (e) {
        console.warn('Firebase onAuthStateChanged error, using Mock auth listener.', e.message);
      }
    }
    
    // Fallback Mock listener
    authListeners.push(callback);
    // Send current status immediately
    console.log('authService: Scheduling immediate mock status delivery. currentUser:', currentUser);
    setTimeout(() => {
      console.log('authService: Delivering mock status to callback. currentUser:', currentUser);
      callback(currentUser);
    }, 100);

    // Return unsubscribe function
    return () => {
      console.log('authService: Unsubscribing auth listener.');
      authListeners = authListeners.filter(cb => cb !== callback);
    };
  },

  /**
   * Register a new user with email and password
   */
  signUp: async (email, password, fullName) => {
    if (isFirebaseAvailable) {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isMock: false,
        };
      } catch (e) {
        // Handle specific firebase errors or let screen handle it
        throw e;
      }
    }

    // Mock implementation
    console.log('Registering user with Mock Auth...', email);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

    // Check if user already exists
    const usersJson = await AsyncStorage.getItem('@social_connect_mock_users') || '[]';
    const users = JSON.parse(usersJson);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('The email address is already in use by another account.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const newUser = {
      uid: 'mock-uid-' + Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      fullName: fullName,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password });
    await AsyncStorage.setItem('@social_connect_mock_users', JSON.stringify(users));

    currentUser = { uid: newUser.uid, email: newUser.email, isMock: true };
    await AsyncStorage.setItem('@social_connect_user', JSON.stringify(currentUser));
    
    // Save details to mock DB as well
    const mockProfile = {
      uid: newUser.uid,
      fullName: fullName,
      bio: '',
      profilePicture: '',
      email: newUser.email,
    };
    await AsyncStorage.setItem(`@social_connect_profile_${newUser.uid}`, JSON.stringify(mockProfile));

    notifyListeners();
    return currentUser;
  },

  /**
   * Log in user with email and password
   */
  signIn: async (email, password) => {
    if (isFirebaseAvailable) {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isMock: false,
        };
      } catch (e) {
        throw e;
      }
    }

    // Mock implementation
    console.log('Logging in with Mock Auth...', email);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate latency

    const usersJson = await AsyncStorage.getItem('@social_connect_mock_users') || '[]';
    const users = JSON.parse(usersJson);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      const err = new Error('Invalid email or password.');
      err.code = 'auth/invalid-credentials';
      throw err;
    }

    currentUser = { uid: user.uid, email: user.email, isMock: true };
    await AsyncStorage.setItem('@social_connect_user', JSON.stringify(currentUser));
    
    notifyListeners();
    return currentUser;
  },

  /**
   * Send a password reset email
   */
  resetPassword: async (email) => {
    if (isFirebaseAvailable) {
      try {
        await auth().sendPasswordResetEmail(email);
        return true;
      } catch (e) {
        throw e;
      }
    }

    // Mock implementation
    console.log('Sending mock reset email to...', email);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const usersJson = await AsyncStorage.getItem('@social_connect_mock_users') || '[]';
    const users = JSON.parse(usersJson);
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      const err = new Error('No user found with this email.');
      err.code = 'auth/user-not-found';
      throw err;
    }
    
    return true;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    if (isFirebaseAvailable) {
      try {
        await auth().signOut();
        return true;
      } catch (e) {
        console.warn('Firebase signOut error', e.message);
      }
    }

    // Mock implementation
    console.log('Signing out from Mock Auth...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    currentUser = null;
    await AsyncStorage.removeItem('@social_connect_user');
    notifyListeners();
    return true;
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    if (isFirebaseAvailable) {
      try {
        const user = auth().currentUser;
        return user ? { uid: user.uid, email: user.email } : null;
      } catch (e) {
        // Fallback
      }
    }
    return currentUser;
  }
};
