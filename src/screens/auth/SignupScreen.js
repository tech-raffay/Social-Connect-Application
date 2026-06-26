import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { authService } from '../../services/authService';
import { dbService } from '../../services/dbService';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';

const SignupSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Full name is required')
    .trim(),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .trim(),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const SignupScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      // Create user auth account
      const user = await authService.signUp(values.email, values.password, values.fullName);
      
      // Initialize firestore / db profile for new user (if real firebase; mock already handled this, but dbService handles both)
      await dbService.updateUserProfile(user.uid, {
        fullName: values.fullName,
        bio: '',
        profilePicture: '',
        email: values.email.toLowerCase(),
      });

    } catch (error) {
      console.error(error);
      let errorMessage = 'An unexpected error occurred during registration. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password chosen is too weak. Please use a stronger password.';
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Loader visible={loading} message="Creating Account..." />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Join Social Connect</Text>
          <Text style={styles.subtitle}>Create an account to start sharing and connecting.</Text>
        </View>

        <Formik
          initialValues={{ fullName: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <CustomInput
                label="Full Name"
                placeholder="John Doe"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={errors.fullName}
                touched={touched.fullName}
                autoCapitalize="words"
                autoCorrect={false}
              />

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

              <CustomInput
                label="Password"
                placeholder="Choose a password (min 6 characters)"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
                touched={touched.password}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <CustomInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <CustomButton
                title="Sign Up"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    textShadowColor: 'rgba(168, 85, 247, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.subbody,
    color: COLORS.textMuted,
  },
  loginText: {
    ...TYPOGRAPHY.subbody,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SignupScreen;
