import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY, rw, rh } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { dbService } from '../../services/dbService';
import { storageService } from '../../services/storageService';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';

export const CreatePostScreen = ({ navigation }) => {
  const { user, profile, refreshPosts } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSelectImage = () => {
    Alert.alert('Add Photo', 'Choose a source for your post image:', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
            return;
          }
          try {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setSelectedImage(result.assets[0].uri);
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not open camera.');
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required to choose a photo.');
            return;
          }
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setSelectedImage(result.assets[0].uri);
            }
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not open photo library.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePost = async () => {
    if (!selectedImage) {
      Alert.alert('Missing Photo', 'Please select an image for your post.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      // Generate a temporary ID for the storage path
      const tempPostId = 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

      // Upload image
      const imageUrl = await storageService.uploadPostImage(tempPostId, selectedImage, (progress) => {
        setUploadProgress(progress);
      });

      // Save post metadata
      await dbService.createPost(
        user.uid,
        profile?.fullName || 'User',
        profile?.profilePicture || '',
        imageUrl,
        caption.trim(),
      );

      // Refresh global posts state
      await refreshPosts();

      Alert.alert('Posted!', 'Your post is now live.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);

      // Reset form
      setSelectedImage(null);
      setCaption('');
    } catch (e) {
      console.error('Post creation error:', e);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getLoaderMessage = () => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      return `Uploading Image: ${uploadProgress}%`;
    }
    return 'Publishing Post...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message={getLoaderMessage()} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>New Post</Text>
        </View>

        <TouchableOpacity style={styles.imageSelector} onPress={handleSelectImage} activeOpacity={0.8}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.imagePlaceholderText}>Tap to add a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity
            style={styles.removeImageBtn}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.7}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="close-circle" size={18} color={COLORS.error} />
              <Text style={styles.removeImageText}> Remove Photo</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.captionContainer}>
          <Text style={styles.captionLabel}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Write something about this moment..."
            placeholderTextColor={COLORS.textMuted}
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        <CustomButton
          title="Share Post"
          onPress={handlePost}
          loading={loading}
          disabled={!selectedImage}
          style={styles.postButton}
        />
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
    padding: SPACING.lg,
  },
  header: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  imageSelector: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: rw(6),
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: SPACING.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: rw(5.5),
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  imagePlaceholderText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  removeImageBtn: {
    alignSelf: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  removeImageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '700',
  },
  captionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  captionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  captionInput: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    minHeight: rh(10),
    paddingTop: 0,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  postButton: {
    marginTop: SPACING.lg,
  },
});

export default CreatePostScreen;
