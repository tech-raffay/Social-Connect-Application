import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, TYPOGRAPHY, rw, rf } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { dbService } from '../../services/dbService';
import { storageService } from '../../services/storageService';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';

import Ionicons from '@expo/vector-icons/Ionicons';

export const EditProfileScreen = ({ navigation }) => {
  const { user, profile: contextProfile, refreshProfile } = useAppContext();
  const [profile, setProfile] = useState({ fullName: '', bio: '', profilePicture: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const data = await dbService.getUserProfile(user.uid);
        if (data) {
          setProfile({
            fullName: data.fullName || '',
            bio: data.bio || '',
            profilePicture: data.profilePicture || '',
          });
        }
      } catch (e) {
        console.error('Error loading profile', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const getInitials = () => {
    if (profile.fullName) {
      return profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'SC';
  };

  const handleSelectImage = () => {
    Alert.alert(
      'Profile Picture',
      'Select an option to upload your profile photo:',
      [
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
          text: 'Photo Library',
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
      ]
    );
  };

  const handleSave = async () => {
    // Validate
    if (!profile.fullName.trim()) {
      setErrors({ fullName: 'Full name is required' });
      return;
    }

    setSaving(true);
    setUploadProgress(0);
    try {
      let profilePictureUrl = profile.profilePicture;

      // If user selected a new local image, upload it first
      if (selectedImage) {
        profilePictureUrl = await storageService.uploadProfilePicture(
          user.uid,
          selectedImage,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      }

      // Save profile metadata in Firestore / Database
      await dbService.updateUserProfile(user.uid, {
        fullName: profile.fullName.trim(),
        bio: profile.bio.trim(),
        profilePicture: profilePictureUrl,
        email: user.email,
      });

      // Refresh global profile state
      await refreshProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <Loader visible={loading} message="Loading Profile Info..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Loader
        visible={saving}
        message={uploadProgress > 0 && uploadProgress < 100 ? `Uploading Image: ${uploadProgress}%` : 'Saving Profile...'}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSelectImage}
            activeOpacity={0.8}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.avatar} />
            ) : profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>EDIT</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change profile picture</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Full Name"
            placeholder="John Doe"
            value={profile.fullName}
            onChangeText={(text) => {
              setProfile({ ...profile, fullName: text });
              if (errors.fullName) setErrors({});
            }}
            error={errors.fullName}
            touched={!!errors.fullName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <CustomInput
            label="Bio"
            placeholder="Write a brief bio about yourself..."
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            multiline
            numberOfLines={4}
            style={styles.bioInput}
            containerStyle={styles.bioContainer}
          />

          <CustomButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </View>
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
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: SPACING.lg,
    paddingVertical: SPACING.xs,
    zIndex: 10,
  },
  backButtonText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  header: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  avatarContainer: {
    width: rw(28),
    height: rw(28),
    borderRadius: rw(14),
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 3,
    backgroundColor: COLORS.surface,
    position: 'relative',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  editBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
    fontSize: rf(1.1),
  },
  avatarHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginTop: SPACING.md,
  },
  bioContainer: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  bioInput: {
    height: '100%',
    textAlignVertical: 'top',
    paddingTop: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default EditProfileScreen;
