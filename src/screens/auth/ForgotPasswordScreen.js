import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { authService } from '../../services/authService';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .trim(),
});

import Ionicons from '@expo/vector-icons/Ionicons';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email);
      Alert.alert(
        'Email Sent',
        `A password reset link has been sent to ${values.email}. Please check your inbox.`,
        [{ text: 'Back to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error(error);
      let errorMessage = 'Could not send password reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user is registered with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Loader visible={loading} message="Sending Reset Link..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            <Text style={styles.backButtonText}> Back to Sign In</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address below and we'll send you instructions to reset your password.
          </Text>
        </View>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <CustomInput
                label="Email Address"
                placeholder="example@email.com"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                touched={touched.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <CustomButton
                title="Send Instructions"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  backButtonText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    marginTop: 40,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: SPACING.md,
  },
});

export default ForgotPasswordScreen;
