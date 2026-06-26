import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, rh } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import Loader from '../../components/Loader';

import Ionicons from '@expo/vector-icons/Ionicons';

export const SettingsScreen = () => {
  const { logout } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Social Connect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (e) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (title, subtitle, onPress, isDestructive = false) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
          {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={isDestructive ? COLORS.error : COLORS.textMuted} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} message="Signing out..." />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem('Privacy Settings', 'Manage visibility and blocked users', () => {
            Alert.alert('Privacy Settings', 'Privacy settings configuration will be available in Phase 2.');
          })}
          {renderSettingItem('Security', 'Password changes and two-factor auth', () => {
            Alert.alert('Security Settings', 'Security settings configuration will be available in Phase 2.');
          })}
          {renderSettingItem('Notifications', 'Configure push alerts and email summaries', () => {
            Alert.alert('Notification Settings', 'Notification configuration will be available in Phase 2.');
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          {renderSettingItem('Help Center', 'FAQs, chat support, and user guides', () => {
            Alert.alert('Help Center', 'Help center resources will be available online soon.');
          })}
          {renderSettingItem('Terms of Service & Privacy Policy', 'Read our user agreements', () => {
            Alert.alert('Terms & Privacy', 'Standard legal documentation will be loaded.');
          })}
          {renderSettingItem('App Version', 'v1.0.0 (Phase 1 Build)', null)}
        </View>

        <View style={styles.section}>
          {renderSettingItem('Log Out', 'Sign out of your active account', handleLogout, true)}
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
  },
  header: {
    marginVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  section: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemTextContainer: {
    flex: 0.9,
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
  },
  itemSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemArrow: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  destructiveText: {
    color: COLORS.error,
  },
});

export default SettingsScreen;
