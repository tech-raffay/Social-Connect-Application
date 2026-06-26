import storage from '@react-native-firebase/storage';

let isFirebaseAvailable = true;

try {
  // Try accessing storage
  storage();
  console.log('Firebase Storage is available.');
} catch (e) {
  console.warn('Firebase Storage initialization failed. Using Mock storage.');
  isFirebaseAvailable = false;
}

export const storageService = {
  /**
   * Upload user profile image
   * @param {string} uid User ID
   * @param {string} imageUri Local image URI from react-native-image-picker
   * @param {function} onProgress Callback for upload progress (0 to 100)
   */
  uploadProfilePicture: async (uid, imageUri, onProgress) => {
    if (isFirebaseAvailable && imageUri && !imageUri.startsWith('mock-')) {
      try {
        const fileExtension = imageUri.split('.').pop() || 'jpg';
        const reference = storage().ref(`profiles/${uid}.${fileExtension}`);
        
        const task = reference.putFile(imageUri);

        return new Promise((resolve, reject) => {
          task.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) {
                onProgress(Math.round(progress));
              }
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await reference.getDownloadURL();
              resolve(downloadURL);
            }
          );
        });
      } catch (e) {
        console.warn('Firebase Storage upload error, using Mock storage.', e.message);
      }
    }

    // Mock implementation
    console.log('Uploading mock image for uid:', uid, imageUri);
    // Simulate upload progress steps
    if (onProgress) {
      onProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(40);
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(80);
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(100);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    return imageUri; // Return local uri as the mock image url
  },

  /**
   * Upload post image to Firebase Storage
   * @param {string} postId Post ID
   * @param {string} imageUri Local image URI from react-native-image-picker
   * @param {function} onProgress Callback for upload progress (0 to 100)
   */
  uploadPostImage: async (postId, imageUri, onProgress) => {
    if (isFirebaseAvailable && imageUri && !imageUri.startsWith('mock-')) {
      try {
        const fileExtension = imageUri.split('.').pop() || 'jpg';
        const reference = storage().ref(`posts/${postId}.${fileExtension}`);

        const task = reference.putFile(imageUri);

        return new Promise((resolve, reject) => {
          task.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) {
                onProgress(Math.round(progress));
              }
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await reference.getDownloadURL();
              resolve(downloadURL);
            }
          );
        });
      } catch (e) {
        console.warn('Firebase Storage post upload error, using Mock storage.', e.message);
      }
    }

    // Mock implementation
    console.log('Uploading mock post image for postId:', postId, imageUri);
    if (onProgress) {
      onProgress(15);
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(50);
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(85);
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(100);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    return imageUri;
  },
};
